#!/usr/bin/env node

/**
 * 停止应用
 *
 * 使用方式：
 *   node scripts/stop-app.js
 */

const { existsSync, readFileSync, unlinkSync } = require('fs');
const { resolve } = require('path');

const pidFile = resolve(__dirname, '../.app.pids');

if (!existsSync(pidFile)) {
  console.log('⚠️  未找到运行中的服务 PID 文件');
  console.log('   提示: 服务可能未通过 start-app.js 启动');
  process.exit(0);
}

console.log('⏹️  正在停止应用...\n');

try {
  const pids = JSON.parse(readFileSync(pidFile, 'utf-8'));

  pids.forEach((pid) => {
    try {
      process.kill(pid, 'SIGTERM');
      console.log(`✅ 已发送停止信号给进程 ${pid}`);
    } catch (err) {
      if (err.code === 'ESRCH') {
        console.log(`⚠️  进程 ${pid} 不存在（可能已停止）`);
      } else {
        console.error(`❌ 停止进程 ${pid} 失败:`, err.message);
      }
    }
  });

  // 删除 PID 文件
  unlinkSync(pidFile);
  console.log(`\n✅ 已清理 PID 文件: ${pidFile}`);
  console.log('✅ 应用已停止');
} catch (err) {
  console.error('❌ 停止服务失败:', err.message);
  process.exit(1);
}
