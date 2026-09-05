---
name: bug-verify
description: 当用户输入 /bug-verify 或 /bug-verify <ID> 时使用。对 ready_for_test 状态的 Bug 进行复测，记录 pass/fail 结果并更新状态。
allowed-tools: [Read, Write, Edit, Bash, AskUserQuestion]
---
# /bug-verify — 复测

## 触发场景
用户运行 `/bug-verify` 或 `/bug-verify <ID>` 时激活。

## 执行流程

### 无参数模式
读取 `bugs/snapshots/index.yml`，筛选 `status: ready_for_test` 的条目列出供选择。若无，提示：
```
当前没有 ready_for_test 状态的 Bug。
如需复测其他状态的 Bug，请使用 /bug-verify <ID>。
```

### 有参数模式（/bug-verify BUG-0042）
直接进入该 bug 的复测流程。

### 复测流程

**第一步：检查本地状态**

读取 `bugs/snapshots/<ID>.yml`。

若 `status` 不是 `ready_for_test`，询问：
```
当前本地状态：<status>
企微表格状态是否已变更？请确认：
  [1] fixed（开发已修复）
  [2] ready_for_test（可以复测）
  [3] 保持 <status>，取消操作
```

选 [1]：更新本地 YAML `status: fixed`，`status_history` 追加记录，再次询问是否已变为 ready_for_test（重复本步骤）。
选 [2]：更新本地 YAML `status: ready_for_test`，`status_history` 追加 `{status: ready_for_test, at: <今日>, by: tester}`，更新 `index.yml` 中该条目 status，继续复测流程。
选 [3]：退出。

**第二步：状态核对**

```
→ 状态核对（请在企微表格确认）：
  本地 YAML 状态：<当前状态>
  企微表格状态是否一致？[y/n/跳过]
  · 选 n：提示"请先同步企微表格状态，再继续复测"，并提供选项：
      [1] 以本地 YAML 为准（企微表格未更新，继续复测）
      [2] 以企微表格为准（更新本地 YAML 后继续）
      [3] 取消操作
  · 选 y 或跳过：直接展示复测信息
```

**第三步：展示复测信息**

```
=== BUG-<ID> 复测信息 ===
标题：<title>
严重度：<severity>  模块：<module>

复现步骤：
  1. <step1>
  2. <step2>

预期结果：<expected>
实际结果（原始）：<actual>

关联测试用例：<linked_testcases 或 无>
推荐回归用例（同模块 open/reopened bug）：
  <从 index.yml 筛选同模块其他 bug，列出 ID + 标题>

截图：<若 bugs/assets/<ID>/ 存在则列出文件名，否则显示"无">
```

**第四步：记录复测结果**

```
复测结果？
  [pass] 验证通过
  [fail] 验证失败
备注（可选，直接回车跳过）：
```

**pass 处理：**
1. 更新 YAML：`status: closed`，`verify_note` 填入备注，`updated_at` 今日，`status_history` 追加 `{status: closed, at: <今日>, by: tester}`
2. 从 `index.yml` 的 `active` 列表移除，`total_active` -1，`last_updated` 更新为今日
3. 输出：
```
BUG-<ID> 已关闭（复测通过）
<备注>
--- 复制到企微 ---
【BUG-<ID>】复测通过，已关闭。<备注>
企微表格：请同步将状态更新为 closed
```

**fail 处理：**
1. 更新 YAML：`status: reopened`，`verify_note` 填入备注，`updated_at` 今日，`status_history` 追加 `{status: reopened, at: <今日>, by: tester}`
2. 更新 `index.yml` 中该条目的 `status` 为 `reopened`，`last_updated` 更新为今日
3. 输出：
```
BUG-<ID> 已重开（复测失败）
<备注>
--- 复制到企微 ---
【BUG-<ID>】复测未通过，已重开。<备注>
企微表格：请同步将状态更新为 reopened
```
