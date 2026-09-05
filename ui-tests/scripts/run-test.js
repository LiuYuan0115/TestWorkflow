#!/usr/bin/env node

/**
 * 运行测试脚本
 * 支持标签过滤、失败用例重跑等功能
 */

const { spawn } = require('child_process');
const path = require('path');

// 解析命令行参数
const args = process.argv.slice(2);
const tagsFilter = args.find(arg => arg.startsWith('--tagsFilter='))?.split('=')[1];
const failed = args.includes('--failed');
const debug = process.env.DEBUG === 'true';
const headless = process.env.HEADLESS === 'true';

// 构建 vitest 命令
const vitestArgs = ['run'];

if (tagsFilter) {
  // 标签过滤需要在 vitest 配置中实现
  vitestArgs.push('--grep', `@${tagsFilter}`);
}

if (failed) {
  vitestArgs.push('--retry=1');
}

console.log('🚀 运行测试...\n');
console.log(`参数: ${vitestArgs.join(' ')}\n`);

// 启动 vitest
const vitest = spawn('npx', ['vitest', ...vitestArgs], {
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    DEBUG: debug ? 'true' : 'false',
    HEADLESS: headless ? 'true' : 'false',
  }
});

vitest.on('close', (code) => {
  process.exit(code);
});
