# 项目说明

测试工程师工作台。以本地 YAML 为真相源，覆盖 Bug 全生命周期管理与测试用例设计。

## 目录结构

| 路径 | 用途 |
|------|------|
| `bugs/snapshots/` | Bug 数据（单个 YAML + index.yml 索引） |
| `bugs/assets/` | Bug 截图（不进 Git） |
| `testing/` | 测试用例与经验库 |
| `.claude/skills/` | Skill 定义（每个 skill 一个文件夹） |
| `.claude/config/` | 配置文件（dev_repo、module_map 等） |

## Bug Skills

| 命令 | 说明 |
|------|------|
| `/bug-report` | 提报 Bug — 自由描述 → AI 结构化分析 → 确认/修改 → 写入 YAML；支持从分析 skills 调用并预填充信息 |
| `/bug-update <ID>` | 修改 Bug — 仅限 open 状态，补充字段或变更为 rejected/deferred；支持 `--batch` 批量变更状态 |
| `/bug-verify <ID>` | 复测 Bug — 同步状态，记录 pass/fail 结果 |
| `/bug-analyze` | 代码诊断 — 支持 Bug ID 或截图/描述两种模式，扫描代码定位可疑位置；分析完成后可调用 `/bug-report` 创建记录 |
| `/bug-log-analyze` | 日志诊断 — 支持 Bug ID 或截图/描述两种模式，智能分析本地开发或正式安装包日志（8-15秒），自动判断环境；分析完成后可调用 `/bug-report` 创建记录 |
| `/bug-list` | 查看 Bug 列表 — 支持按状态/模块/严重度筛选 |
| `/bug-trend` | 趋势报告 — 统计本周/本月新增、关闭、重开等指标 |

## Testcase Skills

| 命令 | 说明 |
|------|------|
| `/testcase-design` | 生成测试用例 — 为指定模块设计测试用例；模块过大时自动提示子模块选择 |
| `/testcase-build <MD路径>` | 合入用例 — 将 MD 格式用例写入 YAML |
| `/testcase-update` | 更新测试用例 — 根据新需求更新已有用例；支持 PRD 文档、文字描述、`--diff <base>` 代码变更三种来源；支持 `--modules` 批量更新多模块 |
| `/testcase-coverage` | 覆盖率报告 — 展示各模块用例覆盖情况，标出未覆盖模块和缺失维度 |
| `/testcase-ui-generate` | 生成 UI 测试用例 — 从功能用例筛选 P0/P1 转换为 UI 自动化用例；支持 `--module`、`--from`、`--update` |
| `/testcase-ui-enhance` | 优化 UI 用例步骤 — 批量检查并补充步骤描述的元素特征和位置上下文 |
| `/test-recommend` | 精准测试推荐 — 根据开发仓代码变更，从用例库推荐需要执行的测试用例；支持 `main / pull / HEAD~N` 等 base 模式，可选生成执行清单 YAML |
| `/experience-add` | 写入经验库 — 记录漏测场景或补充测试模板到 `testing/experience.md` |

## Bug 诊断典型工作流

**发现新 bug，快速诊断**
```
/bug-log-analyze              # 上传截图 + 描述问题
                              # AI 自动判断环境，智能采样日志，8-15秒输出诊断
选择 [1] 调用 /bug-report    # 自动预填充分析结果
确认后创建 bug 记录
```

**已有 bug 记录，深入分析**
```
/bug-log-analyze BUG-0042     # 先看日志，定位问题方向
/bug-analyze BUG-0042         # 再看代码，找到根本原因
```

**本地开发遇到问题**
```
/bug-log-analyze              # 描述 "pnpm dev:tauri 启动失败"
                              # 自动识别本地环境，读取项目日志和进程输出
                              # 给出解决方案（通常不需要提 bug）
```

## 使用时机

| 场景 | 推荐命令 |
|------|---------|
| 发现 bug，不确定原因 | `/bug-log-analyze`（上传截图/描述） |
| 已有 bug，需要代码分析 | `/bug-analyze <ID>` |
| 发现 bug，直接提报 | `/bug-report` |
| 新模块上线，首次生成用例 | `/testcase-design` |
| 代码功能变更（新增/修改），同步更新用例内容 | `/testcase-update --diff <base>` |
| 有 PRD 文档，按需求更新用例 | `/testcase-update <PRD路径>` |
| 将 MD 用例写入 YAML 数据文件 | `/testcase-build <MD路径>` |
| 从功能用例生成 UI 自动化用例 | `/testcase-ui-generate` |
| 批量优化 UI 用例步骤描述 | `/testcase-ui-enhance` |
| 从 UI 用例生成自动化代码 | `/ui-automation --from-yaml` |
| 提测前，确认需要执行哪些用例 | `/test-recommend <base>` |
| 查看各模块用例覆盖情况 | `/testcase-coverage` |
| 发现漏测场景，记录经验 | `/experience-add` |

## 典型工作流

**功能迭代（代码已改）**
```
/testcase-update --diff main   # 分析代码变更 → 更新用例 MD
/testcase-build <MD路径>       # 将 MD 同步到 YAML
/test-recommend main           # 推荐本次提测需执行的用例
```

**新模块首次覆盖**
```
/testcase-design               # 生成用例 MD
/testcase-build <MD路径>       # 写入 YAML
/testcase-coverage             # 确认覆盖情况
```

**提测 / 回归**
```
/test-recommend <base>         # 生成执行清单（--save 直接保存）
```

**UI 自动化（从功能用例到代码）**
```
/testcase-ui-generate --module <模块>    # 从功能用例筛选生成 UI 用例
/testcase-ui-enhance testing/ui-testcases/<模块>.yml  # 优化步骤描述
/ui-automation --from-yaml testing/ui-testcases/<模块>.yml  # 生成自动化代码
```

## UI Automation Skills

| 命令 | 说明 |
|------|------|
| `/ui-automation` | AI 驱动 UI 自动化测试 — 自然语言描述需求 → 分析 → 代码生成 → 验证运行；支持 `--from-yaml` 从 UI 测试用例生成 |

### 三 Agent 流水线

| 阶段 | Agent | 职责 |
|------|-------|------|
| ANALYZE | th-analyzer | 自然语言需求 → 结构化测试任务（_analysis.md） |
| IMPLEMENT | th-implementer | 分析结果 → 四层架构代码（AI-Only 优先） |
| VERIFY | th-verifier | 架构审查 + 运行测试 + 错误分类 + 截图分析 |

### 核心规则

- **AI-Only 优先**：首次实现全部使用 Midscene AI 定位（aiTap/aiInput/aiAssert）
- **四层架构**：components → pages → services → tests，严格单向依赖
- **已有函数保护**：修改已有函数必须经用户确认后列入 approved_modifications
- **测试失败重试**：最多 2 次，架构违规不计入重试次数

### 目录说明

| 路径 | 用途 |
|------|------|
| `ui-tests/` | 独立 UI 自动化测试项目（Playwright + Midscene + Vitest + Allure） |
| `ui-tests/src/components/` | 组件层：可复用 UI 控件封装 |
| `ui-tests/src/pages/` | 页面层：单页面操作封装 |
| `ui-tests/src/services/` | 服务层：跨页面业务流程 |
| `ui-tests/src/tests/` | 测试层：测试用例 |
| `ui-tests/scripts/` | 运行脚本（测试、报告、登录） |
| `testing/ui-testcases/` | UI 测试用例（从功能用例筛选转换） |
| `.claude/skills/ui-automation/` | Skill 定义 + Agent prompt + 参考文档 |
| `.claude/config/ui-automation-rules.md` | 项目级 UI 自动化规范 |
