# 餐盒产品报价与成本管控 APP — 设计文档

**日期:** 2026-05-19
**类型:** PWA 移动 Web 应用
**方案:** Phase 1 MVP → Phase 2 商务增强 → Phase 3 完善 & 小程序

---

## 1. 概述

开发一款移动端 PWA 餐盒产品报价与成本管控应用。MVP 阶段覆盖：Excel 导入产品数据、聚丙烯价格换算、一键生成商务报价单并导出 PDF/长图。后续迭代加入毛利管控、客户管理、时间戳追溯等模块。

## 2. 技术栈

| 类型 | 选择 | 说明 |
|------|------|------|
| 框架 | React 18 + Vite | 快速开发，HMR |
| 样式 | TailwindCSS 3 | 移动优先响应式 |
| 路由 | React Router v6 | Hash 路由 |
| 状态管理 | Zustand | 轻量，内置持久化中间件 |
| 离线存储 | IndexedDB (Dexie.js) | 产品/报价/日志 |
| Excel 解析 | SheetJS (xlsx) | 导入导出 |
| PDF 导出 | html2canvas + jsPDF | 报价单 PDF |
| PWA | vite-plugin-pwa (Workbox) | Service Worker + 离线缓存 |
| 图标 | Lucide React | 轻量图标库 |

## 3. 路由设计

| 路由 | 页面 | Tab |
|------|------|-----|
| `/products` | 产品列表 + 分类筛选 | Tab1 产品 |
| `/products/import` | Excel 导入(解析→预览→确认) | — |
| `/quotations` | 报价单历史列表 | Tab2 报价单 |
| `/quotations/new` | 新建报价单(勾选→计价→商务→导出) | — |
| `/price` | 价格管理(料价输入→换算→预警) | Tab3 价格 |
| `/settings` | 公司信息 / 商务模板设置 | Tab4 我的 |

## 4. 数据模型 (IndexedDB)

### products (产品表)
`id, rowIndex, category, name, capacityMl, spec, weightGrams, color, materialPrice, factoryPrice, updatedAt`

### quotations (报价单表)
`id, customerInfo, items(JSON), totalAmount, businessInfo(JSON), createdAt, status`

### materialPrice (料价表)
`id, marketPricePerTon, pricePerGram, updatedAt, source`

### auditLog (操作日志表 — Phase 2)
`id, actionType, content, beforeAfter(JSON), timestamp, operator`

## 5. 核心组件树

```
App
├── Layout (底部Tab导航 + 离线提示条)
├── ProductListPage — 产品列表
│   ├── SearchBar, CategoryFilter, ProductCard[], FloatingAction
├── ImportPage — Excel 导入
│   ├── FileUploader, DataPreview, ImportConfirm
├── QuotationNewPage — 新建报价单
│   ├── ProductPicker, PriceCalculator, BusinessInfoForm, ExportPanel
├── PricePage — 价格管理
│   ├── MaterialPriceInput, PriceConverter, PriceAlert
└── SettingsPage — 设置
    └── CompanyInfoForm
```

## 6. 价格换算公式

```
每克料价 = 聚丙烯市场均价(元/吨) ÷ 1,000,000
单套料成本 = 每克料价 × 成套克重
```

## 7. 报价单导出流程

勾选产品 → 填写数量 → 自动计价(克重×料价=料成本, +出厂价) → 填写商务信息(抬头/Logo/银行/有效期/付款方式/交货期) → 预览 → html2canvas 生成图片 → jsPDF 输出 PDF

## 8. Phase 范围

### MVP (本次实现)
- Excel 导入 + 产品列表展示 + 分类标签筛选
- 手动输入聚丙烯市场均价 → 一键换算每克料价 → 批量填入
- 新建报价单：勾选产品 → 自动计价 → 商务信息 → PDF 导出
- PWA 离线缓存(产品数据 + 报价单)

### Phase 2 (后续)
- 毛利测算 + 毛利率红线
- 客户分级 + 折扣规则
- 历史报价追溯 + 时间戳日志
- 大宗商品 API 自动同步

### Phase 3 (后续)
- 腾讯文档实时同步
- 微信小程序移植
- 批量调价工具
