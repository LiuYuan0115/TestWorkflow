# UI 自动化测试

基于 Playwright + Midscene (AI 视觉定位) + Vitest + Allure 的 UI 自动化测试工程。

## 快速开始

```bash
# 1. 安装依赖
cd ui-tests
npm install

# 2. 配置环境变量
cp .env.example .env
# 编辑 .env，填写 Midscene API 配置和登录账号

# 3. 获取登录态（半自动）
npm run auth

# 4. 运行测试
npm test

# 5. 查看报告
npm run report
```

## 四层架构

```
src/
├── components/    组件层：可复用 UI 控件（Input、Button、Nav、Alert）
├── pages/         页面层：单页面操作封装（LoginPage、ChatComposerPage）
├── services/      服务层：跨页面业务流程（AuthService、ChatService）
└── tests/         测试层：测试用例（仅调用 Service，仅写 expect）
```

**调用方向**：tests → services → pages → components（严格单向，禁止反向依赖）

## AI-Only 定位策略

首次实现全部使用 Midscene AI 定位（`aiTap`/`aiInput`/`aiAssert`），不写真实 CSS 选择器。
CSS 仅在 AI 定位多次失败且通过探针确认稳定后，作为优化手段引入。

## 常用命令

| 命令 | 说明 |
|------|------|
| `npm test` | 运行全部测试 |
| `npm run test:smoke` | 仅运行 @smoke 标签用例 |
| `npm run test:p0` | 仅运行 @p0 优先级用例 |
| `npm run test:headless` | 无头模式运行 |
| `npm run auth` | 半自动登录获取 Cookie |
| `npm run report` | 打开 Allure 报告 |
| `npm run report:save` | 保存报告快照 |
| `npm run report:open` | 打开历史报告 |

## 被测应用

- **前端地址**：http://127.0.0.1:1520
- **后端地址**：http://127.0.0.1:2130

