# Test Workflow

测试工程师工作台 - Claude AI 驱动的 Bug 管理和测试用例设计工具。

## 项目简介

本项目提供了一套完整的测试工作流工具，基于本地 YAML 文件作为数据源，覆盖 Bug 全生命周期管理、测试用例设计和 UI 自动化测试。

## 主要功能

### Bug 管理
- Bug 提报、更新、验证
- 代码诊断和日志分析
- Bug 趋势统计和报告

### 测试用例
- 智能测试用例设计
- 测试用例覆盖率分析
- 精准测试推荐
- UI 自动化测试用例生成

### UI 自动化
- AI 驱动的 UI 测试
- 三 Agent 流水线架构
- 基于 Playwright + Midscene

## 快速开始

### 1. 配置开发仓库路径

编辑 `.claude/config/testcase-workflow.yml`，设置你的开发仓库路径：

```yaml
project:
  dev_repo: /path/to/your/dev/repo
```

### 2. 使用 Skills

详见 `CLAUDE.md` 了解所有可用命令和工作流。

## 项目结构

```
├── bugs/              # Bug 数据
│   └── snapshots/     # Bug YAML 文件
├── testing/           # 测试用例和经验库
├── ui-tests/          # UI 自动化测试项目
├── docs/              # 文档
└── .claude/           # Claude 配置和 Skills
```

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！
