# 导出模块重写 + 全站色值统一 + APK 打包 设计文档

## 1. 全站十六进制色值统一

### 问题
Tailwind v4 默认输出 oklch() 色值，导出时 Canvas/Print 无法正确解析，导致偏色。

### 方案
在 `index.css` 中用 `@theme` 覆盖 Tailwind 默认色板，全部以 `#RRGGBB` 定义。所有 Tailwind 工具类（bg-blue-600 等）自动使用新色值。

### 改动范围
- `src/index.css` — 增加 `@theme` 完整色板
- 全局扫查所有 JSX/CSS 文件中的 `rgb(`、`hsl(`、`oklch(`、色名关键字，替换为十六进制
- `src/utils/pdfExporter.js` — 删除 `stripAllOklch()` 函数（不再需要）

---

## 2. 导出模块重写

### 方案
- **PDF**：浏览器原生 `window.print()` — 100% CSS 还原，零色偏
- **长图**：`dom-to-image-more` 3x 倍率 PNG 下载

### 新增依赖
- `dom-to-image-more`

### 核心函数
- `exportToImage(elementId, options)` — 长图导出
- `exportToPDF(elementId, options)` — PDF 导出
- `forceHexColorsToInline(root)` — 颜色十六进制强制写入内联样式
- `toHex(colorString)` — rgb/rgba/oklch → #RRGGBB 转换

### 改动范围
- **新建** `src/utils/exporter.js`
- **删除** `src/utils/pdfExporter.js`
- **修改** `src/components/ExportPanel.jsx`
- **修改** `src/pages/QuotationNewPage.jsx`

---

## 3. 自定义滚动条 + 一键到底

### 组件
- `FloatingScrollButton.jsx` — 右下悬浮按钮，到底时箭头翻转
- `CustomScrollbar.jsx` — 右侧轨道滑块，拖动快速定位

### 行为
- 仅内容超过视口高度时显示
- 复用范围：所有长列表页面

---

## 4. APK 打包

标准 Capacitor 流程：`npm run build` → `npx cap sync android` → Android Studio 构建 APK

---

## 路由结构（不变）

```
/quotation       → QuotationPage（产品报价列表）
/quotation/new   → QuotationNewPage（新建报价单）
/products/import → ImportPage（Excel 导入）
/records         → RecordsPage（历史报价）
/messages        → MessagesPage（待办事项）
/profile         → ProfilePage（个人设置）
```
