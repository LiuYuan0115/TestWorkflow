#!/usr/bin/env node

/**
 * AI 连接预热脚本
 *
 * 问题：首次通过代理调用 Gemini API 时，TLS 连接建立经常不稳定
 * 解决：在测试前先做一次轻量 API 调用，提前建立代理/TLS 连接
 *
 * 使用方式：npm run warmup
 */

const { execFile } = require('child_process');
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');

const execFileAsync = promisify(execFile);

// 加载 .env 配置
const envPath = path.resolve(__dirname, '../.env');
let baseUrl = 'https://generativelanguage.googleapis.com/v1beta/openai';
let apiKey = '';
let proxyUrl = '';

if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf-8').split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const [key, ...rest] = trimmed.split('=');
    const value = rest.join('=').trim();

    if (key.trim() === 'MIDSCENE_MODEL_BASE_URL') {
      baseUrl = value;
    } else if (key.trim() === 'MIDSCENE_MODEL_API_KEY') {
      apiKey = value;
    } else if (key.trim() === 'HTTP_PROXY' || key.trim() === 'HTTPS_PROXY') {
      proxyUrl = value;
    }
  });
}

/**
 * 预热 AI 连接
 * @param {number} maxRetries - 最大重试次数
 * @returns {Promise<void>}
 */
async function warmupAIConnection(maxRetries = 3) {
  if (!apiKey) {
    console.warn('[Warmup] ⚠️  未配置 MIDSCENE_MODEL_API_KEY，跳过预热');
    return;
  }

  console.log('[Warmup] 🔥 正在预热 AI 模型连接...');
  console.log(`[Warmup]    Base URL: ${baseUrl}`);
  console.log(`[Warmup]    Proxy: ${proxyUrl || 'none'}`);

  // 使用 /models 接口（最轻量）
  const targetUrl = `${baseUrl}/models`;

  const args = [
    '-s',                          // 静默模式
    '-o', '/dev/null',             // 丢弃响应体
    '-w', '%{http_code}',          // 只输出状态码
    '--connect-timeout', '15',     // 连接超时 15s
    '--max-time', '30',            // 总超时 30s
    '-H', `Authorization: Bearer ${apiKey}`,
  ];

  if (proxyUrl) {
    args.push('-x', proxyUrl);     // 设置 HTTP 代理
  }

  args.push(targetUrl);

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const startTime = Date.now();

    try {
      const { stdout } = await execFileAsync('curl', args);
      const statusCode = parseInt(stdout.trim(), 10);
      const duration = Date.now() - startTime;

      // HTTP 200-499 都算成功（只要能建立连接即可）
      if (statusCode >= 200 && statusCode < 500) {
        console.log(`[Warmup] ✅ 预热成功 (HTTP ${statusCode}, ${duration}ms, 第 ${attempt} 次尝试)`);
        return;
      } else {
        console.warn(`[Warmup] ⚠️  预热返回 HTTP ${statusCode}，重试中...`);
      }
    } catch (err) {
      const duration = Date.now() - startTime;
      console.warn(`[Warmup] ❌ 第 ${attempt} 次尝试失败 (${duration}ms): ${err.message}`);

      if (attempt === maxRetries) {
        console.error('[Warmup] ❌ 预热失败，但测试仍会继续执行');
        console.error('[Warmup]    提示: 首次 API 调用可能会超时，请检查网络和代理配置');
        return;
      }

      // 递增延迟：2s, 4s
      const delay = attempt * 2000;
      console.log(`[Warmup]    等待 ${delay}ms 后重试...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// 主函数
async function main() {
  try {
    await warmupAIConnection();
  } catch (err) {
    console.error('[Warmup] 预热过程出错:', err.message);
    process.exit(1);
  }
}

// 直接运行时执行
if (require.main === module) {
  main();
}

module.exports = { warmupAIConnection };
