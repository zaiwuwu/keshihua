import Dexie from 'dexie';

const db = new Dexie('QuotationApp');

db.version(1).stores({
  products: '++id, category, name, capacityMl, color',
  materialPrice: '++id, updatedAt',
  quotations: '++id, createdAt, status',
  settings: 'id',
});

// v2: 新增客户表
db.version(2).stores({
  customers: '++id, name, phone',
});

// v3: 产品表新增包装尺寸字段
db.version(3).stores({
  products: '++id, category, name, capacityMl, color, packLength, packWidth, packHeight, pcsPerBox',
  materialPrice: '++id, updatedAt',
  quotations: '++id, createdAt, status',
  settings: 'id',
  customers: '++id, name, phone',
});

export default db;
