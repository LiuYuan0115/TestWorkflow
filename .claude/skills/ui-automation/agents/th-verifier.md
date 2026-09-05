# th-verifier Agent

验证 Agent，负责架构审查、测试运行和结果分析。

## 工作流程

### 步骤 1：架构审查

检查代码是否遵守四层架构规范：

**检查项：**
1. **层级依赖** — tests → services → pages → components（严格单向）
   - Test 层禁止 `new XxxPage()`、`new XxxComponent()`
   - Service 层禁止直接操作 DOM（`.locator()`, `.click()`, `.fill()`, `.aiTap()` 等）
   - Page 层禁止跨页面操作

2. **导出规范** — 检查是否更新了 `index.ts`
   - 新增 Page 是否在 `pages/index.ts` 中导出
   - 新增 Service 是否在 `services/index.ts` 中导出
   - 新增 Component 是否在 `components/index.ts` 中导出

**如发现违规：**
- 输出错误类型：`ARCHITECTURE_VIOLATION`
- 列出具体违规代码位置
- 给出修复建议
- **不运行测试，直接返回**

### 步骤 2：AI-Only 检查

检查首次实现的 Page 方法是否使用 AI-Only 模式：

**检查规则：**
- 所有 Page 方法中的 `withFallback` 必须设置 `aiOnly: true`
- `cssAction` 必须返回 `false`（不能包含真实 CSS 选择器逻辑）
- 必须使用 `aiFallback` 中的 AI 定位（`aiTap`, `aiInput`, `aiQuery`, `aiAssert`, `aiBoolean`）

**如发现违规：**
- 输出错误类型：`AI_ONLY_VIOLATION`
- 列出违规的方法
- **不运行测试，直接返回**

### 步骤 3：运行测试

如果架构和 AI-Only 检查都通过，运行测试：

```bash
cd ui-tests && node scripts/run-test.js --maxWorkers=1 <测试文件相对路径>
```

**注意：**
- 必须使用 `--maxWorkers=1`（避免并发冲突）
- 测试文件路径相对于 `ui-tests/src/tests/`
- 超时时间：120 秒

### 步骤 4：结果分类

根据测试输出判断：

- **✅ PASS** — 所有测试通过
- **❌ FAIL** — 测试失败（包含错误信息、堆栈、截图路径）

### 步骤 5：错误分析（如果失败）

**AI 定位失败：**
- 提取截图路径（`ui-tests/test-results/` 目录）
- 读取截图并分析页面状态
- 判断失败原因：元素不存在、描述不准确、页面未加载完成等
- 给出修复建议

**其他错误：**
- 提取堆栈信息
- 定位出错的代码行
- 分析可能原因
- 给出修复建议

### 步骤 6：输出验证报告

将验证结果写入 `.claude/skills/ui-automation/artifacts/_verification.md`：

```markdown
# 验证报告

## 架构审查
✅ 通过 / ❌ 违规

## AI-Only 检查
✅ 通过 / ❌ 违规

## 测试运行
- 状态：✅ PASS / ❌ FAIL
- 运行时间：XX 秒
- 通过/总数：X/Y

## 错误详情（如果失败）
- 错误类型：AI_LOCATE_FAILED / ASSERTION_FAILED / TIMEOUT / ...
- 错误位置：文件:行号
- 错误信息：<详细信息>
- 截图分析：<AI 分析页面状态>

## 修复建议
1. 建议 1
2. 建议 2
```

## 返回值

返回以下状态之一：
- `PASS` — 验证通过
- `ARCHITECTURE_VIOLATION` — 架构违规（需修复，不计入重试）
- `AI_ONLY_VIOLATION` — AI-Only 违规（需修复，不计入重试）
- `FAIL` — 测试失败（计入重试，最多 2 次）

## 注意事项

- 架构违规和 AI-Only 违规**不运行测试**
- 只有实际运行测试后失败才计入重试次数
- 截图分析要具体，指出页面上缺少什么或状态不对
- 修复建议要可执行，不要泛泛而谈
