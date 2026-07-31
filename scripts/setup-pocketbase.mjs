/**
 * PocketBase 初始化脚本
 * 创建超级管理员 + 5个业务数据集合
 *
 * 使用: node scripts/setup-pocketbase.mjs
 * 前提: PocketBase 服务已运行在 http://localhost:8090
 */
import PocketBase from 'pocketbase';

const PB_URL = process.env.PB_URL || 'http://localhost:8090';
const ADMIN_EMAIL = 'admin@jiusun.com';
const ADMIN_PASSWORD = 'jiusun123456';

const pb = new PocketBase(PB_URL);

/** 通用集合定义 */
const SCHEMA = [
  { name: 'docId', type: 'text', required: true, options: { maxSize: 64 } },
  { name: 'recordData', type: 'json' },
  { name: 'deviceId', type: 'text', options: { maxSize: 64 } },
  { name: 'deleted', type: 'bool' },
];

const COLLECTIONS = ['products', 'materialPrice', 'quotations', 'customers', 'settings'];
const INDEXES = [
  'CREATE UNIQUE INDEX idx_{name}_docId ON {name} (docId)',
];

async function main() {
  console.log(`\n========================================`);
  console.log(`  PocketBase 初始化`);
  console.log(`  地址: ${PB_URL}`);
  console.log(`========================================\n`);

  // 1. 测试连接
  await pb.health.check();
  console.log('✓ 服务连接正常\n');

  // 2. 创建超级管理员
  console.log('>>> 创建超级管理员...');
  const { execSync } = await import('child_process');
  const pbPath = new URL('../pocketbase.exe', import.meta.url).pathname;
  execSync(`"${pbPath}" superuser upsert "${ADMIN_EMAIL}" "${ADMIN_PASSWORD}"`, {
    stdio: 'pipe',
    timeout: 10000,
    cwd: new URL('..', import.meta.url).pathname,
  });
  console.log(`  ✓ ${ADMIN_EMAIL}\n`);

  // 3. 登录
  console.log('>>> 登录...');
  await pb.admins.authWithPassword(ADMIN_EMAIL, ADMIN_PASSWORD);
  console.log('  ✓ OK\n');

  // 4. 创建/更新集合
  for (const name of COLLECTIONS) {
    process.stdout.write(`[${name}] `);
    const list = await pb.collections.getList(1, 50, { filter: `name="${name}"` });
    const exists = list.items[0];

    const body = {
      name,
      type: 'base',
      schema: SCHEMA,
      indexes: INDEXES.map((idx) => idx.replace(/{name}/g, name)),
      listRule: '',
      viewRule: '',
      createRule: '',
      updateRule: '',
      deleteRule: '',
    };

    if (exists) {
      await pb.collections.update(exists.id, body);
      process.stdout.write('已更新\n');
    } else {
      await pb.collections.create(body);
      process.stdout.write('已创建\n');
    }
  }

  console.log(`\n========================================`);
  console.log(`  初始化完成！`);
  console.log(`  管理后台: ${PB_URL}/_/`);
  console.log(`  管理员: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  console.log(`  退出请按 Ctrl+C`);
  console.log(`========================================\n`);
}

main().catch((e) => {
  console.error('\n✗ 失败:', e.message);
  process.exit(1);
});
