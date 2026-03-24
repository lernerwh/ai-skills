#!/usr/bin/env python3
"""
代码检视报告汇总脚本
将多个CSV检视报告合并为一份最终报告
"""

import csv
import os
import sys
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Optional


def read_csv_report(file_path: str) -> List[Dict]:
    """读取单个CSV检视报告"""
    findings = []
    try:
        with open(file_path, "r", encoding="utf-8", newline="") as f:
            reader = csv.DictReader(f)
            for row in reader:
                findings.append(row)
    except Exception as e:
        print(f"警告: 读取文件 {file_path} 失败: {e}")
    return findings


def merge_reports(reports: List[List[Dict]]) -> List[Dict]:
    """合并多个报告，去除重复项"""
    all_findings = []
    seen = set()

    for report in reports:
        for finding in report:
            # 创建唯一标识符用于去重
            key = (
                finding.get("问题描述", ""),
                finding.get("文件路径", ""),
                finding.get("行号范围", ""),
            )
            if key not in seen:
                seen.add(key)
                all_findings.append(finding)

    return all_findings


def sort_by_severity(findings: List[Dict]) -> List[Dict]:
    """按严重程度排序"""
    severity_order = {"Critical": 0, "High": 1, "Medium": 2, "Low": 3}

    return sorted(
        findings, key=lambda x: severity_order.get(x.get("严重程度", "Low"), 3)
    )


def generate_summary(findings: List[Dict]) -> Dict:
    """生成统计摘要"""
    summary = {
        "total": len(findings),
        "critical": 0,
        "high": 0,
        "medium": 0,
        "low": 0,
        "by_category": {},
    }

    for finding in findings:
        severity = finding.get("严重程度", "Low")
        category = finding.get("检视依据", "其他")

        # 统计严重程度
        if severity == "Critical":
            summary["critical"] += 1
        elif severity == "High":
            summary["high"] += 1
        elif severity == "Medium":
            summary["medium"] += 1
        else:
            summary["low"] += 1

        # 统计分类
        if category not in summary["by_category"]:
            summary["by_category"][category] = 0
        summary["by_category"][category] += 1

    return summary


def write_final_report(findings: List[Dict], output_path: str) -> None:
    """写入最终CSV报告"""
    if not findings:
        print("警告: 没有检视发现，将创建空报告")

    fieldnames = ["问题描述", "文件路径", "行号范围", "严重程度", "检视依据"]

    with open(output_path, "w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(findings)

    print(f"报告已保存到: {output_path}")


def print_summary(summary: Dict) -> None:
    """打印统计摘要"""
    print("\n" + "=" * 50)
    print("代码检视报告摘要")
    print("=" * 50)
    print(f"\n总问题数: {summary['total']}")
    print(f"  - Critical: {summary['critical']}")
    print(f"  - High: {summary['high']}")
    print(f"  - Medium: {summary['medium']}")
    print(f"  - Low: {summary['low']}")

    if summary["by_category"]:
        print("\n按问题类型分布:")
        for category, count in sorted(
            summary["by_category"].items(), key=lambda x: x[1], reverse=True
        ):
            print(f"  - {category}: {count}")

    print("=" * 50)


def main():
    """主函数"""
    if len(sys.argv) < 2:
        print("用法: python merge_reports.py <csv_file_or_directory> [output_file]")
        print("示例:")
        print("  python merge_reports.py reports/")
        print("  python merge_reports.py report1.csv report2.csv -o final.csv")
        sys.exit(1)

    # 解析参数
    input_paths = []
    output_path = None

    i = 1
    while i < len(sys.argv):
        if sys.argv[i] == "-o" and i + 1 < len(sys.argv):
            output_path = sys.argv[i + 1]
            i += 2
        else:
            input_paths.append(sys.argv[i])
            i += 1

    if not output_path:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_path = f"code_review_report_{timestamp}.csv"

    # 收集所有CSV文件
    csv_files = []
    for path in input_paths:
        p = Path(path)
        if p.is_file() and p.suffix == ".csv":
            csv_files.append(str(p))
        elif p.is_dir():
            csv_files.extend(str(f) for f in p.glob("*.csv"))

    if not csv_files:
        print("错误: 未找到任何CSV文件")
        sys.exit(1)

    print(f"找到 {len(csv_files)} 个CSV文件")

    # 读取所有报告
    all_reports = []
    for csv_file in csv_files:
        print(f"读取: {csv_file}")
        report = read_csv_report(csv_file)
        all_reports.append(report)

    # 合并并排序
    merged = merge_reports(all_reports)
    sorted_findings = sort_by_severity(merged)

    # 生成摘要
    summary = generate_summary(sorted_findings)
    print_summary(summary)

    # 写入最终报告
    write_final_report(sorted_findings, output_path)


if __name__ == "__main__":
    main()
