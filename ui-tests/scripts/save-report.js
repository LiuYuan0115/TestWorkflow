#!/usr/bin/env node
/**
 * 保存当前测试报告快照到 reports/ 归档目录。
 *
 * 用法：
 *   node scripts/save-report.js              # 自动生成时间戳目录名
 *   node scripts/save-report.js "搜索Agent功能"  # 自定义备注名
 *
 * 结果：
 *   reports/2026-04-27_18-30_搜索Agent功能/
 *     ├── allure-results/   (原始测试数据,allure 可重新生成报告)
 *     ├── allure-report/    (预生成的静态 HTML 报告)
 *     └── README.md         (说明：何时保存、用什么命令打开)
 *
 * 打开已保存的报告：
 *   node scripts/open-report.js              # 列出所有快照并选择
 *   node scripts/open-report.js <目录名>     # 直接打开指定快照
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const RESULTS_DIR = path.join(ROOT, "allure-results");
const REPORTS_ROOT = path.join(ROOT, "reports");

// ── 参数处理 ──────────────────────────────────────────────
const label = (process.argv[2] || "").trim().replace(/[/\\:*?"<>|]/g, "-");

// 生成时间戳（本地时间）
const now = new Date();
const pad = (n) => String(n).padStart(2, "0");
const ts = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}`;
const dirName = label ? `${ts}_${label}` : ts;
const snapshotDir = path.join(REPORTS_ROOT, dirName);

// ── 校验 ──────────────────────────────────────────────────
if (!fs.existsSync(RESULTS_DIR) || fs.readdirSync(RESULTS_DIR).length === 0) {
  console.error("[save-report] allure-results/ 为空或不存在,请先运行 `npm test`。");
  process.exit(1);
}

// ── 创建目录结构 ──────────────────────────────────────────
const snapshotResults = path.join(snapshotDir, "allure-results");
const snapshotReport  = path.join(snapshotDir, "allure-report");
fs.mkdirSync(snapshotResults, { recursive: true });

// ── 复制 allure-results ───────────────────────────────────
console.log(`[save-report] 复制 allure-results → ${snapshotResults} …`);
execSync(`cp -r "${RESULTS_DIR}/." "${snapshotResults}/"`, { stdio: "inherit" });

// ── 生成静态报告 ──────────────────────────────────────────
console.log("[save-report] 生成 allure-report …");
execSync(
  `npx allure-commandline generate "${snapshotResults}" -o "${snapshotReport}" --clean`,
  { stdio: "inherit" }
);

// ── 写入 README ───────────────────────────────────────────
const readme = `# 测试报告快照

- **保存时间：** ${now.toLocaleString("zh-CN")}
- **备注：** ${label || "（无）"}
- **目录：** ${dirName}

## 打开报告

\`\`\`bash
# 方式一：使用快捷脚本（在项目根目录执行）
node scripts/open-report.js "${dirName}"

# 方式二：手动用 allure 打开
npx allure-commandline open "${snapshotReport}" -p 8899
\`\`\`
`;
fs.writeFileSync(path.join(snapshotDir, "README.md"), readme, "utf-8");

console.log(`\n✅  报告已保存至：reports/${dirName}/`);
console.log(`   打开命令：node scripts/open-report.js "${dirName}"`);
