# UI 自动化测试项目规范

> 生成 UI 自动化测试代码时必须严格遵守以下规范。

---

## 一、环境约束

- 前端地址：`http://127.0.0.1:1520`
- 后端地址：`http://127.0.0.1:2130`
- 测试项目路径：`ui-tests/`
- 被测项目代码：`/path/to/your/project`  # 请修改为实际项目路径

---

## 二、AI-Only 优先原则

首次实现所有 Page 方法时，全部使用 AI-Only 定位，不写真实 CSS 逻辑。

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

CSS 实现的条件：只有当 AI-Only 定位多次失败，且通过探针确认 CSS 可稳定定位时，才切换为 CSS 优先模式。

---

## 三、四层分层架构（严格遵守）

```
ui-tests/src/
├── components/    组件层：可复用 UI 控件原子操作
├── pages/         页面层：单页面操作封装
├── services/      服务层：跨页面完整业务流程
└── tests/         用例层：测试用例 + 断言
```

### 层间调用规则（严格单向）

```
用例层 (tests/) → 服务层 (services/) → 页面层 (pages/) → 组件层 (components/)
```

- 禁止反向依赖
- 禁止跨层调用（如用例层直接调页面层）
- 禁止在 Service/Test 层写任何定位代码

---

## 四、等待与同步

- 禁止硬编码 `sleep`，使用 Playwright 内置等待机制
- AI 操作自带等待，无需额外处理
- `this.page.waitForTimeout()` 仅在 Service 层少量使用

---

## 五、数据管理

- 测试数据不依赖生产环境
- 登录态通过 `.auth-state.json` 持久化复用
- 动态实体名包含时间戳后缀：`test_${Date.now().toString().slice(-6)}`

---

## 六、导出规范

- 每层目录下必须有 `index.ts` 统一导出
- 新增文件后必须更新对应的 `index.ts`

---

## 七、命名规范

| 类型 | 命名 |
|------|------|
| 组件类 | `XxxComponent` |
| 页面类 | `XxxPage`（弹窗：`XxxDialog`，面板：`XxxPanel`） |
| 服务类 | `XxxService` |
| 测试文件 | `xxx.test.ts` |
| 接口类型 | `XxxResult`、`XxxInfo` |

---

## 八、产物管理

- `allure-results/`、`allure-report/`、`test-results/` 不进 Git
- `.claude/skills/ui-automation/artifacts/` 运行时产物不进 Git
- `.auth-state.json` 包含 Cookie，不进 Git
