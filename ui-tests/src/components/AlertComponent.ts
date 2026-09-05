import { BaseComponent } from "./BaseComponent";

/**
 * 通用提示/消息组件。
 *
 * 由于 Toast/Alert 文本通常无稳定 class，优先尝试 DOM 策略：
 *   1. 查找常见的 alert/toast 元素（含 class 含 alert、toast、message、error）
 *   2. 失败则用 aiQuery 视觉提取兜底
 */
export class AlertComponent extends BaseComponent {
  async getMessage(): Promise<string | null> {
    let result: string | null = null;
    await this.withFallback({
      label: `getMessage()`,
      cssAction: async () => {
        const fromDom = await this.page.evaluate(() => {
          const selectors = [
            "[class*=toast]",
            "[class*=alert]:not([class*=alert-triangle])",
            "[class*=message][class*=content]",
            "[class*=notification]",
            "[role=alert]",
          ];
          for (const sel of selectors) {
            const el = document.querySelector(sel) as HTMLElement | null;
            if (el && (el as HTMLElement).offsetParent !== null) {
              const txt = (el.textContent || "").trim();
              if (txt) return txt;
            }
          }
          return "";
        });

        if (fromDom) {
          result = fromDom;
          return true;
        }
        return false;
      },
      aiFallback: async () => {
        const q = await this.getAgent().aiQuery<{ message: string }>(
          "提取页面上当前显示的提示信息、错误信息、成功信息或警告文字。如果没有任何提示则返回空字符串，返回形如 { message: string }"
        );
        result = q.message.trim() || null;
      },
    });
    return result;
  }

  async hasError(): Promise<boolean> {
    const msg = await this.getMessage();
    if (!msg) return false;
    return /错误|失败|不正确|invalid|error|fail/i.test(msg);
  }

  async hasSuccess(): Promise<boolean> {
    const msg = await this.getMessage();
    if (!msg) return false;
    return /成功|success/i.test(msg);
  }
}
