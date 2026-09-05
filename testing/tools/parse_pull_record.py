"""解析 模块代码映像.md §8「拉取变更记录」。

契约（与 docs/superpowers/specs/2026-06-23-pull-record-test-recommend-linkage-design.md §3 一致）：
- §8 区域以 `## 8. 拉取变更记录` 标题开始。
- 每条记录以 `### ` 开头；文件中第一条 `### ` 即最新。
- 标题行：`### <时间> | <旧hash> -> <新hash> | <N> 提交`
- `- 文件:` 逗号分隔的完整路径列表
- `- 模块:` 逗号分隔的业务模块名
- `- 提交:` `<类型> <摘要>(<hash>,<作者>)` 分号分隔
- 约定：§8 章节内不得出现 `## ` 二级子标题（解析在下一个 `## <数字>` 处截断）。
"""
import re

SECTION_RE = re.compile(r"^##\s+8\.\s*拉取变更记录", re.MULTILINE)
HEADER_RE = re.compile(
    r"^###\s+(?P<at>.+?)\s*\|\s*(?P<old>\S+)\s*->\s*(?P<new>\S+)\s*\|\s*(?P<n>\d+)\s*提交\s*$",
    re.MULTILINE,
)


def _section_text(text):
    m = SECTION_RE.search(text)
    if not m:
        return None
    rest = text[m.end():]
    nxt = re.search(r"^##\s+\d", rest, re.MULTILINE)
    return rest[: nxt.start()] if nxt else rest


def _field(block, label):
    m = re.search(r"^-\s*" + re.escape(label) + r":\s*(.+)$", block, re.MULTILINE)
    return m.group(1).strip() if m else ""


def _split(value):
    return [p.strip() for p in re.split(r"[，,]", value) if p.strip()] if value else []


def parse_all_records(text):
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    section = _section_text(text)
    if section is None:
        return []
    parts = re.split(r"(?m)^(?=###\s)", section)
    records = []
    for part in parts:
        h = HEADER_RE.search(part)
        if not h:
            continue
        records.append(
            {
                "at": h.group("at").strip(),
                "old_hash": h.group("old"),
                "new_hash": h.group("new"),
                "commit_count": int(h.group("n")),
                "files": _split(_field(part, "文件")),
                "modules": _split(_field(part, "模块")),
                "commits": _field(part, "提交"),
            }
        )
    return records


def parse_latest_record(text):
    records = parse_all_records(text)
    return records[0] if records else None
