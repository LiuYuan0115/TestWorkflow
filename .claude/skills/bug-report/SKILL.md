---
name: bug-report
description: 当用户输入 /bug-report 时使用。引导测试同学自由描述 Bug，AI 结构化分析后输出标题/严重度/模块/复现步骤/预期/实际，确认后写入 YAML。
allowed-tools: [Read, Write, Edit, Bash, AskUserQuestion]
---
# /bug-report — 提报 Bug

## 触发场景
用户运行 `/bug-report` 时激活。

**可能的调用方式**：
1. 用户直接调用：`/bug-report`
2. 从 `/bug-analyze` 调用：带有代码分析上下文
3. 从 `/bug-log-analyze` 调用：带有日志分析上下文

## 执行流程

### 第零步：检查上下文（新增）

检查是否从分析 skill 调用，如果是，提取预填充信息：

**从 `/bug-analyze` 调用**：
```yaml
context_from_analyze:
  title: <从描述中提取>
  module: <推测的模块>
  reproduce_steps: <用户描述>
  actual: <用户描述的现象>
  linked_code: <可疑代码位置列表>
  analysis_time: <timestamp>
```

**从 `/bug-log-analyze` 调用**：
```yaml
context_from_log_analyze:
  title: <从日志中提取>
  module: <从日志推测>
  reproduce_steps: <用户描述 + 日志关键点>
  actual: <日志中的错误信息>
  environment:
    platform: <判断的环境类型>
    os: <操作系统>
  linked_logs: <日志文件和行号>
  error_type: <error type>
  analysis_time: <timestamp>
```

**如果有上下文**：跳过第一步，直接进入第二步使用预填充信息。

### 第一步：收集自由描述

```
请详细描述这个 bug（现象、触发条件、影响等，尽量详细）：
```

用户自由输入，不限格式，一次性描述完整。

### 第二步：AI 分析并结构化输出

**如果有分析上下文**（从 `/bug-analyze` 或 `/bug-log-analyze` 调用）：
- 使用预填充信息作为初始值
- 标注信息来源（如："[来自代码分析]" 或 "[来自日志分析]"）

**否则**，根据用户描述 AI 自动推断。

输出结构：

```
AI 分析结果：

标题：<一句话概括>
严重度：<P0/P1/P2/P3>
  理由：<为什么是这个严重度>
模块：<模块名>
  理由：<为什么是这个模块>
复现步骤：
  1. <步骤1>
  2. <步骤2>
预期结果：<预期>
实际结果：<实际>

附加信息（如有）：
  - 可疑代码：<linked_code>（来自代码分析）
  - 关键日志：<linked_logs>（来自日志分析）
  - 错误类型：<error_type>（来自日志分析）

---
[1] 确认 — 信息正确，继续
[2] 修改 — 我要调整某些字段
```

### 第三步：确认或修改

**选 [1] 确认：**
直接进入第四步。

**选 [2] 修改：**
```
你想修改哪些字段？（可多选，用逗号分隔）
  [a] 标题
  [b] 严重度
  [c] 模块
  [d] 复现步骤
  [e] 预期结果
  [f] 实际结果
```

逐一展示当前值，用户输入新值（直接回车保留原值）。修改完成后重新展示完整结构，再次询问 [1] 确认 / [2] 继续修改。

### 第四步：补充环境信息

```
环境信息（直接回车用默认值，输入 ? 跳过整块）：
  平台 [desktop]：
  OS [macOS 14.2]：
  应用版本 [v1.3.0]：
```

### 第五步：分配 ID 并写入 YAML

1. 扫描 `bugs/snapshots/` 目录找到最大 BUG 编号，新 ID = 最大编号 + 1，格式 `BUG-XXXX`（4位补零）。若目录为空则从 BUG-0001 开始。
2. 写入 `bugs/snapshots/<ID>.yml`：

```yaml
id: <ID>
title: <标题>
status: open
severity: <P0/P1/P2/P3>
module: <模块>
created_at: <今日日期 YYYY-MM-DD>
updated_at: <今日日期 YYYY-MM-DD>

reproduce_steps:
  - <步骤1>
  - <步骤2>
expected: <预期>
actual: <实际>
environment:
  platform: <platform>
  os: <os>
  app_version: <app_version>

status_history:
  - status: open
    at: <今日日期>
    by: tester

linked_code: []  # 如果从 bug-analyze 调用，填充分析结果
linked_logs: []  # 如果从 bug-log-analyze 调用，填充日志位置
similar_bugs: []
linked_testcases: []
fix_note: ""
verify_note: ""
resolution: ""
analysis_context: ""  # 记录来源："from_code_analyze" 或 "from_log_analyze"
```

3. 更新 `bugs/snapshots/index.yml`：追加新条目，`total_active` +1，`last_updated` 更新为今日。

### 第六步：输出企微复制文本

```
【<ID>】<标题>

严重度：<severity>
模块：<module>
平台：<platform> / <os> / <app_version>

复现步骤：
  1. <步骤1>
  2. <步骤2>

预期：<expected>
实际：<actual>

关联用例：（无）
```

提示：如有截图，请放到 `bugs/assets/<ID>/` 目录，并手动拖入企微表格。
