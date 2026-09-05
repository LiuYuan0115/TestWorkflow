/**
 * Global Setup：
 *   1. 启动应用（start-app.js）
 *   2. 等待应用就绪（check-app-ready.js）
 *   3. 预热 AI 连接（warmup-ai.js）
 *   4. 清空 allure-results（避免历史结果累积）
 *   5. 清空 test-results/fallback-events.log（定位降级日志，每次运行只反映本次）
 *   6. 可选检查 .auth-state.json 中的 Cookie 是否有效（仅在文件存在时检查）
 *
 * Global Teardown：
 *   1. 停止应用（stop-app.js）
 *
 * 认证方案（可选）：
 *   1. 通过 `npm run auth` 半自动登录，生成 .auth-state.json
 *   2. 需要登录状态的测试使用 usePlaywrightWithAuth() fixture
 *   3. 不需要登录的测试（如访问公开页面）使用 usePlaywright() fixture，无需该文件
 */

import * as fs from "fs";
import * as path from "path";
import * as net from "net";
import { spawnSync } from "child_process";

// 清除代理环境变量，避免本地端口探测走代理导致超时
delete process.env.HTTP_PROXY;
delete process.env.HTTPS_PROXY;
delete process.env.ALL_PROXY;
delete process.env.http_proxy;
delete process.env.https_proxy;
delete process.env.all_proxy;

// 标记应用是否由本次测试启动（外部已运行的应用不在 teardown 中停止）
let appStartedByUs = false;

export const AUTH_STATE_FILE = path.resolve(
  process.cwd(),
  ".auth-state.json"
);

const ALLURE_RESULTS_DIR = path.resolve(process.cwd(), "allure-results");
const FALLBACK_LOG = path.resolve(
  process.cwd(),
  "test-results",
  "fallback-events.log"
);

function cleanAllureResults() {
  if (!fs.existsSync(ALLURE_RESULTS_DIR)) return;
  for (const entry of fs.readdirSync(ALLURE_RESULTS_DIR)) {
    fs.rmSync(path.join(ALLURE_RESULTS_DIR, entry), {
      recursive: true,
      force: true,
    });
  }
  console.log("[globalSetup] 已清空 allure-results/");
}

function cleanFallbackLog() {
  if (fs.existsSync(FALLBACK_LOG)) {
    fs.rmSync(FALLBACK_LOG, { force: true });
    console.log("[globalSetup] 已清空 fallback-events.log");
  }
}

/**
 * 检查端口是否可访问（使用 TCP 连接探测）
 */
function checkPort(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = net.connect({ host: "127.0.0.1", port });
    socket.setTimeout(2000);
    socket.on("connect", () => {
      socket.destroy();
      resolve(true);
    });
    socket.on("error", () => {
      socket.destroy();
      resolve(false);
    });
    socket.on("timeout", () => {
      socket.destroy();
      resolve(false);
    });
  });
}

/**
 * 检查所有必需服务是否已在运行
 * 需要三个服务全部就绪：API(2126) + Control-Plane(2130) + Web(1520)
 */
async function isAppRunning(): Promise<boolean> {
  const [api, controlPlane, web] = await Promise.all([
    checkPort(2126),
    checkPort(2130),
    checkPort(1520),
  ]);

  if (web && !api) console.warn("[globalSetup] ⚠️  前端在运行但 API 网关(2126)未启动");
  if (web && !controlPlane) console.warn("[globalSetup] ⚠️  前端在运行但控制平面(2130)未启动");

  return api && controlPlane && web;
}

/**
 * 启动应用（同步等待所有服务就绪）
 */
function startApp() {
  console.log("\n[globalSetup] 🚀 启动应用...");
  const scriptPath = path.resolve(__dirname, "../../scripts/start-app.js");

  // 同步启动应用，继承 stdio 以便看到错误日志
  const result = spawnSync("node", [scriptPath], {
    stdio: "inherit",
    timeout: 180000, // 最多等待 3 分钟（含编译时间）
  });

  if (result.status !== 0) {
    throw new Error(
      `应用启动失败 (exit code: ${result.status})，请检查日志`
    );
  }

  appStartedByUs = true;
  console.log("[globalSetup] ✅ 应用启动完成");
}


/**
 * 预热 AI 连接
 */
function warmupAI() {
  console.log("[globalSetup] 🔥 预热 AI 连接...");
  const scriptPath = path.resolve(__dirname, "../../scripts/warmup-ai.js");

  const result = spawnSync("node", [scriptPath], {
    stdio: "inherit",
    timeout: 30000, // 最多等待 30 秒
  });

  if (result.status !== 0) {
    console.warn("[globalSetup] ⚠️ AI 预热失败（非致命），继续测试");
  } else {
    console.log("[globalSetup] ✅ AI 连接已预热");
  }
}

export async function setup() {
  // 1. 检查所有必需服务是否已在运行（API + Control-Plane + Web）
  const alreadyRunning = await isAppRunning();
  if (alreadyRunning) {
    console.log(
      "\n[globalSetup] ♻️  检测到所有服务已在运行 (2126 + 2130 + 1520)，复用现有实例"
    );
  } else {
    // 同步启动所有服务并等待就绪
    startApp();
  }

  // 3. 预热 AI 连接
  warmupAI();

  // 4. 清空测试报告目录
  cleanAllureResults();
  cleanFallbackLog();

  // 5. 检查认证状态
  if (fs.existsSync(AUTH_STATE_FILE)) {
    const data = JSON.parse(fs.readFileSync(AUTH_STATE_FILE, "utf-8"));
    const cookies = data.cookies || [];

    if (cookies.length === 0) {
      console.warn(
        `[globalSetup] ${AUTH_STATE_FILE} 中没有 Cookie，请重新运行 npm run auth`
      );
    } else {
      console.log(
        `[globalSetup] 已找到 .auth-state.json，共 ${cookies.length} 条 Cookie`
      );
    }
  } else {
    console.log(
      "[globalSetup] 未找到 .auth-state.json，需要登录态的测试将以未登录状态运行"
    );
    console.log("[globalSetup] 如需登录态，请运行: npm run auth");
  }

  console.log("\n[globalSetup] ✅ 全局设置完成，开始运行测试...\n");
}

export async function teardown() {
  console.log("\n[globalTeardown] 🧹 开始清理...");

  // 仅停止由本次测试启动的应用；复用的外部实例保持运行
  if (!appStartedByUs) {
    console.log(
      "[globalTeardown] ♻️  应用为复用的外部实例，保持运行，跳过停止"
    );
    console.log("[globalTeardown] ✅ 清理完成");
    return;
  }

  const scriptPath = path.resolve(__dirname, "../../scripts/stop-app.js");

  console.log("[globalTeardown] ⏹️  停止应用...");
  const result = spawnSync("node", [scriptPath], {
    stdio: "inherit",
    timeout: 10000, // 最多等待 10 秒
  });

  if (result.status !== 0) {
    console.warn("[globalTeardown] ⚠️ 应用停止失败（可能已手动停止）");
  } else {
    console.log("[globalTeardown] ✅ 应用已停止");
  }

  // 不删除 auth-state，供多次运行复用
  console.log("[globalTeardown] ✅ 清理完成");
}
