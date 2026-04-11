#!/usr/bin/env python3
"""AI backend abstraction layer for skill-creator scripts.

Auto-detects available AI backends and provides a unified interface for:
1. Text completion (used by improve_description.py)
2. Trigger evaluation (used by run_eval.py)

Supported backends (auto-detected in order):
1. claude CLI   - `claude -p` subprocess (Claude Code)
2. anthropic    - ANTHROPIC_API_KEY environment variable
3. openai       - OPENAI_API_KEY environment variable
4. manual       - No AI backend, outputs prompts for manual review
"""

import json
import os
import shutil
import subprocess
import sys
from pathlib import Path


def detect_backend() -> str:
    """Auto-detect the best available AI backend."""
    if shutil.which("claude"):
        return "claude"
    if os.environ.get("ANTHROPIC_API_KEY"):
        return "anthropic"
    if os.environ.get("OPENAI_API_KEY"):
        return "openai"
    return "manual"


def call_ai_text(
    prompt: str,
    model: str | None = None,
    timeout: int = 300,
    backend: str | None = None,
) -> str:
    """Send a text prompt to the AI and return the response.

    Args:
        prompt: The prompt to send
        model: Optional model override
        timeout: Timeout in seconds
        backend: Force a specific backend (auto-detected if None)

    Returns:
        The AI's text response

    Raises:
        RuntimeError: If the AI call fails
        EnvironmentError: If no AI backend is available
    """
    if backend is None:
        backend = detect_backend()

    if backend == "claude":
        return _call_claude(prompt, model, timeout)
    elif backend == "anthropic":
        return _call_anthropic(prompt, model, timeout)
    elif backend == "openai":
        return _call_openai(prompt, model, timeout)
    elif backend == "manual":
        raise EnvironmentError(
            "No AI backend available. Install claude CLI, or set ANTHROPIC_API_KEY or OPENAI_API_KEY."
        )
    else:
        raise ValueError(f"Unknown backend: {backend}")


def _call_claude(prompt: str, model: str | None, timeout: int) -> str:
    """Call claude CLI with text output."""
    cmd = ["claude", "-p", "--output-format", "text"]
    if model:
        cmd.extend(["--model", model])

    env = {k: v for k, v in os.environ.items() if k != "CLAUDECODE"}

    result = subprocess.run(
        cmd,
        input=prompt,
        capture_output=True,
        text=True,
        env=env,
        timeout=timeout,
    )
    if result.returncode != 0:
        raise RuntimeError(
            f"claude -p exited {result.returncode}\nstderr: {result.stderr}"
        )
    return result.stdout


def _call_anthropic(prompt: str, model: str | None, timeout: int) -> str:
    """Call Anthropic API directly."""
    try:
        import anthropic
    except ImportError:
        raise EnvironmentError(
            "anthropic package not installed. Run: pip install anthropic"
        )

    client = anthropic.Anthropic()
    model_id = model or "claude-sonnet-4-20250514"

    message = client.messages.create(
        model=model_id,
        max_tokens=4096,
        messages=[{"role": "user", "content": prompt}],
    )
    return message.content[0].text


def _call_openai(prompt: str, model: str | None, timeout: int) -> str:
    """Call OpenAI API directly."""
    try:
        from openai import OpenAI
    except ImportError:
        raise EnvironmentError("openai package not installed. Run: pip install openai")

    client = OpenAI()
    model_id = model or "gpt-4o"

    response = client.chat.completions.create(
        model=model_id,
        messages=[{"role": "user", "content": prompt}],
    )
    return response.choices[0].message.content or ""


def call_ai_trigger_eval(
    query: str,
    skill_name: str,
    skill_description: str,
    timeout: int = 60,
    model: str | None = None,
    backend: str | None = None,
) -> bool:
    """Evaluate whether a skill would be triggered for a given query.

    Uses AI to judge whether the given description matches the query intent,
    simulating the skill triggering mechanism.

    Args:
        query: The user query to test
        skill_name: The skill's name
        skill_description: The skill's description
        timeout: Timeout in seconds
        model: Optional model override
        backend: Force a specific backend

    Returns:
        True if the AI judges the skill should trigger for this query
    """
    if backend is None:
        backend = detect_backend()

    if backend == "claude":
        return _eval_trigger_claude(
            query, skill_name, skill_description, timeout, model
        )

    prompt = f"""You are simulating an AI agent's skill selection system. Given a user query and a skill description, determine whether the agent should load and use this skill to handle the query.

Skill name: {skill_name}
Skill description: {skill_description}

User query: "{query}"

Would this skill be triggered (loaded and used) for the above query? Consider:
- Does the query match the skill's described capabilities?
- Would the agent benefit from the skill's specialized knowledge?
- Is the query complex enough that the agent would consult a skill?

Respond with ONLY a JSON object: {{"triggered": true}} or {{"triggered": false}}"""

    response = call_ai_text(prompt, model, timeout, backend)

    try:
        result = json.loads(response.strip())
        return bool(result.get("triggered", False))
    except (json.JSONDecodeError, AttributeError):
        return "true" in response.lower() and '"triggered"' in response


def _eval_trigger_claude(
    query: str,
    skill_name: str,
    skill_description: str,
    timeout: int,
    model: str | None,
) -> bool:
    """Use claude CLI for trigger evaluation via AI judgment (fallback from live triggering)."""
    prompt = f"""You are simulating an AI agent's skill selection system. Given a user query and a skill description, determine whether the agent should load and use this skill to handle the query.

Skill name: {skill_name}
Skill description: {skill_description}

User query: "{query}"

Would this skill be triggered (loaded and used) for the above query?

Respond with ONLY a JSON object: {{"triggered": true}} or {{"triggered": false}}"""

    response = _call_claude(prompt, model, timeout)

    try:
        result = json.loads(response.strip())
        return bool(result.get("triggered", False))
    except (json.JSONDecodeError, AttributeError):
        return "true" in response.lower() and '"triggered"' in response
