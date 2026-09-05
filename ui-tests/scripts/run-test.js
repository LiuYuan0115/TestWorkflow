#!/usr/bin/env node
/**
 * npm test 的编排器
 *
 *   1. 执行 `vitest run [...args]`（透传命令行参数）
 *   2. 无论测试成功失败,都运行 `allure generate` 生成 HTML 报告
 *   3. 可选：如果 ALLURE_SERVE=1,测试后自动启动 allure 服务
 *   4. 最终退出码 = vitest 的退出码（保留 CI 信号）
 */

const { spawn, spawnSync } = require("child_process");
const path = require("path");
const fs = require("fs");

// 加载 .env 文件中的代理配置
const envPath = path.resolve(__dirname, "../.env");
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, "utf-8").split("\n").forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const [key, ...rest] = trimmed.split("=");
    if (key && rest.length) {
      const value = rest.join("=").trim();
      // 设置代理相关环境变量
      if (['HTTP_PROXY', 'HTTPS_PROXY', 'ALL_PROXY', 'http_proxy', 'https_proxy', 'all_proxy'].includes(key.trim())) {
        process.env[key.trim()] = value;
      }
    }
  });
}

const ROOT = process.cwd();
const args = process.argv.slice(2);

// 0. 预热 AI 连接（解决首次通过代理调用 Gemini 时 TLS 不稳定的问题）
const { warmupAIConnection } = require('./warmup-ai');
console.log('[test-runner] 预热 AI 连接...');
warmupAIConnection().catch(err => {
  console.warn('[test-runner] 预热失败（非致命）:', err.message);
}).finally(() => {
  runTests();
});

function runTests() {
  // 1. 跑 vitest
  const vitest = spawnSync("npx", ["vitest", "run", ...args], {
    stdio: "inherit",
    cwd: ROOT,
    shell: process.platform === "win32",
  });

  // 2. 始终生成 allure 报告
  console.log("\n[test-runner] 生成 allure 报告 …");
  const gen = spawnSync(
    "npx",
    [
      "allure-commandline",
      "generate",
      "allure-results",
      "-o",
      "allure-report",
      "--clean",
    ],
    { stdio: "inherit", cwd: ROOT, shell: process.platform === "win32" }
  );

  if (gen.status !== 0) {
    console.warn(
      "[test-runner] allure 报告生成失败（非致命），请检查 allure-results 目录"
    );
  }

  // 3. 如果设置了 ALLURE_SERVE=1,启动服务
  if (process.env.ALLURE_SERVE === "1") {
    console.log("[test-runner] 启动 allure 服务 …");
    const server = spawn("node", [path.join("scripts", "allure-report.js")], {
      stdio: "inherit",
      cwd: ROOT,
    });
    server.on("exit", (code) => process.exit(code ?? vitest.status ?? 0));
    return;
  }

  // 4. 退出码 = vitest 的退出码
  process.exit(vitest.status ?? 0);
}
