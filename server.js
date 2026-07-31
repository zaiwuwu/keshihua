import express from 'express';
import cors from 'cors';
import pg from 'pg';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// PostgreSQL 连接
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('localhost') ? false : { rejectUnauthorized: false },
});

// 建表
async function initDB() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        doc_id TEXT UNIQUE,
        data JSONB NOT NULL DEFAULT '{}',
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        device_id TEXT DEFAULT '',
        deleted BOOLEAN DEFAULT FALSE
      );
      CREATE TABLE IF NOT EXISTS material_price (
        id SERIAL PRIMARY KEY,
        doc_id TEXT UNIQUE,
        data JSONB NOT NULL DEFAULT '{}',
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        device_id TEXT DEFAULT '',
        deleted BOOLEAN DEFAULT FALSE
      );
      CREATE TABLE IF NOT EXISTS quotations (
        id SERIAL PRIMARY KEY,
        doc_id TEXT UNIQUE,
        data JSONB NOT NULL DEFAULT '{}',
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        device_id TEXT DEFAULT '',
        deleted BOOLEAN DEFAULT FALSE
      );
      CREATE TABLE IF NOT EXISTS customers (
        id SERIAL PRIMARY KEY,
        doc_id TEXT UNIQUE,
        data JSONB NOT NULL DEFAULT '{}',
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        device_id TEXT DEFAULT '',
        deleted BOOLEAN DEFAULT FALSE
      );
      CREATE TABLE IF NOT EXISTS settings (
        id SERIAL PRIMARY KEY,
        doc_id TEXT UNIQUE,
        data JSONB NOT NULL DEFAULT '{}',
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        device_id TEXT DEFAULT '',
        deleted BOOLEAN DEFAULT FALSE
      );
    `);
    console.log('✓ PostgreSQL 表就绪');
  } finally {
    client.release();
  }
}

// ====== REST API ======

const TABLES = ['products', 'material_price', 'quotations', 'customers', 'settings'];

// 获取全表数据
app.get('/api/:table', async (req, res) => {
  const { table } = req.params;
  if (!TABLES.includes(table)) return res.status(404).json({ error: '表不存在' });
  try {
    const { rows } = await pool.query(
      `SELECT * FROM ${table} WHERE deleted = FALSE ORDER BY updated_at DESC`
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 批量 upsert
app.post('/api/:table/sync', async (req, res) => {
  const { table } = req.params;
  if (!TABLES.includes(table)) return res.status(404).json({ error: '表不存在' });
  const { records } = req.body;
  if (!Array.isArray(records)) return res.status(400).json({ error: 'records 需为数组' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    let count = 0;
    for (const rec of records) {
      const docId = String(rec.id || rec.doc_id || '');
      const data = rec.data || rec;
      await client.query(
        `INSERT INTO ${table} (doc_id, data, updated_at, device_id)
         VALUES ($1, $2, NOW(), $3)
         ON CONFLICT (doc_id) DO UPDATE SET data = $2, updated_at = NOW()`,
        [docId, JSON.stringify(data), rec.device_id || '']
      );
      count++;
    }
    await client.query('COMMIT');
    res.json({ ok: true, count });
  } catch (e) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: e.message });
  } finally {
    client.release();
  }
});

// 删除（软删除）
app.delete('/api/:table/:docId', async (req, res) => {
  const { table, docId } = req.params;
  if (!TABLES.includes(table)) return res.status(404).json({ error: '表不存在' });
  try {
    await pool.query(`UPDATE ${table} SET deleted = TRUE WHERE doc_id = $1`, [docId]);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 健康检查
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ ok: true, db: 'connected' });
  } catch (e) {
    res.status(500).json({ ok: false, db: e.message });
  }
});

// 静态文件（前端 SPA）
app.use(express.static(join(__dirname, 'dist')));
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

// 启动
const PORT = process.env.PORT || 3000;
initDB().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✓ 服务已启动 :${PORT}`);
  });
}).catch((e) => {
  console.error('数据库初始化失败:', e.message);
  process.exit(1);
});
