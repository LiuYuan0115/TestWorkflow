#!/usr/bin/env node
/**
 * 一键打开 allure 报告：
 *   1. 检查 allure-results 是否存在且非空
 *   2. 生成静态 HTML 到 allure-report
 *   3. 用 Node.js 内置 http 模块启动服务,绑定 0.0.0.0（支持远程访问）
 */

const { execSync } = require("child_process");
const fs = require("fs");
const http = require("http");
const path = require("path");
const os = require("os");

const ROOT = process.cwd();
const RESULTS_DIR = path.join(ROOT, "allure-results");
const REPORT_DIR = path.join(ROOT, "allure-report");
const PORT = parseInt(process.env.ALLURE_PORT || "8899", 10);
const HOST = "0.0.0.0";

if (!fs.existsSync(RESULTS_DIR) || fs.readdirSync(RESULTS_DIR).length === 0) {
  console.error(
    "[allure] allure-results/ 为空或不存在,请先运行 `npm test` 生成测试结果。"
  );
  process.exit(1);
}

console.log("[allure] 生成报告 …");
execSync(`npx allure-commandline generate "${RESULTS_DIR}" -o "${REPORT_DIR}" --clean`, {
  stdio: "inherit",
});

console.log(`[allure] 报告已生成,启动服务（${HOST}:${PORT}）…`);

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js":   "application/javascript",
  ".css":  "text/css",
  ".json": "application/json",
  ".png":  "image/png",
  ".jpg":  "image/jpeg",
  ".svg":  "image/svg+xml",
  ".ico":  "image/x-icon",
  ".woff": "font/woff",
  ".woff2":"font/woff2",
  ".ttf":  "font/ttf",
  ".eot":  "application/vnd.ms-fontobject",
};

const server = http.createServer((req, res) => {
  const urlPath = req.url.split("?")[0];
  let filePath = path.join(REPORT_DIR, urlPath === "/" ? "index.html" : urlPath);

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(REPORT_DIR, "index.html");
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || "application/octet-stream";

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not found");
      return;
    }
    res.writeHead(200, { "Content-Type": contentType });
    res.end(data);
  });
});

server.listen(PORT, HOST, () => {
  const ifaces = os.networkInterfaces();
  const ips = [];
  for (const iface of Object.values(ifaces)) {
    for (const addr of iface) {
      if (addr.family === "IPv4" && !addr.internal) {
        ips.push(addr.address);
      }
    }
  }
  console.log(`\n[allure] 报告服务已启动：`);
  console.log(`  本机访问：http://localhost:${PORT}`);
  ips.forEach((ip) => console.log(`  远程访问：http://${ip}:${PORT}`));
  console.log("\n按 Ctrl+C 停止服务\n");
});

process.on("SIGINT", () => {
  console.log("\n[allure] 服务已停止。");
  process.exit(0);
});
