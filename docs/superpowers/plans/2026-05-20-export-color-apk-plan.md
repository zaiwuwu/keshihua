# 导出模块重写 + 全站色值统一 + 滚动交互 + APK 打包 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers-extended-cc:subagent-driven-development (recommended) or superpowers-extended-cc:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 重写导出模块（PDF 原生打印 + 长图 dom-to-image-more 3x），全站 Tailwind 色值强制十六进制，新增自定义滚动条与一键到底悬浮按钮，最终打包 APK。

**Architecture:** 新建 `exporter.js` 替代 `pdfExporter.js`，PDF 走 `window.open` + `window.print` 原生通道零偏色，长图走 `dom-to-image-more` 3x PNG；`index.css` 通过 `@theme` 覆盖 Tailwind v4 色板全部定义为十六进制；新增 `FloatingScrollButton` 和 `CustomScrollbar` 两个独立组件。

**Tech Stack:** React 19, Tailwind CSS v4, dom-to-image-more, Capacitor (Android), Vite 8

---

### Task 1: Install dom-to-image-more dependency

**Goal:** 安装 dom-to-image-more 替代 html2canvas

**Files:**
- Modify: `package.json`

**Acceptance Criteria:**
- [ ] `dom-to-image-more` 出现在 `package.json` dependencies 中
- [ ] `npm install` 成功

**Verify:** `npm ls dom-to-image-more` → 显示版本号

**Steps:**

- [ ] **Step 1: 安装依赖**

```bash
cd "/d/桌面/报价单可视化app" && npm install dom-to-image-more
```

- [ ] **Step 2: 验证安装**

```bash
npm ls dom-to-image-more
```

---

### Task 2: 全站 Tailwind 色板覆盖为十六进制

**Goal:** 在 `index.css` 中用 `@theme` 定义完整色板，确保 Tailwind v4 全部输出 #RRGGBB

**Files:**
- Modify: `src/index.css`

**Acceptance Criteria:**
- [ ] `@theme` 块覆盖 Tailwind 默认所有常用色阶（slate, gray, zinc, neutral, stone, red, orange, amber, yellow, lime, green, emerald, teal, cyan, sky, blue, indigo, violet, purple, fuchsia, pink, rose）
- [ ] 每个色阶包含 50/100/200/300/400/500/600/700/800/900/950 共 11 级
- [ ] 全部使用 #RRGGBB 格式
- [ ] 项目 `npm run dev` 正常启动

**Verify:** 启动 dev server 后检查页面无样式错乱

**Steps:**

- [ ] **Step 1: 修改 index.css**

将现有 `@import "tailwindcss";` 后的内容改为：

