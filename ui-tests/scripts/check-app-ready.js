#!/usr/bin/env node

/**
 * 健康检查 - 等待应用就绪
 *
 * 使用方式：
 *   node scripts/check-app-ready.js
 *
 * 检查项：
 *   - 前端服务 (127.0.0.1:1520)
 *   - API 网关 (127.0.0.1:2130) [可选]
 */

const http = require('http');

const MAX_RETRIES = 30; // 最多重试 30 次
const RETRY_INTERVAL = 2000; // 每 2 秒重试一次

// 检查端口是否可访问
function checkPort(host, port) {
  return new Promise((resolve) => {
    const req = http.get({ host, port, timeout: 1000 }, (res) => {
      resolve(true);
    });

    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
  });
}

// 等待服务就绪
async function waitForService(name, host, port, retries = MAX_RETRIES) {
  for (let i = 1; i <= retries; i++) {
    process.stdout.write(`\r⏳ 等待 ${name} 就绪... (${i}/${retries})`);

    const isReady = await checkPort(host, port);
    if (isReady) {
      console.log(`\r✅ ${name} 已就绪 (${host}:${port})                    `);
      return true;
    }

    await new Promise((resolve) => setTimeout(resolve, RETRY_INTERVAL));
  }

  console.log(`\r❌ ${name} 超时未就绪 (${host}:${port})                    `);
  return false;
}

// 主流程
async function main() {
  console.log('🔍 检查应用健康状态...\n');

  const checks = [
    { name: '前端 Web', host: '127.0.0.1', port: 1520, required: true },
    { name: 'API 网关', host: '127.0.0.1', port: 2130, required: false },
  ];

  let allPassed = true;

  for (const { name, host, port, required } of checks) {
    const passed = await waitForService(name, host, port);

    if (!passed && required) {
      allPassed = false;
    }
  }

  console.log('');

  if (!allPassed) {
    console.log('💡 提示: 请先启动应用');
    console.log('   cd /path/to/your/project/');
    console.log('   pnpm dev:control-plane   # 终端 1');
    console.log('   pnpm dev:api             # 终端 2');
    console.log('   pnpm dev:web             # 终端 3');
    console.log('');
    console.log('   或使用启动脚本:');
    console.log('   npm run start:app');
    process.exit(1);
  } else {
    console.log('✅ 所有必需服务已就绪，可以运行测试！');
    process.exit(0);
  }
}

main().catch((err) => {
  console.error('❌ 健康检查失败:', err.message);
  process.exit(1);
});
