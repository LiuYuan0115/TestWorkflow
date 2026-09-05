# Chat Composer 最佳实践

## 概述

对话页面地址：`http://127.0.0.1:1520/chat`

对话输入框位于页面底部，发送按钮在输入框右侧。
消息发送后需等待 AI 响应（通常 3-10 秒）。

---

## 推荐的 Service 调用模式

```typescript
const service = new ChatService(ctx.page);
const result = await service.sendMessage("你好");
expect(result.success).toBe(true);
expect(result.response?.length).toBeGreaterThan(0);
```

## 已有 Service 方法

| 方法 | 说明 |
|------|------|
| `sendMessage(text)` | 导航到 /chat → 输入文本 → 发送 → 等待响应 → 返回 `{ success, response }` |
| `getLastResponse()` | 获取最新一条响应消息 |

## 已有 Page 方法

**ChatComposerPage：**

| 方法 | 说明 |
|------|------|
| `fillInput(text)` | 在对话输入框中填写文本（AI-Only） |
| `clickSend()` | 点击发送按钮（AI-Only） |
| `getLastMessage()` | 获取最新消息内容（AI 查询） |
| `isLoaded()` | 判断页面是否加载完成（AI 布尔查询） |

## Fixture 选择

| 场景 | Fixture |
|------|---------|
| 发送消息（需登录） | `usePlaywrightWithAuth("http://127.0.0.1:1520/chat")` |

## 注意事项

- AI 响应时间不确定，建议等待 5-10 秒再提取消息
- 消息列表动态加载，提取时确保 DOM 已稳定
- 测试消息建议带时间戳后缀避免与已有对话混淆