```css
@import "tailwindcss";

@theme {
  /* Slate */
  --color-slate-50: #f8fafc;
  --color-slate-100: #f1f5f9;
  --color-slate-200: #e2e8f0;
  --color-slate-300: #cbd5e1;
  --color-slate-400: #94a3b8;
  --color-slate-500: #64748b;
  --color-slate-600: #475569;
  --color-slate-700: #334155;
  --color-slate-800: #1e293b;
  --color-slate-900: #0f172a;
  --color-slate-950: #020617;

  /* Gray */
  --color-gray-50: #f9fafb;
  --color-gray-100: #f3f4f6;
  --color-gray-200: #e5e7eb;
  --color-gray-300: #d1d5db;
  --color-gray-400: #9ca3af;
  --color-gray-500: #6b7280;
  --color-gray-600: #4b5563;
  --color-gray-700: #374151;
  --color-gray-800: #1f2937;
  --color-gray-900: #111827;
  --color-gray-950: #030712;

  /* Zinc */
  --color-zinc-50: #fafafa;
  --color-zinc-100: #f4f4f5;
  --color-zinc-200: #e4e4e7;
  --color-zinc-300: #d4d4d8;
  --color-zinc-400: #a1a1aa;
  --color-zinc-500: #71717a;
  --color-zinc-600: #52525b;
  --color-zinc-700: #3f3f46;
  --color-zinc-800: #27272a;
  --color-zinc-900: #18181b;
  --color-zinc-950: #09090b;

  /* Neutral */
  --color-neutral-50: #fafafa;
  --color-neutral-100: #f5f5f5;
  --color-neutral-200: #e5e5e5;
  --color-neutral-300: #d4d4d4;
  --color-neutral-400: #a3a3a3;
  --color-neutral-500: #737373;
  --color-neutral-600: #525252;
  --color-neutral-700: #404040;
  --color-neutral-800: #262626;
  --color-neutral-900: #171717;
  --color-neutral-950: #0a0a0a;

  /* Stone */
  --color-stone-50: #fafaf9;
  --color-stone-100: #f5f5f4;
  --color-stone-200: #e7e5e4;
  --color-stone-300: #d6d3d1;
  --color-stone-400: #a8a29e;
  --color-stone-500: #78716c;
  --color-stone-600: #57534e;
  --color-stone-700: #44403c;
  --color-stone-800: #292524;
  --color-stone-900: #1c1917;
  --color-stone-950: #0c0a09;

  /* Red */
  --color-red-50: #fef2f2;
  --color-red-100: #fee2e2;
  --color-red-200: #fecaca;
  --color-red-300: #fca5a5;
  --color-red-400: #f87171;
  --color-red-500: #ef4444;
  --color-red-600: #dc2626;
  --color-red-700: #b91c1c;
  --color-red-800: #991b1b;
  --color-red-900: #7f1d1d;
  --color-red-950: #450a0a;

  /* Orange */
  --color-orange-50: #fff7ed;
  --color-orange-100: #ffedd5;
  --color-orange-200: #fed7aa;
  --color-orange-300: #fdba74;
  --color-orange-400: #fb923c;
  --color-orange-500: #f97316;
  --color-orange-600: #ea580c;
  --color-orange-700: #c2410c;
  --color-orange-800: #9a3412;
  --color-orange-900: #7c2d12;
  --color-orange-950: #431407;

  /* Amber */
  --color-amber-50: #fffbeb;
  --color-amber-100: #fef3c7;
  --color-amber-200: #fde68a;
  --color-amber-300: #fcd34d;
  --color-amber-400: #fbbf24;
  --color-amber-500: #f59e0b;
  --color-amber-600: #d97706;
  --color-amber-700: #b45309;
  --color-amber-800: #92400e;
  --color-amber-900: #78350f;
  --color-amber-950: #451a03;

  /* Yellow */
  --color-yellow-50: #fefce8;
  --color-yellow-100: #fef9c3;
  --color-yellow-200: #fef08a;
  --color-yellow-300: #fde047;
  --color-yellow-400: #facc15;
  --color-yellow-500: #eab308;
  --color-yellow-600: #ca8a04;
  --color-yellow-700: #a16207;
  --color-yellow-800: #854d0e;
  --color-yellow-900: #713f12;
  --color-yellow-950: #422006;

  /* Lime */
  --color-lime-50: #f7fee7;
  --color-lime-100: #ecfccb;
  --color-lime-200: #d9f99d;
  --color-lime-300: #bef264;
  --color-lime-400: #a3e635;
  --color-lime-500: #84cc16;
  --color-lime-600: #65a30d;
  --color-lime-700: #4d7c0f;
  --color-lime-800: #3f6212;
  --color-lime-900: #365314;
  --color-lime-950: #1a2e05;

  /* Green */
  --color-green-50: #f0fdf4;
  --color-green-100: #dcfce7;
  --color-green-200: #bbf7d0;
  --color-green-300: #86efac;
  --color-green-400: #4ade80;
  --color-green-500: #22c55e;
  --color-green-600: #16a34a;
  --color-green-700: #15803d;
  --color-green-800: #166534;
  --color-green-900: #14532d;
  --color-green-950: #052e16;

  /* Emerald */
  --color-emerald-50: #ecfdf5;
  --color-emerald-100: #d1fae5;
  --color-emerald-200: #a7f3d0;
  --color-emerald-300: #6ee7b7;
  --color-emerald-400: #34d399;
  --color-emerald-500: #10b981;
  --color-emerald-600: #059669;
  --color-emerald-700: #047857;
  --color-emerald-800: #065f46;
  --color-emerald-900: #064e3b;
  --color-emerald-950: #022c22;

  /* Teal */
  --color-teal-50: #f0fdfa;
  --color-teal-100: #ccfbf1;
  --color-teal-200: #99f6e4;
  --color-teal-300: #5eead4;
  --color-teal-400: #2dd4bf;
  --color-teal-500: #14b8a6;
  --color-teal-600: #0d9488;
  --color-teal-700: #0f766e;
  --color-teal-800: #115e59;
  --color-teal-900: #134e4a;
  --color-teal-950: #042f2e;

  /* Cyan */
  --color-cyan-50: #ecfeff;
  --color-cyan-100: #cffafe;
  --color-cyan-200: #a5f3fc;
  --color-cyan-300: #67e8f9;
  --color-cyan-400: #22d3ee;
  --color-cyan-500: #06b6d4;
  --color-cyan-600: #0891b2;
  --color-cyan-700: #0e7490;
  --color-cyan-800: #155e75;
  --color-cyan-900: #164e63;
  --color-cyan-950: #083344;

  /* Sky */
  --color-sky-50: #f0f9ff;
  --color-sky-100: #e0f2fe;
  --color-sky-200: #bae6fd;
  --color-sky-300: #7dd3fc;
  --color-sky-400: #38bdf8;
  --color-sky-500: #0ea5e9;
  --color-sky-600: #0284c7;
  --color-sky-700: #0369a1;
  --color-sky-800: #075985;
  --color-sky-900: #0c4a6e;
  --color-sky-950: #082f49;

  /* Blue */
  --color-blue-50: #eff6ff;
  --color-blue-100: #dbeafe;
  --color-blue-200: #bfdbfe;
  --color-blue-300: #93c5fd;
  --color-blue-400: #60a5fa;
  --color-blue-500: #3b82f6;
  --color-blue-600: #2563eb;
  --color-blue-700: #1d4ed8;
  --color-blue-800: #1e40af;
  --color-blue-900: #1e3a8a;
  --color-blue-950: #172554;

  /* Indigo */
  --color-indigo-50: #eef2ff;
  --color-indigo-100: #e0e7ff;
  --color-indigo-200: #c7d2fe;
  --color-indigo-300: #a5b4fc;
  --color-indigo-400: #818cf8;
  --color-indigo-500: #6366f1;
  --color-indigo-600: #4f46e5;
  --color-indigo-700: #4338ca;
  --color-indigo-800: #3730a3;
  --color-indigo-900: #312e81;
  --color-indigo-950: #1e1b4b;

  /* Violet */
  --color-violet-50: #f5f3ff;
  --color-violet-100: #ede9fe;
  --color-violet-200: #ddd6fe;
  --color-violet-300: #c4b5fd;
  --color-violet-400: #a78bfa;
  --color-violet-500: #8b5cf6;
  --color-violet-600: #7c3aed;
  --color-violet-700: #6d28d9;
  --color-violet-800: #5b21b6;
  --color-violet-900: #4c1d95;
  --color-violet-950: #2e1065;

  /* Purple */
  --color-purple-50: #faf5ff;
  --color-purple-100: #f3e8ff;
  --color-purple-200: #e9d5ff;
  --color-purple-300: #d8b4fe;
  --color-purple-400: #c084fc;
  --color-purple-500: #a855f7;
  --color-purple-600: #9333ea;
  --color-purple-700: #7e22ce;
  --color-purple-800: #6b21a8;
  --color-purple-900: #581c87;
  --color-purple-950: #3b0764;

  /* Fuchsia */
  --color-fuchsia-50: #fdf4ff;
  --color-fuchsia-100: #fae8ff;
  --color-fuchsia-200: #f5d0fe;
  --color-fuchsia-300: #f0abfc;
  --color-fuchsia-400: #e879f9;
  --color-fuchsia-500: #d946ef;
  --color-fuchsia-600: #c026d3;
  --color-fuchsia-700: #a21caf;
  --color-fuchsia-800: #86198f;
  --color-fuchsia-900: #701a75;
  --color-fuchsia-950: #4a044e;

  /* Pink */
  --color-pink-50: #fdf2f8;
  --color-pink-100: #fce7f3;
  --color-pink-200: #fbcfe8;
  --color-pink-300: #f9a8d4;
  --color-pink-400: #f472b6;
  --color-pink-500: #ec4899;
  --color-pink-600: #db2777;
  --color-pink-700: #be185d;
  --color-pink-800: #9d174d;
  --color-pink-900: #831843;
  --color-pink-950: #500724;

  /* Rose */
  --color-rose-50: #fff1f2;
  --color-rose-100: #ffe4e6;
  --color-rose-200: #fecdd3;
  --color-rose-300: #fda4af;
  --color-rose-400: #fb7185;
  --color-rose-500: #f43f5e;
  --color-rose-600: #e11d48;
  --color-rose-700: #be123c;
  --color-rose-800: #9f1239;
  --color-rose-900: #881337;
  --color-rose-950: #4c0519;
}

html, body, #root {
  height: 100%;
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  -webkit-font-smoothing: antialiased;
  background: #f8fafc;
  color: #1e293b;
}

input, select, textarea, button {
  font-size: 16px;
}
```

