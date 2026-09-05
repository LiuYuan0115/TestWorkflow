import type { Page } from "playwright";
import { PlaywrightAgent } from "@midscene/web/playwright";
import {
  clickByMarker as clickByMarkerUtil,
  CLICK_MARKER_ATTR as CLICK_MARKER_ATTR_VALUE,
} from "../utils/click-by-marker";
import { runWithFallback } from "../utils/with-fallback";

type Frame = ReturnType<Page["frames"]>[number];

/** 重新导出：保留组件 import 习惯 */
export const CLICK_MARKER_ATTR = CLICK_MARKER_ATTR_VALUE;

/**
 * 所有组件的基类。
 *
 * 使用模式：
 *   - 每个方法内部通过 this.withFallback({...}) 执行 CSS 优先 / AI 兜底
 *   - withFallback 会统一记录 stdout + test-results/fallback-events.log（JSONL）
 *
 * 保留能力：
 *   - clickByMarker：用真实鼠标事件点击组件库按钮（isTrusted=true）
 *   - getAgent：懒加载 PlaywrightAgent，避免无 AI 场景的 agent 初始化开销
 */
export abstract class BaseComponent {
  private _agent?: PlaywrightAgent;

  constructor(protected readonly page: Page) {}

  /** 懒加载 PlaywrightAgent；整个 component 生命周期复用一个实例 */
  protected getAgent(): PlaywrightAgent {
    if (!this._agent) this._agent = new PlaywrightAgent(this.page);
    return this._agent;
  }

  /** 等待指定时间（ms） */
  protected async wait(ms: number) {
    await this.page.waitForTimeout(ms);
  }

  /**
   * 核心定位模式：CSS 优先 → AI 兜底，所有事件记录到 stdout + JSONL 日志。
   *
   * 使用示例：
   * ```ts
   * await this.withFallback({
   *   label: 'click("提交")',
   *   cssAction: async () => { return await this.clickByMarker(...) },
   *   aiFallback: async () => { await this.getAgent().aiTap('"提交" 按钮') },
   * });
   * ```
   */
  protected async withFallback(options: {
    label: string;
    cssAction: () => Promise<boolean>;
    aiFallback: () => Promise<void>;
    /** 设为 true 跳过 CSS 直接走 AI */
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

  /**
   * 核心点击模式：DOM 查找 + Playwright locator.click() 真实鼠标事件。
   */
  protected async clickByMarker(
    markerSetter: () => Promise<boolean>,
    frame?: Frame
  ): Promise<boolean> {
    return await clickByMarkerUtil(frame ?? this.page, markerSetter);
  }
}
