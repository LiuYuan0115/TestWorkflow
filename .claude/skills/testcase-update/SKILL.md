---
name: testcase-update
description: 当用户输入 /testcase-update 时使用。根据新需求更新已有测试用例，支持 PRD 文档、文字描述、代码变更（--diff）三种来源，支持 --modules 批量更新多模块。
allowed-tools: [Read, Write, Edit, Bash, AskUserQuestion]
---
# /testcase-update — 测试用例更新

## 触发场景
用户运行 `/testcase-update` 或提到"更新测试用例"、"根据新需求更新用例"时激活。

## 直接模式（带参数）
```
/testcase-update <PRD路径> <MD路径>
/testcase-update docs/prd/auth-v2.md testing/mindmaps/auth-login.md

# 批量更新多个模块
/testcase-update docs/prd/auth-v2.md --modules auth,payment,settings

# 代码变更驱动
/testcase-update --diff <base>
/testcase-update --diff main
/testcase-update --diff HEAD~3
/testcase-update --diff main --modules auth,payment
```

## 交互模式（无参数启动）

无参数时进入引导：

```
请选择变更内容来源：
  [1] 输入 PRD 文档路径
  [2] 直接描述变更内容（无 PRD 时用）
  [3] 代码变更（git diff）
```

选 [1] 后询问 PRD 路径，再展示模块选择列表（同下）。
选 [2] 后询问变更描述，再展示模块选择列表。
选 [3] 后询问 base（参考 `/test-recommend` 的交互方式），再展示模块选择列表。

三种情况都展示：
```
请选择要更新的模块：
  [1]  auth               — 账号与认证
  [2]  settings           — 应用设置
  [3]  payment            — 充值与支付
  ... （完整列出 module_map 中 `testable` 不为 `false` 的模块，格式：编号 + 模块名 + 注释）
  [N]  手动输入路径
```
（从 `module_map` 读取，有对应 MD 文件的模块标注"已有用例"）

---

## 来源 [1]/[2] 执行流程（PRD / 描述）

### Step 1：理解变更内容
- 读取 PRD 文档（或接收用户描述的变更内容）
- 分析变更点：新增功能点、修改的功能点、删除的功能点、影响范围

### Step 2：读取现有 MD
读取目标 `testing/mindmaps/<模块>.md`，理解当前用例结构。

### Step 3：差异分析
输出变更影响分析，列出具体用例 ID 和原因：
```
变更影响分析：
  新增用例（N 条）：
    · [新增] 手机号+验证码登录（对应新功能：短信登录）
  需修改用例（N 条）：
    · AUTH-003  密码重置流程（原因：重置链接有效期从 24h 改为 1h）
    · AUTH-007  记住登录状态（原因：新增"30天免登录"选项）
  待废弃用例（N 条）：
    · AUTH-012  第三方微信登录（原因：功能已下线）
  无需变更：N 条

确认后继续？[Y/n]
```

### Step 4：更新 MD 文件
- **新增**：在对应维度（H2）下新增用例，分配临时 ID（???）
- **修改**：更新 H5 标题、H6 前置条件/步骤/预期结果
- **待废弃**：在 H5 标题后追加 `[待废弃]` 标注，不立即删除
- 更新文件头部的测试点摘要表

### Step 5：废弃确认
若有待废弃用例，单独询问处理方式：
```
以下用例已标注 [待废弃]，确认处理方式：
  · AUTH-012  第三方微信登录
[1] 改为 status: deprecated（保留记录，推荐）
[2] 从 MD 中删除
[3] 暂不处理
```

### Step 6：提示后续操作
```
MD 已更新：testing/mindmaps/<模块>.md
  新增：N 条
  修改：N 条
  待废弃：N 条

审查后运行：
/testcase-build testing/mindmaps/<模块>.md
```

---

## 来源 [3] 执行流程（--diff 代码变更驱动）

### Step D1：读取配置
读取 `.claude/config/testcase-workflow.yml`，取 `project.dev_repo`。
路径不存在则报错退出：
```
错误：开发仓路径不存在：<dev_repo>
请检查 .claude/config/testcase-workflow.yml 的 project.dev_repo 字段。
```

### Step D2：运行 git diff
```bash
git -C <dev_repo> diff --name-status <base>...HEAD
```
异常处理：
- ORIG_HEAD 不存在 → 报错：`ORIG_HEAD 不存在，请先在开发仓执行 git pull，或改用其他 base（如 main / HEAD~N）。`
- 变更文件为 0 → 输出：`当前无代码变更（对比 <base>）。` 并结束。

### Step D3：推断影响模块
遍历变更文件，与 `module_map` 路径做包含匹配，输出：
```
代码变更分析（对比 main）：
  变更文件 N 个 → 影响模块：
    · auth     （src/auth/login.tsx, src/auth/register.tsx）
    · payment  （src/payment/checkout.ts）
    · [未匹配] src/utils/date.ts → 无对应模块，跳过

继续更新以上模块？[Y/n]
```
若带 `--modules` 参数，只处理指定模块与变更文件的交集。

### Step D4：逐模块差异分析
读取 `testing/mindmaps/<模块>.md`，结合变更文件内容分析，每条附加变更来源：
```
变更影响分析 — auth 模块：
  需修改用例（N 条）：
    · AUTH-003  密码重置流程
      原因：src/auth/reset.ts 中 TOKEN_EXPIRE 从 86400 改为 3600
  新增用例（N 条）：
    · [新增] 短信验证码登录
      原因：src/auth/sms-login.ts 为新增文件
  待废弃用例（N 条）：
    · AUTH-012  微信登录
      原因：src/auth/wechat.ts 已删除

确认后继续？[Y/n]
```

### Step D5：更新 MD 文件
同来源 [1]/[2] 的 Step 4。

### Step D6：废弃确认
同来源 [1]/[2] 的 Step 5。

### Step D7：提示后续操作
```
已更新 N 个模块：
  · testing/mindmaps/auth.md（新增 N | 修改 N | 待废弃 N）
  · testing/mindmaps/payment.md（修改 N）

审查后运行：
  /testcase-build testing/mindmaps/auth.md
  /testcase-build testing/mindmaps/payment.md
```

---

## 注意事项
- 只修改 MD 文件，不直接操作 YAML（由 /testcase-build 负责）
- 保留现有用例的 ID 标注（即使是 ???），由 /testcase-build 统一处理
- 修改前输出差异分析，等待用户确认后再写入
- 废弃用例先标注 `[待废弃]`，确认后再决定处理方式

**批量模式（`--modules` 参数）：**
- 按逗号分割模块列表，依次对每个模块执行更新流程
- 每个模块完成后输出变更摘要，全部完成后输出汇总
- 任一模块失败时，提示错误并继续处理下一个模块
