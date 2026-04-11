#!/usr/bin/env python3
"""Run trigger evaluation for a skill description.

Tests whether a skill's description causes the AI to trigger (use the skill)
for a set of queries. Uses ai_backend.py for multi-backend support.

Supports two modes:
1. AI-judged evaluation (default): Uses AI to judge whether the skill
   should trigger for each query. Works with any AI backend.
2. CLI-based live evaluation: If claude CLI is available, can optionally
   run actual queries through it for more accurate trigger detection.
"""

import argparse
import json
import os
import subprocess
import sys
import time
import uuid
from concurrent.futures import ProcessPoolExecutor, as_completed
from pathlib import Path

from scripts.ai_backend import call_ai_trigger_eval, detect_backend
from scripts.utils import parse_skill_md


def find_project_root() -> Path:
    """Find the project root by walking up from cwd.

    Checks for .opencode/, .claude/, or .agents/ directories.
    """
    current = Path.cwd()
    for parent in [current, *current.parents]:
        if (parent / ".opencode").is_dir():
            return parent
        if (parent / ".claude").is_dir():
            return parent
        if (parent / ".agents").is_dir():
            return parent
    return current


def run_single_query_ai(
    query: str,
    skill_name: str,
    skill_description: str,
    timeout: int,
    model: str | None = None,
    backend: str | None = None,
) -> bool:
    """Run a single query using AI judgment to determine if skill would trigger."""
    try:
        return call_ai_trigger_eval(
            query=query,
            skill_name=skill_name,
            skill_description=skill_description,
            timeout=timeout,
            model=model,
            backend=backend,
        )
    except Exception as e:
        print(f"Warning: AI eval failed for query: {e}", file=sys.stderr)
        return False


def run_single_query_cli(
    query: str,
    skill_name: str,
    skill_description: str,
    timeout: int,
    project_root: str,
    model: str | None = None,
) -> bool:
    """Run a single query through claude CLI for live trigger detection.

    Creates a temporary command file and monitors stream output for skill loading.
    """
    import select

    unique_id = uuid.uuid4().hex[:8]
    clean_name = f"{skill_name}-skill-{unique_id}"
    project_commands_dir = Path(project_root) / ".claude" / "commands"
    command_file = project_commands_dir / f"{clean_name}.md"

    try:
        project_commands_dir.mkdir(parents=True, exist_ok=True)
        indented_desc = "\n  ".join(skill_description.split("\n"))
        command_content = (
            f"---\n"
            f"description: |\n"
            f"  {indented_desc}\n"
            f"---\n\n"
            f"# {skill_name}\n\n"
            f"This skill handles: {skill_description}\n"
        )
        command_file.write_text(command_content)

        cmd = [
            "claude",
            "-p",
            query,
            "--output-format",
            "stream-json",
            "--verbose",
            "--include-partial-messages",
        ]
        if model:
            cmd.extend(["--model", model])

        env = {k: v for k, v in os.environ.items() if k != "CLAUDECODE"}

        process = subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.DEVNULL,
            cwd=project_root,
            env=env,
        )

        triggered = False
        start_time = time.time()
        buffer = ""
        pending_tool_name = None
        accumulated_json = ""

        try:
            while time.time() - start_time < timeout:
                if process.poll() is not None:
                    remaining = process.stdout.read()
                    if remaining:
                        buffer += remaining.decode("utf-8", errors="replace")
                    break

                try:
                    if sys.platform == "win32":
                        import threading

                        result = [None]

                        def _read():
                            result[0] = process.stdout.read(8192)

                        t = threading.Thread(target=_read)
                        t.daemon = True
                        t.start()
                        t.join(1.0)
                        if result[0]:
                            chunk = result[0]
                        else:
                            continue
                    else:
                        ready, _, _ = select.select([process.stdout], [], [], 1.0)
                        if not ready:
                            continue
                        chunk = os.read(process.stdout.fileno(), 8192)
                except Exception:
                    continue

                if not chunk:
                    break
                buffer += chunk.decode("utf-8", errors="replace")

                while "\n" in buffer:
                    line, buffer = buffer.split("\n", 1)
                    line = line.strip()
                    if not line:
                        continue

                    try:
                        event = json.loads(line)
                    except json.JSONDecodeError:
                        continue

                    if event.get("type") == "stream_event":
                        se = event.get("event", {})
                        se_type = se.get("type", "")

                        if se_type == "content_block_start":
                            cb = se.get("content_block", {})
                            if cb.get("type") == "tool_use":
                                tool_name = cb.get("name", "")
                                if tool_name in ("Skill", "Read", "skill"):
                                    pending_tool_name = tool_name
                                    accumulated_json = ""
                                else:
                                    return False

                        elif se_type == "content_block_delta" and pending_tool_name:
                            delta = se.get("delta", {})
                            if delta.get("type") == "input_json_delta":
                                accumulated_json += delta.get("partial_json", "")
                                if clean_name in accumulated_json:
                                    return True

                        elif se_type in ("content_block_stop", "message_stop"):
                            if pending_tool_name:
                                return clean_name in accumulated_json
                            if se_type == "message_stop":
                                return False

                    elif event.get("type") == "assistant":
                        message = event.get("message", {})
                        for content_item in message.get("content", []):
                            if content_item.get("type") != "tool_use":
                                continue
                            tool_name = content_item.get("name", "")
                            tool_input = content_item.get("input", {})
                            if tool_name in ("Skill", "skill") and clean_name in str(
                                tool_input
                            ):
                                triggered = True
                            elif tool_name == "Read" and clean_name in tool_input.get(
                                "file_path", ""
                            ):
                                triggered = True
                            return triggered

                    elif event.get("type") == "result":
                        return triggered
        finally:
            if process.poll() is None:
                process.kill()
                process.wait()

        return triggered
    finally:
        if command_file.exists():
            command_file.unlink()