- [ ] **Step 2: 验证构建**

```bash
npm run build
```

---

### Task 3: 创建通用导出模块 exporter.js

**Goal:** 新建 `src/utils/exporter.js`，提供 `exportToImage` 和 `exportToPDF` 两个通用导出函数

**Files:**
- Create: `src/utils/exporter.js`

**Acceptance Criteria:**
- [ ] `exportToImage(elementId, options)` 使用 dom-to-image-more 3x 倍率输出 PNG 长图并触发下载
- [ ] `exportToPDF(elementId, options)` 使用 window.open + window.print 原生渲染输出 PDF
- [ ] `forceHexColorsToInline(root)` 遍历 DOM 树，将 computedStyle 中的颜色强制写为内联 #RRGGBB
- [ ] `toHex(colorString)` 支持 rgb/rgba/oklch → #RRGGBB 转换，oklch 通过 Canvas 桥接转换
- [ ] 导出前自动调用 `forceHexColorsToInline` 保证原色还原

**Verify:** `npm run build` 无报错

**Steps:**

- [ ] **Step 1: 创建 exporter.js**

```js
import domtoimage from 'dom-to-image-more';

/**
 * 将 rgb/rgba/oklch/hsl 等颜色字符串转换为 #RRGGBB 格式
 * oklch 无法直接公式换算，通过 Canvas 桥接（临时像素填充后读回）
 */
function toHex(colorStr) {
  if (!colorStr || colorStr === 'transparent' || colorStr === 'rgba(0, 0, 0, 0)') return null;
  if (colorStr.startsWith('#') && (colorStr.length === 7 || colorStr.length === 9)) return colorStr;

  // 创建临时 canvas 进行颜色转换
  const ctx = document.createElement('canvas').getContext('2d');
  ctx.fillStyle = colorStr;
  const hex = ctx.fillStyle;
  if (hex && hex.startsWith('#')) return hex;

  // 兜底：提取 rgb 数值手动转 hex
  const match = colorStr.match(/[\d.]+/g);
  if (match && match.length >= 3) {
    const r = parseInt(match[0]);
    const g = parseInt(match[1]);
    const b = parseInt(match[2]);
    const a = match.length >= 4 ? Math.round(parseFloat(match[3]) * 255) : null;
    const hexR = r.toString(16).padStart(2, '0');
    const hexG = g.toString(16).padStart(2, '0');
    const hexB = b.toString(16).padStart(2, '0');
    if (a !== null && a < 255) {
      return `#${hexR}${hexG}${hexB}${a.toString(16).padStart(2, '0')}`;
    }
    return `#${hexR}${hexG}${hexB}`;
  }
  return null;
}

