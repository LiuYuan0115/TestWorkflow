"""验证 qa-pull-latest §8 写入格式（来自 SKILL.md 契约）能被解析脚本读出。"""
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from parse_pull_record import parse_latest_record

# 模拟 qa-pull-latest 步骤 8.5 写出的一条记录（严格按契约格式）
WRITTEN = """## 8. 拉取变更记录（最新在上 · 可删除整段不需要的记录）

> 说明注释
<!-- 最新在上 -->
### 2026-06-23 16:00 | 6bcf6a7 -> d39af6d | 6 提交
- 文件: apps/desktop/package.json, apps/desktop/src-tauri/src/main.rs
- 模块: 对话系统, 开放爪封装层
- 提交: feat 引入echarts(895ff07,赵六); build 升级runtime(8c7407f,钱七)
"""


def test_written_record_is_parseable():
    rec = parse_latest_record(WRITTEN)
    assert rec is not None
    assert rec["old_hash"] == "6bcf6a7"
    assert rec["new_hash"] == "d39af6d"
    assert rec["commit_count"] == 6
    assert rec["files"][0] == "apps/desktop/package.json"
    assert "开放爪封装层" in rec["modules"]


def test_written_record_files_are_paths_not_basenames():
    rec = parse_latest_record(WRITTEN)
    for f in rec["files"]:
        assert "/" in f, f"文件必须是完整路径，发现简写：{f}"
