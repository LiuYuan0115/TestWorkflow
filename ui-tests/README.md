# UI 自动化测试

基于 Playwright + Midscene (AI 视觉定位) + Vitest + Allure 的 UI 自动化测试框架。

## 快速开始

```bash
# 1. 安装依赖
npm install

# 2. 配置环境
cp .env.example .env
# 编辑 .env，填写 Midscene API 配置

# 3. 获取登录态（如需登录）
npm run auth

# 4. 运行测试
npm test
```

## 四层架构

```
src/
├── components/    组件层：可复用 UI 控件
├── pages/         页面层：单页面操作封装
├── services/      服务层：跨页面业务流程
└── tests/         测试层：测试用例（仅断言）
```

**调用方向**：tests → services → pages → components（严格单向）

## AI-Only 定位策略

首次实现全部使用 Midscene AI 定位，不写 CSS 选择器。

```typescript
await this.withFallback({
  label: "点击登录按钮",
  cssAction: async () => false,
  aiFallback: async () => {
    await this.getAgent().aiTap("登录按钮");
  },
  aiOnly: true,
});
```

## 常用命令

| 命令 | 说明 |
|------|------|
| `npm test` | 运行全部测试 |
| `npm run test:smoke` | 运行冒烟测试 |
| `npm run test:p0` | 运行 P0 级别测试 |
| `npm run test:debug` | 调试模式（显示浏览器） |
| `npm run auth` | 半自动登录获取 Cookie |

## 使用 /ui-automation 生成测试

在 Claude Code 中：

```bash
/ui-automation 编写测试：验证用户可以成功登录
```

AI 会自动：
1. 分析需求
2. 生成四层架构代码
3. 运行验证测试

## 文档

- [QUICKSTART.md](QUICKSTART.md) - 详细开始指南
- [../.claude/skills/ui-automation/](../.claude/skills/ui-automation/) - 完整规范