/**
 * 遍历克隆 DOM 树，将所有 computedStyle 颜色强制写入内联 #RRGGBB
 * 这是保证导出"原色还原"的核心函数
 */
function forceHexColorsToInline(root) {
  const colorProps = [
    'color', 'background-color', 'border-color',
    'border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color',
    'outline-color', 'text-decoration-color',
  ];

  root.querySelectorAll('*').forEach((el) => {
    const cs = window.getComputedStyle(el);
    colorProps.forEach((prop) => {
      try {
        const val = cs.getPropertyValue(prop);
        if (!val || val === 'transparent' || val === 'rgba(0, 0, 0, 0)') return;
        const hex = toHex(val);
        if (hex) {
          el.style.setProperty(prop, hex, 'important');
        }
      } catch (_) { /* skip unavailable properties */ }
    });

    // 单独处理 box-shadow（可能包含多色值）
    try {
      const shadow = cs.getPropertyValue('box-shadow');
      if (shadow && shadow !== 'none') {
        el.style.setProperty('box-shadow', shadow, 'important');
      }
    } catch (_) { /* skip */ }
  });

  // 强制根节点背景白色
  root.style.setProperty('background-color', '#ffffff', 'important');
}

/**
 * 构建打印专用 HTML 文档（嵌入 clone 内容 + Print CSS）
 */
