# 四层架构参考

## 层级关系（严格单向依赖）

```text
tests/（用例层）    只调用 -> services/（服务层）
services/（服务层）  只调用 -> pages/（页面层）
pages/（页面层）    只调用 -> components/（组件层）
```

禁止：反向依赖、跨层调用，例如测试层直接调页面层。

## 组件层（`src/components/`）

| 类名 | 方法 | 适用场景 |
|------|------|---------|
| `InputComponent` | `fill(label, value)`、`clear(label)`、`getValue(label)` | 文本输入框 |
| `ButtonComponent` | `click(label)`、`isVisible(label)` | 按钮 |
| `AlertComponent` | `getMessage()`、`hasError()`、`hasSuccess()` | Toast、错误、成功提示 |
| `NavComponent` | `clickMenu(name)`、`getActiveMenu()`、`getMenuItems()` | 导航菜单 |

规则：

- 继承 `BaseComponent`
- 文件命名：`XxxComponent.ts`
- 禁止依赖 pages/ 或 services/
- 禁止写 `expect`
- 必须在 `src/components/index.ts` 导出

## 页面层（`src/pages/`）

规则：

- 继承 `BasePage`
- 必须定义 `readonly url: string`
- 页面特有 DOM 操作必须使用 `withFallback` 模式
- 文件命名：`XxxPage.ts`，弹窗用 `XxxDialog.ts`，面板用 `XxxPanel.ts`
- 禁止跨页面操作
- 禁止写 `expect`
- 必须在 `src/pages/index.ts` 导出

### `withFallback` 模式（AI-Only 首次实现）

```typescript
async clickXxx() {
  await this.withFallback({
    label: "clickXxx()",
    cssAction: async () => false,
    aiFallback: async () => {
      await this.getAgent().aiTap("[精确描述目标元素的视觉位置和文案]");
    },
    aiOnly: true,
  });
  await this.wait(500);
}
```

## 服务层（`src/services/`）

规则：

- 继承 `BaseService`
- 构造函数中创建并持有 Page 实例
- 提供语义清晰的业务方法，例如 `login()`、`browseTopics()`
- 返回类型化结果接口
- 文件命名：`XxxService.ts`
- 禁止直接操作 DOM，必须通过页面层
- 禁止写 `expect`
- 必须在 `src/services/index.ts` 导出

### Service 层禁止的代码

- `this.page.evaluate(...)`、`this.page.locator(...)`
- `this.page.click(...)`、`this.page.fill(...)`
- `this.page.waitForSelector(...)`、`this.page.waitForFunction(...)`
- `.aiTap(...)`、`.aiAction(...)`

> **例外：** `this.page.waitForTimeout()` 允许在服务层使用（纯等待）。

## 测试层（`src/tests/`）

规则：

- 使用 `usePlaywright()` 或 `usePlaywrightWithAuth()` fixture
- 只能调用服务层，禁止直接 `new XxxPage()`
- `expect` 只能写在测试层
- 每个 `test()` 建议有注释说明步骤和预期
- 文件命名：`xxx.test.ts`

### Fixture 选择

| 场景 | Fixture | 原因 |
|------|---------|------|
| 测试登录功能本身 | `usePlaywright()` | 需要全新浏览器，无需 cookie |
| 测试登录后的功能 | `usePlaywrightWithAuth()` | 注入 Cookie，跳过登录 |
| 测试公开页面 | `usePlaywright()` | 不需要 cookie |

## 命名规范

- 组件：`XxxComponent`
- 页面：`XxxPage`、`XxxDialog.ts`、`XxxPanel.ts`
- 服务：`XxxService`
- 测试：`xxx.test.ts`
- 接口：`XxxResult`、`XxxInfo`
