---
name: bug-update
description: 当用户输入 /bug-update 或 /bug-update <ID> 时使用。修改 open 状态的 Bug 字段，或变更状态为 rejected/deferred；支持 --batch 批量变更。
allowed-tools: [Read, Write, Edit, Bash, AskUserQuestion]
---
# /bug-update — 修改与状态变更

## 触发场景
用户运行 `/bug-update` 或 `/bug-update <ID>` 时激活。

## 限制
**仅限 status = open 的 bug。** 若目标 bug 状态不是 open，输出错误：
```
错误：BUG-XXXX 当前状态为 <status>，/bug-update 仅支持 open 状态的 bug。
```

## 输入方式

### 直接模式
```
/bug-update BUG-0042

# 批量变更状态（仅支持状态变更，不支持批量修改内容）
/bug-update --batch BUG-0042,BUG-0043,BUG-0044
```

**批量模式（`--batch` 参数）：**
- 仅支持状态变更（rejected / deferred），不支持批量修改内容字段
- 列出所有指定 Bug 的当前状态，确认后统一变更
- 每个 Bug 独立写入 YAML，任一失败不影响其他

## 执行流程

### 无参数模式
读取 `bugs/snapshots/index.yml`，筛选 `status: open` 的条目，列出供选择：
```
当前 open 状态的 Bug：
  [1] BUG-0042  [P1]  auth  登录后首页白屏
  [2] BUG-0043  [P2]  payment  支付金额显示错误
请选择编号：
```

### 有参数模式（/bug-update BUG-0042）
直接进入该 bug 的编辑流程。读取 `bugs/snapshots/BUG-0042.yml`，验证 status = open。

### 编辑流程

展示当前信息后询问：
```
当前状态：open
标题：<title>

你想做什么？
  [1] 修改内容（补充待定字段 / 纠正错误信息）
  [2] 变更状态（标记为 rejected / deferred）
```

**选 [1] 修改内容：**

逐一展示可修改字段，用户直接回车跳过：
```
严重度：<当前值> → 输入新值或回车跳过
模块：<当前值> → 输入新值或回车跳过
复现步骤：<当前值> → 输入新值或回车跳过（逐行，空行结束）
预期结果：<当前值> → 输入新值或回车跳过
实际结果：<当前值> → 是否修改？[y/n]
```

修改完成后：
1. 重新执行 AI 审查（同 /bug-report 的审查逻辑：严重度合理性 + 模块推断）
2. 更新 YAML（`updated_at` 改为今日）
3. 更新 `index.yml` 中对应条目的字段
4. 输出新的企微复制文本

**选 [2] 变更状态：**

```
变更为：
  [1] rejected — 判断为非 bug（需填原因）
  [2] deferred — 延期处理（需填原因）
```

用户选择后输入原因（必填，不可跳过）。

更新 YAML：
- `status` 改为 rejected 或 deferred
- `resolution` 填入原因
- `updated_at` 改为今日
- `status_history` 追加 `{status: <新状态>, at: <今日>, by: tester}`

从 `index.yml` 的 `active` 列表中移除该条目，`total_active` -1，`last_updated` 更新为今日。

输出状态变更说明：
```
BUG-XXXX 已标记为 <rejected/deferred>
原因：<resolution>
```
