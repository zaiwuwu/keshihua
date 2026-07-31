import { createClient } from '@supabase/supabase-js';
import db from './database';

let _client = null;

/** 获取 Supabase 客户端（从 settings 读取配置） */
export async function getSupabase() {
  if (_client) return _client;

  const s = await db.settings.get('supabase');
  if (!s?.value) return null;

  try {
    const { url, anonKey } = JSON.parse(s.value);
    if (!url || !anonKey) return null;
    _client = createClient(url, anonKey);
    return _client;
  } catch {
    return null;
  }
}

/** 保存 Supabase 连接配置 */
export async function saveSupabaseConfig(url, anonKey) {
  await db.settings.put({
    id: 'supabase',
    value: JSON.stringify({ url, anonKey }),
  });
  _client = null; // 重置以便下次用新配置
}

/** 获取当前配置 */
export async function getSupabaseConfig() {
  const s = await db.settings.get('supabase');
  if (!s?.value) return null;
  try { return JSON.parse(s.value); } catch { return null; }
}

/** 将 IndexedDB 全部数据推送到 Supabase */
export async function pushAllToSupabase() {
  const supabase = await getSupabase();
  if (!supabase) throw new Error('请先配置 Supabase 连接');

  const tables = [
    { name: 'products', data: await db.products.toArray() },
    { name: 'material_price', data: await db.materialPrice.toArray() },
    { name: 'quotations', data: await db.quotations.toArray() },
    { name: 'customers', data: await db.customers.toArray() },
    { name: 'settings', data: [{ id: 'app_settings', data: await db.settings.toArray() }] },
  ];

  const results = [];

  for (const table of tables) {
    for (const row of table.data) {
      const record = {
        id: String(row.id || crypto.randomUUID()),
        data: row,
        updated_at: row.updatedAt || new Date().toISOString(),
        device_id: row.deviceId || '',
        deleted: false,
      };

      const { error } = await supabase
        .from(table.name)
        .upsert(record, { onConflict: 'id' });

      if (error) {
        results.push({ table: table.name, id: record.id, status: 'failed', error: error.message });
      } else {
        results.push({ table: table.name, id: record.id, status: 'ok' });
      }
    }
  }

  return results;
}

/** 从 Supabase 拉取全部数据到 IndexedDB */
export async function pullAllFromSupabase() {
  const supabase = await getSupabase();
  if (!supabase) throw new Error('请先配置 Supabase 连接');

  const tableMap = {
    products: db.products,
    material_price: db.materialPrice,
    quotations: db.quotations,
    customers: db.customers,
  };

  let total = 0;

  for (const [name, dexieTable] of Object.entries(tableMap)) {
    const { data, error } = await supabase
      .from(name)
      .select('data')
      .eq('deleted', false);

    if (error) continue;

    if (data && data.length > 0) {
      await dexieTable.clear();
      for (const row of data) {
        await dexieTable.put(row.data);
      }
      total += data.length;
    }
  }

  return total;
}

/** 测试连接 */
export async function testSupabaseConnection(url, anonKey) {
  const client = createClient(url, anonKey);
  const { error } = await client.from('products').select('id', { count: 'exact', head: true });
  if (error) throw error;
  return true;
}
