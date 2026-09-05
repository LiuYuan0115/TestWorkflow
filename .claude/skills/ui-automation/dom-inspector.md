# DOM 检查探针指南

探针的核心原则：**让浏览器告诉你真相，不要凭经验猜 selector**。

---

## 一、何时使用探针

| 场景 | 是否需要探针 |
|------|------------|
| 新页面/弹窗，不知道 class | ✅ 必须 |
| 已知 class 但定位不稳定（多个同名元素）| ✅ 必须 |
| CSS 失败退到 AI 兜底超过 1 次 | ✅ 必须 |
| 元素隐藏方式未知（transform/display/visibility）| ✅ 必须 |
| 直接复用现有 Page 方法，无需新建 | ❌ 跳过 |

---

## 二、探针脚本编写规则

### 规则 1：时机选择

在**目标 UI 状态出现后**立刻抓取，而不是页面初始状态。

```
❌ 错误：页面 goto 后直接抓取
✅ 正确：打开弹窗/切换 Tab/点击按钮后，等待动画完成（waitForTimeout 1500-2500ms），再抓取
```

### 规则 2：抓取优先级

| 优先级 | 抓取目标 | 用途 |
|--------|---------|------|
| 1 | **容器 class**（弹窗/区域根元素） | 后续所有查询限定在此范围内 |
| 2 | **input/textarea** 的 `className` + `placeholder` + label 文本 | 确定填写字段用哪个 selector |
| 3 | **button** 的 `textContent` + `className` | 确定操作按钮 |
| 4 | **目标元素父链**（向上爬 5-6 层） | 当 selector 不唯一时用 |

### 规则 3：可见性检测策略

```js
// ✅ 推荐：rect.x >= 0 区分屏幕内和被偏移到屏幕外的元素
rect.x >= 0

// ✅ getComputedStyle — 检查真实渲染样式
getComputedStyle(el).visibility !== 'hidden'
getComputedStyle(el).display !== 'none'
```

---

## 三、探针脚本结构模板

探针文件命名规则：**不带下划线前缀**（`_` 前缀会被 vitest 忽略），用完立即删除。

```typescript
import "../../setup/env";
import { describe, test } from "vitest";
import { usePlaywright } from "../../fixtures/playwright.fixture";

describe("DOM probe - [目标UI描述]", () => {
  const ctx = usePlaywright();

  test("[探针描述]", async () => {
    // ── 1. 导航到目标状态 ──
    await ctx.page.goto("https://127.0.0.1:1520/...");
    await ctx.page.waitForTimeout(2000);

    // ── 2. 抓取 DOM 状态 ──
    const info = await ctx.page.evaluate(() => {
      const result: any = {
        inputs: [],
        buttons: [],
        links: [],
      };

      // input
      (Array.from(document.querySelectorAll("input, textarea")) as HTMLInputElement[]).forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.x < 0 || rect.width === 0) return;
        result.inputs.push({
          placeholder: el.placeholder,
          className: el.className,
          type: el.type,
          name: el.name,
        });
      });

      // button / link
      (Array.from(document.querySelectorAll("button, a")) as HTMLElement[]).forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.x < 0 || rect.width === 0) return;
        result.buttons.push({
          text: (el.textContent || "").trim().slice(0, 50),
          className: el.className,
          tag: el.tagName,
          href: (el as HTMLAnchorElement).href || null,
        });
      });

      return result;
    });

    // ── 3. 打印采集结果 ──
    console.log("=== PROBE RESULT ===");
    console.log(JSON.stringify(info, null, 2));
    console.log("=== END PROBE ===");
  }, 60_000);
});
```

---

## 四、探针文件管理

| 规则 | 说明 |
|------|------|
| 命名 | 不带 `_` 前缀（`_` 前缀会被 vitest 忽略） |
| 存放位置 | 同测试文件目录下，如 `xxx-probe.test.ts` |
| 超时 | 设为 `60_000` 或更长 |
| 清理 | **用完立即删除**，不留在项目中 |
