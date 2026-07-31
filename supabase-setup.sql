-- ═══════════════════════════════════════════════════════
-- Supabase 建表 SQL — 在 Supabase Dashboard → SQL Editor 执行
-- ═══════════════════════════════════════════════════════

-- 1. 产品表
CREATE TABLE products (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  device_id TEXT DEFAULT '',
  deleted BOOLEAN DEFAULT FALSE
);

-- 2. 材料价格表
CREATE TABLE material_price (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  device_id TEXT DEFAULT '',
  deleted BOOLEAN DEFAULT FALSE
);

-- 3. 报价单表
CREATE TABLE quotations (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  device_id TEXT DEFAULT '',
  deleted BOOLEAN DEFAULT FALSE
);

-- 4. 客户表
CREATE TABLE customers (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  device_id TEXT DEFAULT '',
  deleted BOOLEAN DEFAULT FALSE
);

-- 5. 设置表
CREATE TABLE settings (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  device_id TEXT DEFAULT '',
  deleted BOOLEAN DEFAULT FALSE
);

-- ═══ 开启实时推送 ═══
ALTER PUBLICATION supabase_realtime ADD TABLE products;
ALTER PUBLICATION supabase_realtime ADD TABLE material_price;
ALTER PUBLICATION supabase_realtime ADD TABLE quotations;
ALTER PUBLICATION supabase_realtime ADD TABLE customers;
ALTER PUBLICATION supabase_realtime ADD TABLE settings;

-- ═══ 行级安全 ═══
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_price ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- 允许匿名登录用户读写所有数据（个人 APP 全开放）
CREATE POLICY "anon_all" ON products FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon_all" ON material_price FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon_all" ON quotations FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon_all" ON customers FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon_all" ON settings FOR ALL TO authenticated USING (true) WITH CHECK (true);
