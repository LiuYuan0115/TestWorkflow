#!/usr/bin/env node

/**
 * 启动应用（API 网关 + 控制平面 + 前端 Web）
 *
 * 委托给 start-app.sh 执行实际启动逻辑。
 * Shell 脚本用 nohup + & 后台启动服务，然后用 lsof 轮询端口就绪。
 * 全部就绪后脚本退出（exit 0），子进程留在后台运行。
 *
 * 使用方式：
 *   node scripts/start-app.js
 */

const { spawnSync } = require('child_process');
const { resolve } = require('path');

const scriptPath = resolve(__dirname, 'start-app.sh');

const result = spawnSync('bash', [scriptPath], {
  stdio: 'inherit',
  timeout: 300000, // 5 分钟超时
});

if (result.status !== 0) {
  console.error('❌ 启动脚本失败 (exit code:', result.status, ')');
  process.exit(result.status || 1);
}

process.exit(0);