function buildPrintHTML(clonedElement, options = {}) {
  const styles = document.querySelectorAll('style, link[rel="stylesheet"]').values();
  let styleHTML = '';
  for (const s of styles) {
    styleHTML += s.outerHTML;
  }

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${options.filename || '导出'}</title>
${styleHTML}
<style>
  @media print {
    @page { size: A4; margin: 12mm; }
    html, body {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
      background: #ffffff !important;
    }
  }
  html, body {
    margin: 0;
    padding: 16px;
    background: #ffffff;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  }
</style>
</head>
<body>${clonedElement.outerHTML}</body>
</html>`;
}

/**
 * 指定区域导出高清长图
 * @param {string} elementId - 目标 DOM 元素 ID
 * @param {object} options - { scale, filename, quality }
 */
export async function exportToImage(elementId, options = {}) {
  const node = document.getElementById(elementId);
  if (!node) {
    alert('未找到导出内容');
    return false;
  }

  const filename = options.filename || 'export';
  const scale = options.scale || 3;

  try {
    // 克隆节点并强制十六进制色值
    const clone = node.cloneNode(true);
    clone.style.position = 'fixed';
    clone.style.top = '-9999px';
    clone.style.left = '-9999px';
    clone.style.width = node.scrollWidth + 'px';
    clone.style.zIndex = '-1';
    document.body.appendChild(clone);

    // 等待样式加载后处理颜色
    await new Promise((r) => setTimeout(r, 100));
    forceHexColorsToInline(clone);

    const dataUrl = await domtoimage.toPng(clone, {
      scale,
      quality: options.quality || 1.0,
      backgroundColor: '#ffffff',
      width: node.scrollWidth,
      height: node.scrollHeight,
    });

    document.body.removeChild(clone);

    // 触发下载
    const link = document.createElement('a');
    link.download = `${filename}.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return true;
  } catch (err) {
    console.error('长图导出失败:', err);
    alert('导出失败，请重试');
    return false;
  }
}

/**
 * 指定区域导出 PDF（浏览器原生打印）
 * @param {string} elementId - 目标 DOM 元素 ID
 * @param {object} options - { filename }
 */