def run_eval(
    eval_set: list[dict],
    skill_name: str,
    description: str,
    num_workers: int,
    timeout: int,
    project_root: Path | None = None,
    runs_per_query: int = 1,
    trigger_threshold: float = 0.5,
    model: str | None = None,
    backend: str | None = None,
    eval_mode: str = "auto",
) -> dict:
    """Run the full eval set and return results."""
    results = []

    use_cli = eval_mode == "cli" or (
        eval_mode == "auto" and backend == "claude" and project_root
    )

    with ProcessPoolExecutor(max_workers=num_workers) as executor:
        future_to_info = {}
        for item in eval_set:
            for run_idx in range(runs_per_query):
                if use_cli and project_root:
                    future = executor.submit(
                        run_single_query_cli,
                        item["query"],
                        skill_name,
                        description,
                        timeout,
                        str(project_root),
                        model,
                    )
                else:
                    future = executor.submit(
                        run_single_query_ai,
                        item["query"],
                        skill_name,
                        description,
                        timeout,
                        model,
                        backend,
                    )
                future_to_info[future] = (item, run_idx)

        query_triggers: dict[str, list[bool]] = {}
        query_items: dict[str, dict] = {}
        for future in as_completed(future_to_info):
            item, _ = future_to_info[future]
            query = item["query"]
            query_items[query] = item
            if query not in query_triggers:
                query_triggers[query] = []
            try:
                query_triggers[query].append(future.result())
            except Exception as e:
                print(f"Warning: query failed: {e}", file=sys.stderr)
                query_triggers[query].append(False)

    for query, triggers in query_triggers.items():
        item = query_items[query]
        trigger_rate = sum(triggers) / len(triggers)
        should_trigger = item["should_trigger"]
        if should_trigger:
            did_pass = trigger_rate >= trigger_threshold
        else:
            did_pass = trigger_rate < trigger_threshold
        results.append(
            {
                "query": query,
                "should_trigger": should_trigger,
                "trigger_rate": trigger_rate,
                "triggers": sum(triggers),
                "runs": len(triggers),
                "pass": did_pass,
            }
        )

    passed = sum(1 for r in results if r["pass"])
    total = len(results)

    return {
        "skill_name": skill_name,
        "description": description,
        "eval_mode": "cli" if use_cli else "ai_judged",
        "results": results,
        "summary": {
            "total": total,
            "passed": passed,
            "failed": total - passed,
        },
    }


def main():
    parser = argparse.ArgumentParser(
        description="Run trigger evaluation for a skill description"
    )
    parser.add_argument("--eval-set", required=True, help="Path to eval set JSON file")
    parser.add_argument("--skill-path", required=True, help="Path to skill directory")
    parser.add_argument(
        "--description", default=None, help="Override description to test"
    )
    parser.add_argument(
        "--num-workers", type=int, default=4, help="Number of parallel workers"
    )
    parser.add_argument(
        "--timeout", type=int, default=60, help="Timeout per query in seconds"
    )
    parser.add_argument(
        "--runs-per-query", type=int, default=3, help="Number of runs per query"
    )
    parser.add_argument(
        "--trigger-threshold", type=float, default=0.5, help="Trigger rate threshold"
    )
    parser.add_argument("--model", default=None, help="Model to use")
    parser.add_argument(
        "--backend", default=None, help="AI backend: claude, anthropic, openai, manual"
    )
    parser.add_argument(
        "--eval-mode",
        default="auto",
        choices=["auto", "ai", "cli"],
        help="Evaluation mode",
    )
    parser.add_argument(
        "--verbose", action="store_true", help="Print progress to stderr"
    )
    args = parser.parse_args()

    eval_set = json.loads(Path(args.eval_set).read_text())
    skill_path = Path(args.skill_path)

    if not (skill_path / "SKILL.md").exists():
        print(f"Error: No SKILL.md found at {skill_path}", file=sys.stderr)
        sys.exit(1)

    name, original_description, content = parse_skill_md(skill_path)
    description = args.description or original_description
    project_root = find_project_root()
    backend = args.backend or detect_backend()

    if args.verbose:
        print(f"Backend: {backend}", file=sys.stderr)
        print(f"Evaluating: {description}", file=sys.stderr)

    output = run_eval(
        eval_set=eval_set,
        skill_name=name,
        description=description,
        num_workers=args.num_workers,
        timeout=args.timeout,
        project_root=project_root,
        runs_per_query=args.runs_per_query,
        trigger_threshold=args.trigger_threshold,
        model=args.model,
        backend=backend,
        eval_mode=args.eval_mode,
    )

    if args.verbose:
        summary = output["summary"]
        print(
            f"Results: {summary['passed']}/{summary['total']} passed", file=sys.stderr
        )
        for r in output["results"]:
            status = "PASS" if r["pass"] else "FAIL"
            rate_str = f"{r['triggers']}/{r['runs']}"
            print(
                f"  [{status}] rate={rate_str} expected={r['should_trigger']}: {r['query'][:70]}",
                file=sys.stderr,
            )

    print(json.dumps(output, indent=2))


if __name__ == "__main__":
    main()
