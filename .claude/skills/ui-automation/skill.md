# UI Automation Skill

AI 驱动的 UI 自动化测试生成工具。

## 使用方式

```
/ui-automation <测试需求描述>
/ui-automation --from-yaml <UI测试用例YAML路径>
/ui-automation --from-yaml <YAML路径> --cases <用例ID列表>
```

### 模式说明

| 模式 | 触发条件 | 行为 |
|------|---------|------|
| **自然语言模式** | 无 --from-yaml 参数 | 解析自然语言需求（现有流程） |
| **YAML 用例模式** | 有 --from-yaml 参数 | 读取 UI 测试用例 YAML 生成代码 |

YAML 用例模式下：
- `--from-yaml <路径>`：读取指定 UI 测试用例 YAML 文件
- `--cases <ID,ID,...>`：可选，指定只生成部分用例

## 工作流程

本 Skill 采用三 Agent 流水线：

1. **th-analyzer** — 需求分析：解析用户需求，扫描代码库，输出结构化测试任务
2. **th-implementer** — 代码生成：根据分析结果生成四层架构测试代码（AI-Only 优先）
3. **th-verifier** — 验证运行：架构审查 + 运行测试 + 错误分类 + 截图分析

## 执行流程

当用户调用 `/ui-automation` 时：

### 阶段 1：分析（ANALYZE）

请切换角色，参考 `agents/th-analyzer.md` 的角色定义执行需求分析：
- 解析用户需求
- 确定测试文件存放位置
- 读取相邻已有测试用例
- 扫描代码库了解待测功能
- 分析可复用的 Page/Service
- 输出结构化分析到 `.claude/skills/ui-automation/artifacts/_analysis.md`

分析完成后，向用户展示分析结果并等待确认。

#### YAML 用例模式（--from-yaml）

当检测到 `--from-yaml` 参数时，th-analyzer 执行不同的分析流程：
1. 读取并解析 UI 测试用例 YAML
2. 如果指定了 `--cases`，只保留指定 ID 的用例
3. 步骤质量预检查（评分规则同 `/testcase-ui-enhance`）
4. 分析可复用的 Page/Service
5. 输出分析结果到 `_analysis.md`（含 YAML 来源标记）

### 阶段 2：实现（IMPLEMENT）

用户确认后，切换角色参考 `agents/th-implementer.md` 执行代码生成：
- 读取 `_analysis.md`
- 读取 `architecture-reference.md` 和 `midscene-api-reference.md`
- 按 AI-Only 优先原则生成测试代码
- 严格遵守四层架构（components → pages → services → tests）
- 保护已有函数（未经批准不得修改）
- 生成完整可运行的测试用例

#### YAML 用例模式下的交互补充

当 `_analysis.md` 中存在"需补充步骤"时：
1. 向用户展示每个简略步骤的 AI 建议，用 AskUserQuestion 确认
2. 使用确认后的描述生成代码
3. **回写 YAML**：将补充后的描述同步更新到源 UI 测试用例文件
   - 更新 action 字段
   - 更新 metadata.last_enhanced、enhanced_by、enhanced_steps
   - 更新 automation_status 为 "generated"
   - 更新 test_file 为生成的测试文件路径
4. 在 `_verification.md` 中记录步骤优化内容

### 阶段 3：验证（VERIFY）

代码生成后，切换角色参考 `agents/th-verifier.md` 执行验证：
- 架构审查（检查层级依赖关系）
- AI-Only 检查（确保首次实现使用 AI 定位）
- 运行测试：`cd ui-tests && node scripts/run-test.js --maxWorkers=1 <测试文件路径>`
- 错误分类（PASS / 架构违规 / 测试失败）
- 截图分析（AI 失败时）
- 输出验证报告到 `.claude/skills/ui-automation/artifacts/_verification.md`

### 阶段 4：结果判断（JUDGE）

根据验证结果：
- **✅ 通过** → 向用户报告成功，展示测试文件路径
- **❌ 架构违规** → 返回 IMPLEMENT 阶段修复（不计入重试）
- **❌ 测试失败** → 最多重试 2 次，超过则报告失败原因和截图分析

## 产物

- **分析结果**：`.claude/skills/ui-automation/artifacts/_analysis.md`
- **验证报告**：`.claude/skills/ui-automation/artifacts/_verification.md`
- **测试代码**：`ui-tests/src/tests/<模块>/<用例>.test.ts`
- **支持代码**：`ui-tests/src/pages/`、`ui-tests/src/services/`

## 核心规则

- **AI-Only 优先**：首次实现全部使用 Midscene AI 定位（aiTap/aiInput/aiAssert）
- **四层架构**：components → pages → services → tests，严格单向依赖
- **已有函数保护**：修改已有函数必须经用户确认后列入 approved_modifications
- **测试失败重试**：最多 2 次，架构违规不计入重试次数

## 参考文档

- `architecture-reference.md` — 四层架构规范
- `midscene-api-reference.md` — Midscene API 使用指南
- `dom-inspector.md` — DOM 探针使用方法
- `best-practices/` — 各模块最佳实践
