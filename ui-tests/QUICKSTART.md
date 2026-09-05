# UI 自动化测试快速开始

## 📋 前置条件

1. **应用已启动**
   ```bash
   # 检查应用状态
   cd ui-tests
   npm run check:app
   ```

2. **Midscene API 已配置**
   ```bash
   # 编辑 .env 文件
   MIDSCENE_MODEL_NAME=your-model
   MIDSCENE_MODEL_API_KEY=your-api-key
   ```

## 🚀 完整测试流程

### 方式 1：自动启动应用（推荐）

```bash
cd ui-tests

# 1. 启动应用（后台运行）
npm run start:app

# 2. 等待应用就绪（自动检测）
npm run check:app

# 3. 获取登录态
npm run auth
# 在浏览器中手动登录，脚本会自动保存 Cookie

# 4. 运行测试
npm test

# 5. 停止应用（可选）
npm run stop:app
```

### 方式 2：手动启动应用

```bash
# 终端 1: 启动控制平面
cd /path/to/your/project
npm run dev:control-plane

# 终端 2: 启动 API 网关
cd /path/to/your/project
npm run dev:api

# 终端 3: 启动前端
cd /path/to/your/project
npm run dev:web

# 终端 4: 运行测试
cd ui-tests
npm run check:app  # 确认应用就绪
npm run auth       # 获取登录态
npm test           # 运行测试
```

## 🔧 常用命令

### 应用管理

| 命令 | 说明 |
|------|------|
| `npm run start:app` | 启动应用（三个服务） |
| `npm run stop:app` | 停止应用 |
| `npm run check:app` | 健康检查（检测端口是否就绪） |

### 测试执行

| 命令 | 说明 |
|------|------|
| `npm test` | 运行所有测试 |
| `npm run test:smoke` | 运行冒烟测试 |
| `npm run test:p0` | 运行 P0 级别测试 |
| `npm run test:failed` | 重跑失败用例 |
| `npm run test:debug` | 调试模式（显示浏览器） |
| `npm run test:headless` | 无头模式 |

### 认证与报告

| 命令 | 说明 |
|------|------|
| `npm run auth` | 手动登录获取会话状态 |
| `npm run report` | 生成 Allure 报告 |
| `npm run test:report` | 运行测试并自动打开报告 |

## 📂 会话状态文件

登录成功后会生成：
```
ui-tests/.auth-state.json  # 保存登录 Cookie，测试时自动加载
```

## ⚠️ 常见问题

### 1. 应用未启动

**现象**：`npm run auth` 提示 `ERR_CONNECTION_REFUSED`

**解决**：
```bash
npm run check:app  # 检查应用状态
npm run start:app  # 启动应用
```

### 2. 登录超时

**现象**：`等待超时（2分钟）,未检测到登录成功`

**原因**：
- 未在浏览器中完成登录操作
- 登录页面加载失败
- Cookie 检测逻辑未匹配到会话 token

**解决**：
1. 确保在浏览器弹出窗口中完成登录
2. 手动验证 `127.0.0.1:1520` 可访问
3. 检查登录后是否跳转到首页

### 3. Playwright 浏览器未安装

**现象**：`Executable doesn't exist`

**解决**：
```bash
npx playwright install chromium
```

## 🎯 使用 /ui-automation Skill

在 Claude Code 中使用自然语言生成测试：

```bash
/ui-automation 编写一个测试用例，验证用户能够成功发送对话消息
```

Skill 会自动：
1. 分析需求（th-analyzer）
2. 生成代码（th-implementer）
3. 验证运行（th-verifier）

## 📖 更多文档

- [四层架构规范](../.claude/skills/ui-automation/architecture-reference.md)
- [Midscene API 文档](../.claude/skills/ui-automation/midscene-api-reference.md)
- [项目规范配置](../.claude/config/ui-automation-rules.md)
- [主 README](README.md)