export function exportToPDF(elementId, options = {}) {
  const node = document.getElementById(elementId);
  if (!node) {
    alert('未找到导出内容');
    return false;
  }

  try {
    const clone = node.cloneNode(true);
    forceHexColorsToInline(clone);

    const html = buildPrintHTML(clone, options);
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('请允许弹出窗口以导出 PDF');
      return false;
    }

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();

    // 等待资源加载后打印
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        printWindow.onafterprint = () => {
          printWindow.close();
        };
      }, 300);
    };

    return true;
  } catch (err) {
    console.error('PDF 导出失败:', err);
    alert('导出失败，请重试');
    return false;
  }
}
```

- [ ] **Step 2: 验证构建**

```bash
npm run build
```

---

### Task 4: 更新 ExportPanel 组件引用

**Goal:** 将 ExportPanel 的导入从旧 pdfExporter 切换到新 exporter

**Files:**
- Modify: `src/components/ExportPanel.jsx`

**Acceptance Criteria:**
- [ ] import 语句改为新路径 `../utils/exporter`
- [ ] 导出按钮功能正常

**Verify:** `npm run build` 无报错

**Steps:**

- [ ] **Step 1: 修改 import**

将 `src/components/ExportPanel.jsx` 第 1 行：
```js
import { exportToPDF, exportToImage } from '../utils/pdfExporter';
```
改为：
```js
import { exportToPDF, exportToImage } from '../utils/exporter';
```

---

### Task 5: 删除旧 pdfExporter.js

**Goal:** 清理废弃文件

**Files:**
- Delete: `src/utils/pdfExporter.js`

**Acceptance Criteria:**
- [ ] `src/utils/pdfExporter.js` 文件已删除
- [ ] `npm run build` 无报错（证明无残留引用）

**Verify:** `npm run build` → Build success

**Steps:**

- [ ] **Step 1: 删除文件**

```bash
rm "/d/桌面/报价单可视化app/src/utils/pdfExporter.js"
```

- [ ] **Step 2: 验证构建**

```bash
cd "/d/桌面/报价单可视化app" && npm run build
```

---

### Task 6: 创建 FloatingScrollButton 和 CustomScrollbar 组件

**Goal:** 封装两个独立滚动交互组件

**Files:**
- Create: `src/components/FloatingScrollButton.jsx`
- Create: `src/components/CustomScrollbar.jsx`

**Acceptance Criteria:**
- [ ] `FloatingScrollButton`：右下角圆形悬浮按钮，内容超过一屏时显示；未到底显示向下箭头，到底则翻转向上；点击平滑滚动
- [ ] `CustomScrollbar`：右侧轨道 + 比例滑块；滑块高度 = 视口/页面总高；拖动滑块快速定位；仅内容超一屏显示
- [ ] 两个组件均为纯客户端组件，不依赖任何外部库

**Verify:** `npm run build` 无报错

**Steps:**

- [ ] **Step 1: 创建 FloatingScrollButton.jsx**

```jsx
import { useState, useEffect, useCallback } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

/**
 * 右下角悬浮一键到底/回顶按钮
 * @param {string} containerId - 滚动容器 ID，默认滚动 window
 */
