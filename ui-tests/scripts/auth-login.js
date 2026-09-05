/**
 * 半自动登录脚本：获取并保存应用 Cookie
 *
 * 使用方式：npm run auth
 */

const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const envPath = path.resolve(__dirname, "../.env");
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, "utf-8").split("\n").forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const [key, ...rest] = trimmed.split("=");
    if (key && rest.length) process.env[key.trim()] = rest.join("=").trim();
  });
}

const AUTH_STATE_FILE = path.resolve(__dirname, "../.auth-state.json");
const BASE_URL = process.env.BASE_URL || "http://127.0.0.1:1520";
const USERNAME = process.env.TEST_USERNAME || "";
const PASSWORD = process.env.TEST_PASSWORD || "";

async function main() {
  console.log("🚀 启动浏览器,打开应用...");
  const browser = await chromium.launch({ headless: false, args: ["--no-sandbox"] });
  const context = await browser.newContext({ ignoreHTTPSErrors: true });
  const page = await context.newPage();

  // 直接访问 /chat，如果未登录会弹出登录弹窗
  await page.goto(`${BASE_URL}/chat`);
  await page.waitForLoadState("domcontentloaded");
  await page.waitForTimeout(2000);

  console.log("📌 应用使用弹窗登录，URL 会保持在 /chat");
  console.log("👉 请在浏览器的登录弹窗中完成登录...\n");

  if (USERNAME && PASSWORD) {
    console.log(`💡 提示: 环境变量中的用户名是 ${USERNAME}`);
    console.log("   如需自动填写，请等待后续版本支持弹窗定位\n");
  }

  const deadline = Date.now() + 120_000;
  let loggedIn = false;

  while (Date.now() < deadline) {
    await page.waitForTimeout(3000);

    try {
      // 关键检测：左下角是否显示用户名（test01 等）
      const userNameElement = await page.locator('text=/test\\d+|[a-zA-Z0-9_]+@/i').first();
      const hasUserName = await userNameElement.count() > 0;
      let userName = '';

      if (hasUserName) {
        try {
          userName = await userNameElement.textContent();
        } catch (e) {
          // 忽略获取失败
        }
      }

      // 辅助检测：是否存在对话输入框
      const hasInputBox = await page.locator('textarea, input[placeholder*="输入"], [contenteditable="true"]').count() > 0;

      // 获取 localStorage 和 Cookie 信息
      const allLocalStorage = await page.evaluate(() => {
        const keys = Object.keys(localStorage);
        return keys.map(k => ({ key: k, value: localStorage.getItem(k)?.substring(0, 100) }));
      });

      const cookies = await context.cookies();

      // 输出检测状态
      console.log(`[检测] 用户名: ${hasUserName ? `✓ (${userName})` : '✗'}, 输入框: ${hasInputBox ? '✓' : '✗'}`);
      console.log(`[检测] Cookie: ${cookies.length} 个, localStorage: ${allLocalStorage.length} 个键`);

      // 登录成功判断：检测到用户名（最可靠的标准）
      const isLoggedIn = hasUserName;

      if (isLoggedIn) {
        loggedIn = true;
        console.log(`\n✅ 检测到登录成功！用户: ${userName}`);
        console.log("   - 左下角用户信息已显示");
        console.log("   - 对话页面已加载");

        // 额外等待，确保认证信息完全写入
        console.log("\n   等待认证信息完全写入...");
        await page.waitForTimeout(3000);

        // 保存完整的浏览器状态
        const storageState = await context.storageState();

        console.log(`\n   📊 保存的状态:`);
        console.log(`      - Cookie 数量: ${storageState.cookies?.length || 0}`);
        console.log(`      - localStorage 源数量: ${storageState.origins?.length || 0}`);

        fs.writeFileSync(AUTH_STATE_FILE, JSON.stringify(storageState, null, 2));
        console.log(`\n✅ 会话状态已保存到 ${AUTH_STATE_FILE}\n`);

        // 额外验证：检查是否还有 guest 标记
        const hasGuest = allLocalStorage.some(item => item.value?.includes('guest'));
        if (hasGuest) {
          console.warn(`⚠️  注意: localStorage 中仍包含 'guest' 标记，可能需要手动检查`);
        }

        break;
      } else {
        console.log(`[等待] 未检测到用户名，请在弹窗中完成登录...`);
      }
    } catch (err) {
      console.error(`[错误] 检测失败: ${err.message}`);
    }
  }

  if (!loggedIn) {
    console.error("❌ 等待超时（2分钟）,未检测到登录成功");
  }

  await browser.close();
}

main().catch(err => {
  console.error("❌ 脚本执行失败:", err.message);
  process.exit(1);
});
