/**
 * withFallback：统一的「CSS 优先 → AI 兜底」定位模式。
 *
 * 每个 Page/Component 方法通过 `this.withFallback(...)` 调用本模块，
 * 所有 CSS 成功 / CSS 失败 / AI 兜底 / AI 也失败的事件都会被记录到：
 *   1. stdout —— 带图标的人读日志
 *   2. test-results/fallback-events.log —— JSONL 结构化日志，供后续分析
 *
 * 设计目标：
 *   - 统一所有 Page/Component 中「CSS 尝试 → AI 兜底」的样板代码
 *   - 保证「每一次定位」都落日志，没有漏网之鱼
 *   - 日志格式稳定（JSONL），便于 Agent / 统计脚本消费
 */

import * as fs from "fs";
import * as path from "path";

const LOG_DIR = path.resolve(process.cwd(), "test-results");
const LOG_FILE = path.join(LOG_DIR, "fallback-events.log");

/** 事件类型 */
export type FallbackEventType =
  /** CSS 直接成功 */
  | "css_success"
  /** CSS 失败，降级到 AI 并且 AI 成功 */
  | "ai_fallback_success"
  /** CSS 失败，AI 兜底也失败 —— 方法即将抛异常 */
  | "ai_fallback_failed"
  /** AI-only 模式直接成功（跳过 CSS） */
  | "ai_only_success"
  /** AI-only 模式失败 */
  | "ai_only_failed";

export interface FallbackEvent {
  timestamp: string;
  type: FallbackEventType;
  className: string;
  label: string;
  /** CSS 失败原因（type=css_success 时为空） */
  cssError?: string;
  /** AI 兜底失败原因（type=ai_fallback_failed 时为空时表示 CSS 也没报错信息） */
  aiError?: string;
  pageUrl?: string;
}

/** 单次运行内复用，避免重复 mkdir */
let logStreamReady = false;

function writeEvent(event: FallbackEvent) {
  try {
    if (!logStreamReady) {
      if (!fs.existsSync(LOG_DIR)) {
        fs.mkdirSync(LOG_DIR, { recursive: true });
      }
      logStreamReady = true;
    }
    fs.appendFileSync(LOG_FILE, JSON.stringify(event) + "\n");
  } catch {
    // 日志写入失败不影响测试流程
  }
}

export interface RunWithFallbackOptions {
  /** 调用方类名，用于日志前缀 */
  className: string;
  /** 操作标识（简短描述），会出现在 stdout 和 log 中 */
  label: string;
  /** CSS / DOM 策略 —— 返回 true 表示成功，false 表示未命中（会触发降级） */
  cssAction: () => Promise<boolean>;
  /** AI 兜底策略 —— CSS 失败后调用 */
  aiFallback: () => Promise<void>;
  /** 可选：获取当前页面 URL（用于 log） */
  getPageUrl?: () => string;
  /** 可选：设为 true 跳过 CSS 直接走 AI，避免 CSS 尝试的等待时间 */
  aiOnly?: boolean;
}

/**
 * 执行「CSS 优先 → AI 兜底」流程，并记录所有事件到 stdout + JSONL 日志。
 *
 * 行为：
 *   - cssAction 抛异常或返回 false → 记录 cssError → 执行 aiFallback
 *   - aiFallback 抛异常 → 记录 ai_fallback_failed → 将原始异常继续抛出
 *   - 全流程成功 → 记录 css_success 或 ai_fallback_success
 */
export async function runWithFallback(
  options: RunWithFallbackOptions
): Promise<void> {
  const { className, label, cssAction, aiFallback, getPageUrl, aiOnly } = options;
  const pageUrl = safeCall(getPageUrl);

  // —— AI-only 模式：跳过 CSS，直接走 AI ——
  if (aiOnly) {
    console.log(`[${className}] 🤖 AI-only 模式: ${label}`);
    try {
      await aiFallback();
      console.log(`[${className}] 🤖 AI-only 成功: ${label}`);
      writeEvent({
        timestamp: new Date().toISOString(),
        type: "ai_only_success",
        className,
        label,
        pageUrl,
      });
    } catch (err) {
      const aiError = err instanceof Error ? err.message : String(err);
      console.error(`[${className}] 💥 AI-only 失败: ${label}: ${aiError}`);
      writeEvent({
        timestamp: new Date().toISOString(),
        type: "ai_only_failed",
        className,
        label,
        aiError,
        pageUrl,
      });
      throw err;
    }
    return;
  }

  let cssError: string | undefined;
  let cssSuccess = false;

  // —— 阶段 1：尝试 CSS ——
  try {
    cssSuccess = await cssAction();
    if (!cssSuccess) cssError = "CSS action returned false";
  } catch (err) {
    cssError = err instanceof Error ? err.message : String(err);
  }

  if (cssSuccess) {
    console.log(`[${className}] ✅ CSS 定位成功: ${label}`);
    writeEvent({
      timestamp: new Date().toISOString(),
      type: "css_success",
      className,
      label,
      pageUrl,
    });
    return;
  }

  // —— 阶段 2：降级 AI ——
  console.warn(
    `[${className}] ⚠️  CSS 定位失败 (${label}): ${cssError}，降级 AI`
  );

  try {
    await aiFallback();
    console.log(`[${className}] 🤖 AI 兜底成功: ${label}`);
    writeEvent({
      timestamp: new Date().toISOString(),
      type: "ai_fallback_success",
      className,
      label,
      cssError,
      pageUrl,
    });
  } catch (err) {
    const aiError = err instanceof Error ? err.message : String(err);
    console.error(`[${className}] 💥 AI 兜底也失败 (${label}): ${aiError}`);
    writeEvent({
      timestamp: new Date().toISOString(),
      type: "ai_fallback_failed",
      className,
      label,
      cssError,
      aiError,
      pageUrl,
    });
    throw err;
  }
}

function safeCall<T>(fn?: () => T): T | undefined {
  if (!fn) return undefined;
  try {
    return fn();
  } catch {
    return undefined;
  }
}
