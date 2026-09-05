---
name: bug-analyze
description: 当用户输入 /bug-analyze 或 /bug-analyze <ID> 时使用。扫描代码定位 Bug 可疑位置，将结果写回 YAML 的 linked_code 字段。
allowed-tools: [Read, Write, Edit, Bash, Glob, Grep, AskUserQuestion]
---
# /bug-analyze — 代码定位分析

## 触发场景
用户运行 `/bug-analyze` 或 `/bug-analyze <ID>` 时激活。

## 执行流程

### 输入模式判断

**有参数模式：`/bug-analyze BUG-0042`**
- 直接读取该 Bug 的 YAML 文件
- 跳转到"分析流程"

**无参数模式：`/bug-analyze`**
- 提示用户：
  ```
  请上传截图或描述问题现象（或两者都提供）：
  ```
- 用户可以：
  - 上传截图
  - 输入文字描述
  - 或同时提供截图和描述
- AI 分析后推测模块，跳转到"分析流程"

### 分析流程

**第一步：收集信息**

**如果是 ID 模式**：
1. 读取 `bugs/snapshots/<ID>.yml`（获取 title/module/reproduce_steps/actual）
2. 读取 `.claude/config/testcase-workflow.yml`（获取 `dev_repo` 和 `module_map`）
3. 检查 `bugs/assets/<ID>/` 是否有截图，有则读取

**如果是截图/描述模式**：
1. 收集用户提供的截图和/或文字描述
2. 读取 `.claude/config/testcase-workflow.yml`（获取 `dev_repo` 和 `module_map`）
3. **推测模块**：根据描述和截图内容，匹配关键词到模块
   - 关键词示例：
     - "聊天" / "对话" / "AI" → chat-ui / chat-composer
     - "登录" / "注册" → auth
     - "积分" / "充值" → payment
     - "定时任务" / "cron" → cron-surface
   - 如果无法推测，列出所有模块让用户选择
   - 记录推测的模块和置信度

**第二步：代码扫描**

根据 `module_map[module]` 确定扫描路径：`<dev_repo>/<path>`
- 若模块有 `scan_filter` 字段，只扫描 path 目录下匹配该 glob 的文件
- 若模块有 `ui_entry` 字段，额外读取该文件

扫描该路径下的代码文件（深度参考 `scan_depth: 3`，忽略 `ignore` 列表中的目录），结合 bug 描述定位可疑位置。

若模块为 pending 或不在 module_map 中，提示：
```
模块字段为 pending 或未知，无法精确定位。将扫描整个 dev_repo 根目录，可能耗时较长。是否继续？[y/n]
```

**第三步：推测相似历史 bug**

扫描 `bugs/snapshots/` 目录下所有 YAML，筛选同模块（`module` 相同）且状态为 `closed` 的条目，列出最近 3 条。

**第四步：写回 YAML**

仅在 `linked_code` 为空列表时写入（不覆盖已有数据）：

```yaml
linked_code:
  - path: <相对于 dev_repo 的路径>
    line: <行号>
    confidence: high/medium/low
    note: <原因说明>
```

更新 `updated_at` 为今日。

**第五步：输出分析报告**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BUG 代码诊断分析
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 问题概述
<问题标题或描述>

🔍 可疑代码位置

1. [HIGH] <dev_repo_path>:<line>
   原因：<分析说明>
   
2. [MEDIUM] <dev_repo_path>:<line>
   原因：<分析说明>

📚 相似历史 bug
  · BUG-XXXX（已关闭）：<title>

💡 建议
<操作建议>

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**第六步：询问是否创建 bug 记录（新增）**

```
是否根据此诊断创建 bug 记录？
  [1] 是，调用 /bug-report
  [2] 否，结束
```

**如果用户选择 [1]**：
- 自动调用 `/bug-report` skill
- 传递以下信息作为上下文：
  ```yaml
  context_from_analyze:
    title: <从描述中提取>
    module: <推测的模块>
    reproduce_steps: <用户描述>
    actual: <用户描述的现象>
    linked_code: <可疑代码位置列表>
    analysis_time: <timestamp>
  ```
- `/bug-report` 将预填充这些信息供用户确认

**如果用户选择 [2]**：
- 结束流程
- 如果是 ID 模式且 linked_code 已写回，提示已更新 YAML
