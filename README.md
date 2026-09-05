# Claude AI 测试工作流框架

> 基于 Claude AI 的智能测试工作流系统，支持测试用例设计、Bug 管理、UI 自动化测试

## 🚀 快速开始

```bash
# 1. 克隆项目
git clone https://github.com/你的用户名/test-workflow.git
cd test-workflow

# 2. 配置项目
# 编辑 .claude/config/testcase-workflow.yml，设置你的项目路径和模块映射

# 3. 在 Claude Code 中打开项目
# 使用 / 命令调用各种测试技能
```

## 📁 项目结构

```
.
├── .claude/
│   ├── config/
│   │   ├── testcase-workflow.yml    # 测试工作流配置
│   │   └── ui-automation-rules.md   # UI 自动化规范
│   └── skills/                       # Claude AI 技能集
│       ├── testcase-design/         # 测试用例设计
│       ├── testcase-build/          # 用例构建
│       ├── bug-report/              # Bug 提报
│       ├── bug-update/              # Bug 更新
│       └── ui-automation/           # UI 自动化测试生成
├── bugs/
│   └── snapshots/                   # Bug 数据存储
├── testing/
│   ├── mindmaps/                    # 测试用例思维导图
│   ├── testcases/                   # 测试用例 YAML 数据
│   └── ui-testcases/                # UI 自动化测试用例
└── ui-tests/                        # UI 自动化测试工程（Playwright + Midscene）
```

## ✨ 核心功能

### 1. 测试用例管理

**自动生成测试用例**
```bash
/testcase-design --module <模块名>
```
- 从代码自动分析生成测试用例
- 支持正常/异常/边界/性能等多维度
- 输出 Markdown 思维导图格式

**构建测试用例库**
```bash
/testcase-build testing/mindmaps/<模块>.md
```
- 将 Markdown 转换为结构化 YAML
- 增量合入，支持 NEW/UPDATED/REMOVED
- 自动更新 CHANGELOG

**测试用例覆盖率分析**
```bash
/testcase-coverage --module <模块名>
```

### 2. Bug 生命周期管理

**提报 Bug**
```bash
/bug-report
```
- AI 结构化分析 Bug 描述
- 自动推断严重度、模块、复现步骤
- 生成企微复制文本

**更新 Bug 状态**
```bash
/bug-update BUG-0001
```
- 状态流转：open → fixing → fixed → verified → closed
- 关联测试用例和代码

**Bug 趋势分析**
```bash
/bug-trend
```

### 3. UI 自动化测试

**生成 UI 测试代码**
```bash
/ui-automation 编写测试：验证用户可以成功登录
```
- 基于 Playwright + Midscene (AI 视觉定位)
- 严格四层架构：Components → Pages → Services → Tests
- AI-Only 定位策略，无需维护 CSS 选择器

**四层架构**
```
ui-tests/src/
├── components/    # 可复用 UI 控件（Button、Input）
├── pages/         # 页面操作封装（LoginPage）
├── services/      # 业务流程封装（AuthService）
└── tests/         # 测试用例（仅断言）
```

### 4. 测试推荐

**基于代码变更推荐测试**
```bash
/test-recommend
```
- 读取 Git 变更，智能推荐相关测试用例
- 支持多种 base 模式：main / pull / HEAD~N

## 🛠️ 技能列表

| 技能 | 说明 |
|------|------|
| `/testcase-design` | 测试用例设计生成 |
| `/testcase-build` | 测试用例构建入库 |
| `/testcase-update` | 测试用例更新 |
| `/testcase-coverage` | 测试覆盖率分析 |
| `/test-recommend` | 智能测试推荐 |
| `/bug-report` | Bug 提报 |
| `/bug-update` | Bug 状态更新 |
| `/bug-verify` | Bug 验证 |
| `/bug-list` | Bug 列表查询 |
| `/bug-trend` | Bug 趋势分析 |
| `/ui-automation` | UI 自动化测试生成 |

详见 `CLAUDE.md` 获取完整文档。

## 📝 配置说明

### 1. 配置测试工作流

编辑 `.claude/config/testcase-workflow.yml`：

```yaml
project:
  dev_repo: /path/to/your/dev/repo  # 开发仓库路径
  module_map:
    # 模块名到代码路径的映射
    auth:
      path: src/modules/auth
      ui_entry: 登录页面 (/login)
    chat:
      path: src/modules/chat
      ui_entry: 对话页面 (/chat)
```

### 2. 配置 UI 自动化

编辑 `ui-tests/.env`：

```bash
# 前端地址
FRONTEND_URL=http://127.0.0.1:1520

# Midscene AI 配置
MIDSCENE_MODEL_NAME=your-model
MIDSCENE_MODEL_API_KEY=your-api-key
```

## 🎯 使用场景

### 场景 1：新功能测试

```bash
# 1. 从代码生成测试用例
/testcase-design --module auth

# 2. 构建用例库
/testcase-build testing/mindmaps/auth.md

# 3. 生成 UI 自动化测试
/ui-automation 生成登录功能的自动化测试
```

### 场景 2：Bug 修复验证

```bash
# 1. 提报 Bug
/bug-report

# 2. 关联测试用例
/bug-update BUG-0001

# 3. 验证 Bug
/bug-verify BUG-0001
```

### 场景 3：回归测试

```bash
# 1. 推荐测试用例
/test-recommend

# 2. 运行 UI 自动化测试
cd ui-tests
npm test
```

## 🔧 UI 自动化测试

### 快速开始

```bash
cd ui-tests

# 安装依赖
npm install

# 配置环境
cp .env.example .env
# 编辑 .env

# 获取登录态
npm run auth

# 运行测试
npm test

# 查看报告
npm run report
```

### 常用命令

| 命令 | 说明 |
|------|------|
| `npm test` | 运行全部测试 |
| `npm run test:smoke` | 运行冒烟测试 |
| `npm run test:debug` | 调试模式 |
| `npm run auth` | 获取登录态 |
| `npm run report` | 查看 Allure 报告 |

## 🌟 特性

- ✅ **AI 驱动**：Claude AI 自动分析代码生成测试用例
- ✅ **结构化管理**：YAML 格式存储，支持版本控制
- ✅ **增量更新**：智能 diff，仅更新变更部分
- ✅ **智能推荐**：基于 Git 变更推荐测试范围
- ✅ **Bug 追踪**：完整生命周期管理
- ✅ **UI 自动化**：AI 视觉定位，无需维护选择器
- ✅ **四层架构**：清晰分层，易于维护

## 📖 文档

- [CLAUDE.md](CLAUDE.md) - 完整技能文档
- [ui-tests/README.md](ui-tests/README.md) - UI 自动化测试文档
- [ui-tests/QUICKSTART.md](ui-tests/QUICKSTART.md) - 快速开始指南

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可

MIT License
