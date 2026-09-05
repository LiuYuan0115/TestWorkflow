---
name: testcase-build
description: 当用户输入 /testcase-build <MD路径> 时使用。将 MD 格式测试用例解析后写入 YAML 数据文件。
allowed-tools: [Read, Write, Edit, Bash, AskUserQuestion]
---
# /testcase-build — 测试用例合入 YAML

## 触发场景
用户运行 `/testcase-build <MD路径>` 或提到"合入用例"、"把 MD 写入 YAML"时激活。

## 直接模式（带参数）
```
/testcase-build testing/mindmaps/<模块>.md
/testcase-build testing/mindmaps/<模块>.md --dry-run
```

## 交互模式（无参数启动）

无参数时，列出 `testing/mindmaps/` 下所有 MD 文件（排除 `_drafts/`），供用户选择：

```
请选择要处理的 MD 文件：
  [1] auth-login.md        （最近修改：YYYY-MM-DD）
  [2] payment.md           （最近修改：YYYY-MM-DD）
  [3] 手动输入路径

是否先预览变更？[y/n]（等同于 --dry-run）
```

若 `testing/mindmaps/` 下无 MD 文件，提示：
```
testing/mindmaps/ 下暂无用例文件。请先运行 /testcase-design 生成用例。
```

## 执行流程

### Step 1：解析 MD 文件
读取指定 MD 文件，按 H1-H6 层级解析：
- H1：模块名（文档标题）
- H2：测试维度（正常场景 / 异常场景 / 边界场景 / 兼容性场景 / 性能场景 / 安全场景）
- H3：功能测试点
- H4：验证点
- H5：用例场景描述（用例标题）
- H6：三部分子标题（见下方解析规则）

### Step 2：H6 三部分解析规则

新格式 MD 的 H6 包含三个子标题，解析规则：
```
###### 前置条件  →  YAML precondition 字段
###### 测试步骤  →  YAML steps 字段（每行映射为 {action: "...", expected: ""}）
###### 预期结果  →  YAML expected_result 字段
```

**兼容性**：旧格式（H6 只有预期结果）继续正常解析，`precondition` 和 `steps` 留空。

### Step 3：生成 YAML 用例
每个 H5 用例生成一条 YAML 记录，写入 `testing/testcases/<模块>.yml`（字段结构见 `assets/testcase-template.yml`）。

### Step 4：增量合入策略
- **[NEW]**：MD 中有、YAML 中无 → 追加新记录，分配正式 ID
- **[UPDATED]**：MD 中有、YAML 中有（按标题匹配）→ 更新 title/precondition/steps/expected_result，**不覆盖** `linked_code.confirmed`、`similar_testcases`、`linked_bugs`
- **[REMOVED]**：YAML 中有、MD 中无 → 标记 `status: deprecated`，不删除

### Step 5：更新 index.yml
在 `testing/index.yml` 中更新模块的用例统计：
```yaml
modules:
  <模块>:
    file: testcases/<模块>.yml
    total: N
    last_updated: YYYY-MM-DD
```

### Step 6：更新 CHANGELOG.md
在 `testing/CHANGELOG.md` 末尾追加变更记录：
```
## YYYY-MM-DD <模块>
- [NEW] N 条新增
- [UPDATED] N 条更新
- [REMOVED] N 条废弃
```

## --dry-run 模式
不写入任何文件，仅输出预览：
```
预览变更（--dry-run，不写入）：
  [NEW]     AUTH-007 用户使用正确凭据登录
  [UPDATED] AUTH-001 用户输入错误密码登录
  [REMOVED] AUTH-003 （已从 MD 中删除）

确认写入？[y/n]
```

## YAML 独有字段保护
以下字段在 [UPDATED] 时**不被覆盖**：
- `linked_code.ai`（/testcase-design 写入，/testcase-build 不覆盖）
- `linked_code.confirmed`（人工确认，/testcase-build 不覆盖）
- `similar_testcases`
- `linked_bugs`
- `status`（除非 MD 中明确标注废弃）

## 完成后输出
```
合入完成：testing/testcases/<模块>.yml
  [NEW]     N 条
  [UPDATED] N 条
  [REMOVED] N 条（标记 deprecated）

下一步：运行 /testcase-list 查看用例库，或 /bug-list 查看关联 Bug。

经验库提示：本次合入是否发现特殊场景或漏测风险？可运行 /experience-add 将其沉淀到经验库。
```