export default function FloatingScrollButton({ containerId }) {
  const [atBottom, setAtBottom] = useState(false);
  const [visible, setVisible] = useState(false);

  const getScrollEl = useCallback(() => {
    if (containerId) return document.getElementById(containerId);
    return null;
  }, [containerId]);

  const isOverflow = useCallback(() => {
    const el = getScrollEl();
    if (el) return el.scrollHeight > el.clientHeight;
    return document.documentElement.scrollHeight > window.innerHeight;
  }, [getScrollEl]);

  const checkPosition = useCallback(() => {
    if (!isOverflow()) { setVisible(false); return; }
    setVisible(true);
    const el = getScrollEl();
    if (el) {
      setAtBottom(el.scrollTop + el.clientHeight >= el.scrollHeight - 20);
    } else {
      setAtBottom(window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 20);
    }
  }, [isOverflow, getScrollEl]);

  useEffect(() => {
    checkPosition();
    const el = getScrollEl();
    const target = el || window;
    target.addEventListener('scroll', checkPosition, { passive: true });
    window.addEventListener('resize', checkPosition);
    return () => {
      target.removeEventListener('scroll', checkPosition);
      window.removeEventListener('resize', checkPosition);
    };
  }, [checkPosition, getScrollEl]);

  const handleClick = () => {
    const el = getScrollEl();
    if (el) {
      el.scrollTo({ top: atBottom ? 0 : el.scrollHeight, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: atBottom ? 0 : document.documentElement.scrollHeight, behavior: 'smooth' });
    }
  };

  if (!visible) return null;

  return (
    <button
      onClick={handleClick}
      className="fixed right-4 bottom-20 z-40 w-10 h-10 rounded-full bg-white border border-gray-200 shadow-lg flex items-center justify-center text-gray-500 active:bg-gray-100 transition-colors"
      aria-label={atBottom ? '回到顶部' : '滚动到底部'}
    >
      {atBottom ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
    </button>
  );
}
```

- [ ] **Step 2: 创建 CustomScrollbar.jsx**

```jsx
import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * 自定义快速滚动条
 * 替代移动端原生滚动条，显示为右侧轨道 + 比例滑块
 * @param {string} containerId - 滚动容器 ID，默认监听 window
 */
export default function CustomScrollbar({ containerId }) {
  const [thumbH, setThumbH] = useState(40);
  const [thumbTop, setThumbTop] = useState(0);
  const [visible, setVisible] = useState(false);
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef(null);
  const startRef = useRef({ y: 0, top: 0 });

  const getScrollEl = useCallback(() => {
    if (containerId) return document.getElementById(containerId);
    return null;
  }, [containerId]);

  const updateThumb = useCallback(() => {
    const el = getScrollEl();
    const viewH = el ? el.clientHeight : window.innerHeight;
    const totalH = el ? el.scrollHeight : document.documentElement.scrollHeight;
    const scrollT = el ? el.scrollTop : window.scrollY;

    if (totalH <= viewH) { setVisible(false); return; }
    setVisible(true);

    const trackH = viewH - 16; // 轨道可用高度（上下留 8px）
    const th = Math.max(30, (viewH / totalH) * trackH);
    const maxTop = trackH - th;
    const pct = scrollT / (totalH - viewH);
    setThumbH(th);
    setThumbTop(pct * maxTop);
  }, [getScrollEl]);

  useEffect(() => {
    updateThumb();
    const el = getScrollEl();
    const target = el || window;
    target.addEventListener('scroll', updateThumb, { passive: true });
    window.addEventListener('resize', updateThumb);
    return () => {
      target.removeEventListener('scroll', updateThumb);
      window.removeEventListener('resize', updateThumb);
    };
  }, [updateThumb, getScrollEl]);

  const handleStart = (e) => {
    setDragging(true);
    const touch = e.touches ? e.touches[0] : e;
    startRef.current = { y: touch.clientY, top: thumbTop };
    e.preventDefault();
  };

  useEffect(() => {
    if (!dragging) return;
    const handleMove = (e) => {
      const touch = e.touches ? e.touches[0] : e;
      const dy = touch.clientY - startRef.current.y;
      const el = getScrollEl();
      const viewH = el ? el.clientHeight : window.innerHeight;
      const totalH = el ? el.scrollHeight : document.documentElement.scrollHeight;
      const trackH = viewH - 16;
      const maxTop = trackH - thumbH;
      const newTop = Math.max(0, Math.min(maxTop, startRef.current.top + dy));
      const pct = newTop / maxTop;
      const scrollTarget = pct * (totalH - viewH);
      if (el) {
        el.scrollTop = scrollTarget;
      } else {
        window.scrollTo(0, scrollTarget);
      }
    };
    const handleEnd = () => setDragging(false);
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchmove', handleMove, { passive: false });
    document.addEventListener('touchend', handleEnd);
    return () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleMove);
      document.removeEventListener('touchend', handleEnd);
    };
  }, [dragging, thumbH, getScrollEl]);

  if (!visible) return null;

  return (
    <div
      ref={dragRef}
      className="fixed right-0 top-0 h-full w-[10px] z-50 pointer-events-none"
      style={{ touchAction: 'none' }}
    >
      {/* 轨道 */}
      <div className="absolute right-[2px] top-[8px] bottom-[8px] w-[4px] rounded-full bg-[#e2e8f0]" />
      {/* 滑块 */}
      <div
        className="absolute right-0 w-[10px] rounded-full pointer-events-auto cursor-pointer transition-colors duration-150"
        style={{
          top: 8 + thumbTop,
          height: thumbH,
          backgroundColor: dragging ? '#475569' : '#64748b',
        }}
        onMouseDown={handleStart}
        onTouchStart={handleStart}
      />
    </div>
  );
}
```

---

### Task 7: 集成滚动组件到页面中

**Goal:** 在长列表页面（QuotationPage、QuotationNewPage、RecordsPage）的滚动容器中集成 FloatingScrollButton 和 CustomScrollbar

**Files:**
- Modify: `src/pages/QuotationPage.jsx`
- Modify: `src/pages/QuotationNewPage.jsx`
- Modify: `src/pages/RecordsPage.jsx`

**Acceptance Criteria:**
- [ ] 三页均导入并使用 `FloatingScrollButton`
- [ ] 三页均导入并使用 `CustomScrollbar`
- [ ] 组件放在页面 return JSX 末尾，containerId 为空（监听 window 滚动，Layout 中的 `overflow-y-auto flex-1` 容器为实际滚动区）

**注意**：三页的滚动容器为 Layout 组件中的 `<div class="flex-1 overflow-y-auto pb-16">`，需改为有 id 的容器以便组件监听。Layout 改动在子任务中处理。

**Verify:** `npm run build` 无报错；dev 模式下滚动页面查看悬浮按钮和自定义滚动条显示

**Steps:**

- [ ] **Step 1: 修改 Layout.jsx 为滚动容器添加 id**

```jsx
<div id="main-scroll" className="flex-1 overflow-y-auto pb-16">
  <Outlet />
