import type { Page } from "playwright";
import { PlaywrightAgent } from "@midscene/web/playwright";
import { runWithFallback } from "../utils/with-fallback";

/**
 * 所有 Page 类的基类。
 *
 * 职责：
 *   - 持有 Playwright Page 实例
 *   - 提供统一的 withFallback（CSS 优先 → AI 兜底）能力
 *   - 提供 getAgent() 懒加载 PlaywrightAgent
 *   - 禁止在 Page 层写 expect
 */
export abstract class BasePage {
  /** 页面 URL，子类必须定义 */
  abstract readonly url: string;

  private _agent?: PlaywrightAgent;

  constructor(protected readonly page: Page) {}

  /** 懒加载 PlaywrightAgent；整个 page 生命周期复用一个实例 */
  protected getAgent(): PlaywrightAgent {
    if (!this._agent) this._agent = new PlaywrightAgent(this.page);
    return this._agent;
  }

  /** 等待指定时间（ms） */
  protected async wait(ms: number) {
    await this.page.waitForTimeout(ms);
  }

  /** 导航到本页面 */
  async goto() {
    await this.page.goto(this.url);
    await this.page.waitForLoadState("domcontentloaded");
  }

  /**
   * 核心定位模式：CSS 优先 → AI 兜底。
   *
   * 示例：
   * ```ts
   * await this.withFallback({
   *   label: 'clickSubmit()',
   *   cssAction: async () => { ... return true/false },
   *   aiFallback: async () => { await this.getAgent().aiTap('提交按钮') },
   * });
   * ```
   */
  protected async withFallback(options: {
    label: string;
    cssAction: () => Promise<boolean>;
    aiFallback: () => Promise<void>;
    /** 设为 true 跳过 CSS 直接走 AI（AI-Only 模式） */
    aiOnly?: boolean;
  }): Promise<void> {
    await runWithFallback({
      className: this.constructor.name,
      label: options.label,
      cssAction: options.cssAction,
      aiFallback: options.aiFallback,
      aiOnly: options.aiOnly,
      getPageUrl: () => {
        try {
          return this.page.url();
        } catch {
          return "";
        }
      },
    });
  }
}
