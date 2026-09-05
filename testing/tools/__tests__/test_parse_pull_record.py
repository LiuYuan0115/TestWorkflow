import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from parse_pull_record import parse_latest_record, parse_all_records

FIXTURE = os.path.join(os.path.dirname(__file__), "fixtures", "模块代码映像.sample.md")


def read_fixture():
    with open(FIXTURE, encoding="utf-8") as f:
        return f.read()


def test_latest_record_is_first_block():
    rec = parse_latest_record(read_fixture())
    assert rec["old_hash"] == "a1b2c3d"
    assert rec["new_hash"] == "e4f5g6h"
    assert rec["commit_count"] == 5
    assert rec["at"] == "2026-06-23 14:30"


def test_latest_record_files_are_full_paths():
    rec = parse_latest_record(read_fixture())
    assert rec["files"] == [
        "apps/desktop/src/app/lib/chat-turns.ts",
        "apps/desktop/src/app/components/account/AccountPanel.tsx",
    ]


def test_latest_record_modules():
    rec = parse_latest_record(read_fixture())
    assert rec["modules"] == ["对话系统", "积分与支付"]


def test_parse_all_records_keeps_order_newest_first():
    recs = parse_all_records(read_fixture())
    assert len(recs) == 2
    assert recs[0]["new_hash"] == "e4f5g6h"
    assert recs[1]["new_hash"] == "a1b2c3d"


def test_deleting_first_block_promotes_next(tmp_path):
    text = read_fixture()
    marker = "### 2026-06-20 09:15"
    trimmed = text[: text.index("### 2026-06-23")] + text[text.index(marker):]
    rec = parse_latest_record(trimmed)
    assert rec["new_hash"] == "a1b2c3d"
    assert rec["files"] == [
        "apps/desktop/src/app/components/settings/PrivacyLocalCapture.tsx"
    ]


def test_empty_section_returns_none():
    text = "## 8. 拉取变更记录（最新在上 · 可删除整段不需要的记录）\n\n> 说明\n"
    assert parse_latest_record(text) is None


def test_missing_section_returns_none():
    assert parse_latest_record("# 无 §8 的文件\n## 7. 相关文档\n") is None


def test_missing_files_field_returns_empty_list():
    # 记录块缺 `- 文件:` 行时，files 应为空列表且不抛异常
    text = (
        "## 8. 拉取变更记录\n\n"
        "### 2026-06-23 14:30 | a1b2c3d -> e4f5g6h | 1 提交\n"
        "- 模块: 对话系统\n"
        "- 提交: feat 改动(e4f5g6h,张三)\n"
    )
    rec = parse_latest_record(text)
    assert rec is not None
    assert rec["files"] == []
    assert rec["modules"] == ["对话系统"]


def test_crlf_line_endings_no_carriage_return_residue():
    # CRLF 行尾不应在 hash / 文件路径里残留 \r
    text = (
        "## 8. 拉取变更记录\r\n\r\n"
        "### 2026-06-23 14:30 | a1b2c3d -> e4f5g6h | 1 提交\r\n"
        "- 文件: apps/desktop/src/app/lib/chat-turns.ts\r\n"
        "- 模块: 对话系统\r\n"
        "- 提交: feat 改动(e4f5g6h,张三)\r\n"
    )
    rec = parse_latest_record(text)
    assert rec is not None
    assert rec["new_hash"] == "e4f5g6h"
    assert "\r" not in rec["new_hash"]
    assert rec["files"] == ["apps/desktop/src/app/lib/chat-turns.ts"]
    assert all("\r" not in f for f in rec["files"])


def test_fullwidth_comma_splits_files():
    # 中文全角逗号也应正确切分文件列表
    text = (
        "## 8. 拉取变更记录\n\n"
        "### 2026-06-23 14:30 | a1b2c3d -> e4f5g6h | 1 提交\n"
        "- 文件: a/b.ts，c/d.ts\n"
        "- 模块: 对话系统\n"
        "- 提交: feat 改动(e4f5g6h,张三)\n"
    )
    rec = parse_latest_record(text)
    assert rec["files"] == ["a/b.ts", "c/d.ts"]