</div>
```

- [ ] **Step 2: QuotationPage 集成滚动组件**

在 `src/pages/QuotationPage.jsx` 顶部添加导入：
```js
import FloatingScrollButton from '../components/FloatingScrollButton';
import CustomScrollbar from '../components/CustomScrollbar';
```

在 return JSX 最外层 `</div>` 前添加：
```jsx
<FloatingScrollButton containerId="main-scroll" />
<CustomScrollbar containerId="main-scroll" />
```

- [ ] **Step 3: QuotationNewPage 集成滚动组件**

同 Step 2 方式，在 QuotationNewPage.jsx 中导入并添加组件。

- [ ] **Step 4: RecordsPage 集成滚动组件**

同 Step 2 方式，在 RecordsPage.jsx 中导入并添加组件。

---

### Task 8: 构建并验证 APK 打包

**Goal:** 运行 `npm run build` 验证前端构建通过，确认 Capacitor Android 同步成功

**Files:**
- (构建产物验证，无文件改动)

**Acceptance Criteria:**
- [ ] `npm run build` 无报错
- [ ] `npx cap sync android` 同步成功
- [ ] dist/ 产物包含所有必需文件

**Verify:** `npm run build` → Build success; `npx cap sync android` → Sync success

**Steps:**

- [ ] **Step 1: 构建前端**

```bash
cd "/d/桌面/报价单可视化app" && npm run build
```

- [ ] **Step 2: 同步 Capacitor Android**

```bash
npx cap sync android
```

- [ ] **Step 3: 检查产物**

```bash
ls dist/ && ls android/
```
