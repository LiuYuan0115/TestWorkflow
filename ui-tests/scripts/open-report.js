#!/usr/bin/env node
/**
 * 打开已保存的历史报告快照。
 *
 * 用法：
 *   node scripts/open-report.js              # 列出所有快照
 *   node scripts/open-report.js <目录名>     # 直接打开,如：
 *   node scripts/open-report.js "2026-04-27_18-30_搜索Agent功能"
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const REPORTS_ROOT = path.join(ROOT, "reports");
const PORT = process.env.ALLURE_PORT || "8899";

// ── 确保 reports/ 存在 ────────────────────────────────────
if (!fs.existsSync(REPORTS_ROOT)) {
  console.error("[open-report] reports/ 目录不存在,请先运行 `node scripts/save-report.js`。");
  process.exit(1);
}

// ── 列出所有快照 ──────────────────────────────────────────
const snapshots = fs
  .readdirSync(REPORTS_ROOT)
  .filter((d) => fs.statSync(path.join(REPORTS_ROOT, d)).isDirectory())
  .sort()
  .reverse(); // 最新的排前面

if (snapshots.length === 0) {
  console.error("[open-report] reports/ 下没有任何快照,请先运行 `node scripts/save-report.js`。");
  process.exit(1);
}

// ── 确定要打开的快照 ──────────────────────────────────────
let target = (process.argv[2] || "").trim();

if (!target) {
  console.log("\n📁  已保存的报告快照（最新在前）：\n");
  snapshots.forEach((s, i) => {
    const readmePath = path.join(REPORTS_ROOT, s, "README.md");
    let note = "";
    if (fs.existsSync(readmePath)) {
      const match = fs.readFileSync(readmePath, "utf-8").match(/\*\*备注：\*\* (.+)/);
      if (match) note = `  — ${match[1].trim()}`;
    }
    console.log(`  [${i + 1}] ${s}${note}`);
  });
  console.log(`\n打开命令示例：\n  node scripts/open-report.js "${snapshots[0]}"\n`);
  process.exit(0);
}

// ── 支持序号输入 ──────────────────────────────────────────
if (/^\d+$/.test(target)) {
  const idx = parseInt(target, 10) - 1;
  if (idx < 0 || idx >= snapshots.length) {
    console.error(`[open-report] 序号 ${target} 超出范围（共 ${snapshots.length} 个快照）。`);
    process.exit(1);
  }
  target = snapshots[idx];
}

const snapshotDir = path.join(REPORTS_ROOT, target);
const reportDir   = path.join(snapshotDir, "allure-report");

if (!fs.existsSync(snapshotDir)) {
  console.error(`[open-report] 快照目录不存在：reports/${target}`);
  process.exit(1);
}

// ── 如果静态报告不存在,重新生成 ─────────────────────────
if (!fs.existsSync(reportDir)) {
  const resultsDir = path.join(snapshotDir, "allure-results");
  console.log("[open-report] 静态报告不存在,重新生成…");
  execSync(
    `npx allure-commandline generate "${resultsDir}" -o "${reportDir}" --clean`,
    { stdio: "inherit" }
  );
}

console.log(`\n🚀  打开报告：reports/${target}/  (端口 ${PORT})\n`);
try {
  execSync(`npx allure-commandline open "${reportDir}" -p ${PORT}`, { stdio: "inherit" });
} catch (_) {
  // Ctrl+C 退出时会抛异常,忽略
}
