import { beforeEach, afterEach } from "vitest";
import type { TestContext } from "vitest";
import type { BrowserContext, Page } from "playwright";
import { createBrowser, BASE_URL } from "../config";
import { screenshotOnFailure } from "./screenshot-on-failure";
import * as fs from "fs";
import * as path from "path";

export interface PlaywrightContext {
  /**
   * Persistent context（内含隐式 browser；通过 `context.browser()` 获取）。
   * 关闭浏览器只需 `context.close()`。
   */
  context: BrowserContext;
  page: Page;
}

const AUTH_STATE_FILE = path.resolve(process.cwd(), ".auth-state.json");

/**
 * 登录态前置检查：认证失效时应用会弹出登录弹窗并遮挡全屏，
 * 导致后续 AI 操作"假成功"（点在弹窗上），白跑数分钟后才在断言处误失败。
 * 这里在进入页面后快速检测登录弹窗，存在则立即失败并提示重新认证。
 */
async function assertLoggedIn(pg: Page): Promise<void> {
  // 给弹窗渲染留出时间
  await pg.waitForTimeout(2000);
  const loginDialog = pg.locator("text=登录后继续").first();
  const visible =
    (await loginDialog.count()) > 0 &&
    (await loginDialog.isVisible().catch(() => false));
  if (visible) {
    throw new Error(
      "[fixture] 检测到登录弹窗，认证已失效。请重新运行 `npm run auth` 刷新 .auth-state.json 后再执行测试。"
    );
  }
}

async function setupBrowserAndPage(
  ctx: Partial<PlaywrightContext>,
  options?: { headless?: boolean }
): Promise<void> {
  const isHeadless = options?.headless ?? process.env.HEADLESS === "true";
  const created = await createBrowser({ headless: isHeadless });
  // launchPersistentContext 会自动创建第一个 page，复用它避免多一个空 tab
  const pages = created.context.pages();
  const pg = pages.length > 0 ? pages[0] : await created.context.newPage();
  pg.setDefaultTimeout(30_000);
  ctx.context = created.context;
  ctx.page = pg;
}

async function teardownBrowser(
  ctx: Partial<PlaywrightContext>,
  task: TestContext["task"]
): Promise<void> {
  await screenshotOnFailure(ctx.page, task);
  try {
    await ctx.context?.close();
  } catch (err) {
    console.warn(
      "[fixture] context.close() 失败:",
      err instanceof Error ? err.message : err
    );
  }
}

/**
 * 基础 fixture：每个测试独立的 Playwright 浏览器 + 新 context + 新 page。
 * 适合无需登录状态的测试（如访问公开页面、测试登录功能本身）。
 */
export function usePlaywright(options?: { headless?: boolean }): PlaywrightContext {
  const ctx: Partial<PlaywrightContext> = {};

  beforeEach(async () => {
    await setupBrowserAndPage(ctx, options);
  });

  afterEach(async (taskCtx) => {
    await teardownBrowser(ctx, taskCtx.task);
  });

  return ctx as PlaywrightContext;
}

/**
 * 带登录缓存的 fixture：注入 Cookie 后直接跳转目标页面，跳过完整登录流程。
 *
 * 前提：需要先运行 `npm run auth` 生成 .auth-state.json 文件。
 * 如果未找到该文件，则以不带 Cookie 的状态继续执行（适合公开页面测试）。
 */
export function usePlaywrightWithAuth(
  targetUrl = BASE_URL
): PlaywrightContext {
  const ctx: Partial<PlaywrightContext> = {};

  beforeEach(async () => {
    await setupBrowserAndPage(ctx);

    const pg = ctx.page!;
    const context = ctx.context!;

    if (fs.existsSync(AUTH_STATE_FILE)) {
      const storageState = JSON.parse(fs.readFileSync(AUTH_STATE_FILE, "utf-8"));

      // 注入 cookies（如果存在）
      if (storageState.cookies && storageState.cookies.length > 0) {
        await context.addCookies(storageState.cookies);
        console.log(`[fixture] 已注入 ${storageState.cookies.length} 条 Cookie`);
      }

      // 注入 localStorage（如果存在）
      if (storageState.origins && storageState.origins.length > 0) {
        await pg.goto(targetUrl);
        for (const origin of storageState.origins) {
          if (origin.localStorage) {
            for (const item of origin.localStorage) {
              await pg.evaluate(
                ({ key, value }) => localStorage.setItem(key, value),
                { key: item.name, value: item.value }
              );
            }
          }
        }
        console.log(`[fixture] 已注入 localStorage，共 ${storageState.origins.length} 个源`);
        await pg.reload();
      } else {
        await pg.goto(targetUrl);
      }
    } else {
      console.warn("[fixture] 未找到 .auth-state.json，将以未登录状态访问页面");
      await pg.goto(targetUrl);
    }

    await pg.waitForLoadState("domcontentloaded");
    await assertLoggedIn(pg);
  }, 60_000);

  afterEach(async (taskCtx) => {
    await teardownBrowser(ctx, taskCtx.task);
  });

  return ctx as PlaywrightContext;
}
