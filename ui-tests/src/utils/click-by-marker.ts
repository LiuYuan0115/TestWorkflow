import type { Page } from "playwright";

/** Playwright Frame 类型（项目统一使用该推断方式） */
type Frame = ReturnType<Page["frames"]>[number];

/**
 * clickByMarker 使用的 data-attribute 名。
 * 调用方在 evaluate 内通过 setAttribute(CLICK_MARKER_ATTR, "1") 为目标元素打标。
 */
export const CLICK_MARKER_ATTR = "data-e2e-click-target";

/**
 * 核心点击策略：DOM 查找 + Playwright locator.click() 真实鼠标事件。
 *
 * 为什么需要这个：
 *   原生 `HTMLElement.click()` 派发的 click 事件 isTrusted=false，
 *   很多前端组件库依赖完整的 pointerdown/mousedown/pointerup/mouseup/click 事件序列，
 *   或检查 isTrusted 标记，导致原生 click 对它们无效。
 *   Playwright 的 locator.click() 派发可信任的真实鼠标事件，能可靠触发。
 *
 * 使用方式：
 *   调用方在 markerSetter 内执行 page.evaluate / frame.evaluate，
 *   找到目标元素后调用 el.setAttribute(CLICK_MARKER_ATTR, "1") 打标，
 *   返回 true 表示成功；本方法随后用 Playwright locator 点击该标记元素，
 *   并自动清理标记。
 *
 * @param ctx           Page 或 Frame 实例
 * @param markerSetter  在 evaluate 内找到目标并打上 CLICK_MARKER_ATTR，返回是否成功
 * @returns             点击是否成功（markerSetter 返回 false 时返回 false）
 */
export async function clickByMarker(
  ctx: Page | Frame,
  markerSetter: () => Promise<boolean>
): Promise<boolean> {
  // 先清理可能遗留的标记（防止前次异常残留）
  await ctx
    .evaluate((attr: string) => {
      document
        .querySelectorAll(`[${attr}]`)
        .forEach((el) => el.removeAttribute(attr));
    }, CLICK_MARKER_ATTR)
    .catch(() => {
      /* ignore */
    });

  const marked = await markerSetter();
  if (!marked) return false;

  try {
    await ctx.locator(`[${CLICK_MARKER_ATTR}]`).first().click();
    return true;
  } finally {
    await ctx
      .evaluate((attr: string) => {
        document
          .querySelectorAll(`[${attr}]`)
          .forEach((el) => el.removeAttribute(attr));
      }, CLICK_MARKER_ATTR)
      .catch(() => {
        /* 页面跳转导致清理失败时忽略 */
      });
  }
}
