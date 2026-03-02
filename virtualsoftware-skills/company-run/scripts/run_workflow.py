#!/usr/bin/env python3
"""
虚拟软件公司工作流协调器
Virtual Software Company Workflow Coordinator

用于自动检测项目阶段并协调各角色执行任务
"""

import os
import sys
import yaml
import json
from datetime import datetime
from pathlib import Path

# 项目根目录
PROJECT_ROOT = Path(__file__).parent.parent.parent.parent.parent / "VirtualSoftwareCompany"
PROJECTS_DIR = PROJECT_ROOT / "projects"
COORDINATION_DIR = PROJECT_ROOT / "coordination"


def load_yaml(path):
    """加载 YAML 文件"""
    with open(path, 'r', encoding='utf-8') as f:
        return yaml.safe_load(f)


def save_yaml(path, data):
    """保存 YAML 文件"""
    with open(path, 'w', encoding='utf-8') as f:
        yaml.dump(data, f, allow_unicode=True, default_flow_style=False)


def detect_project_stage(project_name):
    """
    检测项目当前阶段

    返回: (stage_id, stage_name, next_role)
    """
    project_dir = PROJECTS_DIR / project_name

    if not project_dir.exists():
        return None, "项目不存在", None

    # 检查各阶段目录是否存在及内容
    requirements_dir = project_dir / "01-requirements"
    architecture_dir = project_dir / "02-architecture"
    acceptance_dir = project_dir / "03-acceptance"
    dt_tests_dir = project_dir / "04-dt-tests"
    code_dir = project_dir / "05-code"
    reviews_dir = project_dir / "06-reviews"
    test_design_dir = project_dir / "07-test-design"
    test_cases_dir = project_dir / "08-test-cases"
    reports_dir = project_dir / "09-reports"

    # 阶段检测逻辑
    if not requirements_dir.exists() or not any(requirements_dir.iterdir()):
        return "1_requirements", "需求分析", "/pm"

    if not architecture_dir.exists() or not any(architecture_dir.iterdir()):
        return "2_architecture", "架构设计", "/architect"

    # 3a 和 3b 可以并行
    dt_tests_complete = dt_tests_dir.exists() and any(dt_tests_dir.iterdir())
    test_design_complete = test_design_dir.exists() and any(test_design_dir.iterdir())

    if not dt_tests_complete:
        return "3a_dt_tests", "DT测试设计", "/dev-tester"

    if not test_design_complete:
        return "3b_test_design", "测试计划设计", "/test-manager"

    # 检查代码是否实现
    if not code_dir.exists() or not any(code_dir.rglob("*.ts")):
        return "4_development", "代码开发", "/developer"

    # 检查审核状态
    review_status_file = reviews_dir / "review-status.yaml"
    if review_status_file.exists():
        review_status = load_yaml(review_status_file)
        status = review_status.get("status", "pending")

        if status == "needs_revision":
            return "4_development", "代码修改（审核意见）", "/developer"
        elif status == "pending":
            return "5_review", "代码审核", "/reviewer"
        # status == "passed" 继续下一步

    if not reviews_dir.exists() or not any(reviews_dir.iterdir()):
        return "5_review", "代码审核", "/reviewer"

    # 检查测试是否完成
    if not reports_dir.exists() or not any(reports_dir.iterdir()):
        return "6_testing", "测试执行", "/tester"

    return "completed", "项目完成", None


def create_project(project_name, requirement=None):
    """
    创建新项目
    """
    project_dir = PROJECTS_DIR / project_name

    if project_dir.exists():
        print(f"❌ 项目 '{project_name}' 已存在")
        return False

    # 创建目录结构
    dirs = [
        "01-requirements",
        "02-architecture",
        "03-acceptance",
        "04-dt-tests/dt-test-cases",
        "05-code/src",
        "06-reviews/review-records",
        "07-test-design",
        "08-test-cases/functional",
        "08-test-cases/e2e",
        "09-reports"
    ]

    for d in dirs:
        (project_dir / d).mkdir(parents=True, exist_ok=True)

    # 创建项目状态文件
    project_state = {
        "project_name": project_name,
        "current_stage": "1_requirements",
        "status": "pending",
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat(),
        "next_stage": "2_architecture"
    }

    if requirement:
        project_state["initial_requirement"] = requirement

    save_yaml(project_dir / "project-state.yaml", project_state)

    print(f"✅ 项目 '{project_name}' 创建成功")
    print(f"📁 项目目录: {project_dir}")
    return True


def update_handover_log(project_name, from_stage, to_stage, from_role, to_role, deliverables):
    """
    更新交接日志
    """
    log_file = COORDINATION_DIR / "handover-log.yaml"

    if log_file.exists():
        data = load_yaml(log_file)
    else:
        data = {"version": "1.0", "log": []}

    entry = {
        "timestamp": datetime.now().isoformat(),
        "from_stage": from_stage,
        "to_stage": to_stage,
        "from_role": from_role,
        "to_role": to_role,
        "project": project_name,
        "deliverables": deliverables,
        "status": "completed"
    }

    data["log"].append(entry)
    save_yaml(log_file, data)


def print_project_status(project_name):
    """
    打印项目状态
    """
    project_dir = PROJECTS_DIR / project_name

    if not project_dir.exists():
        print(f"❌ 项目 '{project_name}' 不存在")
        return

    # 读取项目状态
    state_file = project_dir / "project-state.yaml"
    if state_file.exists():
        state = load_yaml(state_file)
    else:
        state = {}

    # 检测当前阶段
    stage_id, stage_name, next_role = detect_project_stage(project_name)

    print(f"\n{'='*50}")
    print(f"📋 项目状态: {project_name}")
    print(f"{'='*50}")
    print(f"当前阶段: {stage_id} - {stage_name}")
    print(f"项目状态: {state.get('status', 'unknown')}")
    print(f"创建时间: {state.get('created_at', 'unknown')}")
    print(f"更新时间: {state.get('updated_at', 'unknown')}")

    if next_role:
        print(f"\n👉 下一步操作: 运行 {next_role} {project_name}")
    else:
        print(f"\n🎉 项目已完成!")

    print(f"{'='*50}\n")


def main():
    """主函数"""
    if len(sys.argv) < 2:
        print("用法:")
        print("  python run_workflow.py <project_name>          # 继续项目")
        print("  python run_workflow.py <project_name> --status # 查看状态")
        print("  python run_workflow.py <project_name> --create # 创建项目")
        sys.exit(1)

    project_name = sys.argv[1]
    command = sys.argv[2] if len(sys.argv) > 2 else None

    if command == "--status":
        print_project_status(project_name)
    elif command == "--create":
        create_project(project_name)
    else:
        # 继续项目
        stage_id, stage_name, next_role = detect_project_stage(project_name)

        if stage_id is None:
            print(f"❌ 项目 '{project_name}' 不存在")
            print(f"💡 使用 --create 创建新项目")
        elif stage_id == "completed":
            print(f"🎉 项目 '{project_name}' 已完成!")
        else:
            print(f"\n📍 当前阶段: {stage_id} - {stage_name}")
            if next_role:
                print(f"👉 请运行: {next_role} {project_name}")


if __name__ == "__main__":
    main()
