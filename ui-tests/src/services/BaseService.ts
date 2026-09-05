import type { Page } from "playwright";
import { PlaywrightAgent } from "@midscene/web/playwright";

/**
 * 所有 Service 类的基类。
 *
 * 职责：
 *   - 持有 Page 实例（在构造函数中传入）
 *   - 通过 step() 包装每个业务步骤，便于日志追踪
 *   - 禁止在 Service 层写 expect、禁止直接操作 DOM
 *   - 禁止在 Service 层使用任何定位 API（page.locator 等）
 */
export abstract class BaseService {
  private _agent?: PlaywrightAgent;

  constructor(protected readonly page: Page) {}

  /** 懒加载 PlaywrightAgent */
  protected getAgent(): PlaywrightAgent {
    if (!this._agent) this._agent = new PlaywrightAgent(this.page);
    return this._agent;
  }

  /**
   * 包装单个业务步骤，打印步骤描述到 stdout。
   *
   * 示例：
   * ```ts
   * await this.step('打开登录页', async () => {
   *   await this.loginPage.goto();
   * });
   * ```
   */
  protected async step<T>(description: string, fn: () => Promise<T>): Promise<T> {
    console.log(`[${this.constructor.name}] 步骤：${description}`);
    return await fn();
  }

  /** 等待指定时间（ms） */
  protected async wait(ms: number) {
    await this.page.waitForTimeout(ms);
  }
}
