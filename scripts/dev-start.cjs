/**
 * 开发环境一键启动脚本
 * 同时启动 PocketBase + Vite 开发服务器
 *
 * 使用: node scripts/dev-start.cjs
 */
const { spawn } = require('child_process');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

console.log('========================================');
console.log('  九顺 - 开发环境启动');
console.log('========================================\n');

// 1. 启动 PocketBase
console.log('[1/2] 启动 PocketBase...');
const pb = spawn(path.join(ROOT, 'pocketbase.exe'), ['serve', '--http', '0.0.0.0:8090'], {
  cwd: ROOT,
  stdio: 'inherit',
  env: { ...process.env },
});

// 2. 启动 Vite
console.log('[2/2] 启动 Vite 开发服务器...');
const vite = spawn('npx', ['vite', '--host', '0.0.0.0', '--port', '5173'], {
  cwd: ROOT,
  stdio: 'inherit',
  env: { ...process.env },
  shell: true,
});

process.on('SIGINT', () => {
  console.log('\nShutting down...');
  pb.kill();
  vite.kill();
  process.exit(0);
});

process.on('SIGTERM', () => {
  pb.kill();
  vite.kill();
  process.exit(0);
});
