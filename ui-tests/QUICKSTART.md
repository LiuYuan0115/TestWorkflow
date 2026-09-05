# UI 自动化测试快速开始

## 前置条件

1. **应用已启动**（如适用）
   ```bash
   npm run check:app
   ```

2. **Midscene API 已配置**
   ```bash
   cp .env.example .env
   # 编辑 .env
   ```

## 完整测试流程

```bash
cd ui-tests

# 1. 安装依赖
npm install

# 2. 配置环境变量
cp .env.example .env
# 编辑 .env，填写 Midscene API 配置

# 3. 获取登录态（如需要）
npm run auth
# 在浏览器中手动登录，脚本会自动保存 Cookie

# 4. 运行测试
npm test
```

## 常用命令

### 测试执行

| 命令 | 说明 |
|------|------|
| `npm test` | 运行所有测试 |
| `npm run test:smoke` | 运行冒烟测试 |
| `npm run test:p0` | 运行 P0 级别测试 |
| `npm run test:debug` | 调试模式（显示浏览器） |
| `npm run test:headless` | 无头模式 |

### 认证

| 命令 | 说明 |
|------|------|
| `npm run auth` | 手动登录获取会话状态 |

## 使用 /ui-automation Skill

在 Claude Code 中使用自然语言生成测试：

```bash
/ui-automation 编写一个测试用例，验证用户能够成功发送消息
```

Skill 会自动：
1. 分析需求
2. 生成代码（四层架构）
3. 验证运行

## 更多文档

- [README.md](README.md) - 项目概览
- [../.claude/skills/ui-automation/](../.claude/skills/ui-automation/) - 完整规范
