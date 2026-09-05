# Midscene API 参考

> 项目中通过 `this.getAgent()` 获取 `PlaywrightAgent`（在 BasePage / BaseComponent 中懒加载）。

## 方法选择强制规则

编写任何 `aiFallback` 前，先按优先级选择即时操作方法。`aiAction()` 仅作最后手段。

| 优先级 | 操作类型 | 必须使用的方法 |
|--------|---------|--------------|
| 1 | 输入文本 | `aiInput()` |
| 2 | 点击按钮/链接/标签 | `aiTap()` |
| 3 | 滚动 | `aiScroll()` |
| 4 | 按键 | `aiKeyboardPress()` |
| 5 | 悬停 | `aiHover()` |
| 6 | 双击 | `aiDoubleClick()` |
| 7 | 提取数据 | `aiQuery()` / `aiBoolean()` / `aiString()` / `aiNumber()` |
| 8 | 断言/等待 | `aiAssert()` / `aiWaitFor()` |
| 最后 | 复杂复合操作 | `aiAction()` |

禁止：

- 能用 `aiTap()` 点击的，不得用 `aiAction("点击...")`
- 能用 `aiInput()` 输入的，不得用 `aiAction("输入...")`
- 能用 `aiScroll()` 滚动的，不得用 `aiAction("滚动...")`

---

## 即时操作方法

### `aiTap()`

```typescript
await this.getAgent().aiTap("页面顶部导航栏右侧的「登录」链接");
```

用于点击单个明确目标。描述应包含容器、位置、文案、元素类型。

### `aiInput()`

```typescript
await this.getAgent().aiInput("登录表单中的「用户名」输入框", { value: username });
```

所有 input/textarea 输入统一使用该方法。默认 `replace` 模式即可。

### `aiScroll()`

```typescript
await this.getAgent().aiScroll("话题列表区域", {
  direction: "down",
  distance: 300,
});
```

弹窗内滚动必须明确指定容器。

### `aiKeyboardPress()`

```typescript
await this.getAgent().aiKeyboardPress("搜索框", { keyName: "Enter" });
```

### `aiHover()`

```typescript
await this.getAgent().aiHover("话题标题文字");
```

### `aiDoubleClick()`

```typescript
await this.getAgent().aiDoubleClick("可编辑的标题");
```

---

## 数据提取方法

### `aiQuery<T>()`

```typescript
const result = await this.getAgent().aiQuery<{ hasResults: boolean }>(
  "搜索结果列表是否有数据？返回 { hasResults: boolean }",
  { cacheable: false }
);
```

默认开启缓存；仅在页面状态明显变化时关闭 `cacheable`。

### 便捷提取

```typescript
const hasDialog = await this.getAgent().aiBoolean("是否存在登录弹窗");
const count = await this.getAgent().aiNumber("当前搜索结果条数");
const title = await this.getAgent().aiString("当前页面标题");
```

---

## 等待与断言

### `aiWaitFor()`

```typescript
await this.getAgent().aiWaitFor("话题列表至少加载出一条内容", {
  timeoutMs: 15000,
});
```

### `aiAssert()`

```typescript
await this.getAgent().aiAssert("页面上存在文案为"登录成功"的提示");
```

---

## `aiAction()` 的使用边界

```typescript
await this.getAgent().aiAction("展开折叠的评论并点击第一条回复的点赞按钮");
```

只有在以下情况才允许使用：

- 操作本身天然是多步骤复合动作
- 无法拆成 `aiTap` / `aiInput` / `aiScroll` / `aiKeyboardPress`

单纯点击、输入、滚动，都不应使用 `aiAction()`。

---

## 推荐实践

- 点击用 `aiTap()`
- 输入用 `aiInput()`
- 等待页面状态用 `aiWaitFor()`
- 提取页面内容优先用 `aiQuery()`
- 只有需要 AI 自主规划多步动作时才用 `aiAction()`
