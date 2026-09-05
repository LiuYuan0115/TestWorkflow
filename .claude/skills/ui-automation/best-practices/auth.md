# 登录/认证最佳实践

## 概述

登录页地址：`http://127.0.0.1:1520/login`

登录成功后 URL 会离开 login 页面，可通过 `page.url()` 判断。
登录态通过 session cookie 维持。

---

## 推荐的 Service 调用模式

```typescript
const service = new AuthService(ctx.page);
const result = await service.login(username, password);
expect(result.success).toBe(true);
```

## 已有 Service 方法

| 方法 | 说明 |
|------|------|
| `login(username, password)` | 打开登录页 → 填表单 → 提交 → 返回 `{ success, errorMessage }` |
| `isLoggedIn()` | 检查页面上是否有用户头像/用户名（AI 判断） |

## 已有 Page 方法

**LoginPage：**

| 方法 | 说明 |
|------|------|
| `fillUsername(username)` | 填写用户名/邮箱（AI-Only） |
| `fillPassword(password)` | 填写密码（AI-Only） |
| `clickSubmit()` | 点击登录按钮（AI-Only） |
| `isLoginSuccess()` | 检查 URL 是否离开 login |
| `getErrorMessage()` | 提取错误提示文字（AI 查询） |

## Fixture 选择

| 场景 | Fixture |
|------|---------|
| 测试登录本身 | `usePlaywright()` |
| 测试登录后的功能 | `usePlaywrightWithAuth()` |

## 注意事项

- 应用是本地部署，确保前端服务已启动（127.0.0.1:1520）
- 需配置 `TEST_USERNAME` 和 `TEST_PASSWORD` 环境变量
