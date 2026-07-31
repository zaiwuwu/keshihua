import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

// ===== 工具 =====
function _download(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.download = filename; a.href = url;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** 带超时的 html2canvas */
async function _capture(el, timeoutMs = 15000) {
  return await Promise.race([
    html2canvas(el, { scale: 2, useCORS: true, backgroundColor: '#ffffff', logging: false }),
    new Promise((_, reject) => setTimeout(() => reject(new Error('渲染超时')), timeoutMs)),
  ]);
}

// ===== 原生（仅 APK，3 秒超时）=====
let _ExportNative = null;
async function _nativeExport(type, filename) {
  if (!window.Capacitor?.isNative) throw new Error('非原生');
  if (!_ExportNative) {
    const { registerPlugin } = await import('@capacitor/core');
    _ExportNative = registerPlugin('ExportNative');
  }
  return await Promise.race([
    type === 'image' ? _ExportNative.exportImage({ filename, scale: 2 }) : _ExportNative.exportPDF({ filename, scale: 2 }),
    new Promise((_, reject) => setTimeout(() => reject(new Error('原生超时')), 3000)),
  ]);
}

// ===== 导出长图 =====
export async function exportToImage(elementId, options = {}) {
  const el = document.getElementById(elementId);
  if (!el) { alert('未找到内容'); return false; }
  const filename = `${options.filename || '报价单'}.png`;

  try { await _nativeExport('image', filename); return true; } catch (_) {}

  try {
    const canvas = await _capture(el);
    const blob = await new Promise(r => canvas.toBlob(r, 'image/png'));
    _download(blob, filename);
    return true;
  } catch (e) {
    alert('长图失败: ' + e.message);
    return false;
  }
}

// ===== 导出 PDF =====
export async function exportToPDF(elementId, options = {}) {
  const el = document.getElementById(elementId);
  if (!el) { alert('未找到内容'); return false; }
  const filename = `${options.filename || '报价单'}.pdf`;

  try { await _nativeExport('pdf', filename); return true; } catch (_) {}

  try {
    const canvas = await _capture(el);
    const data = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pw = 210, ph = 297, mg = 6, iw = pw - mg * 2;
    const ih = (canvas.height * iw) / canvas.width, mh = ph - mg * 2;

    if (ih <= mh) {
      pdf.addImage(data, 'PNG', mg, mg, iw, ih);
    } else {
      const ppm = canvas.width / iw, sp = mh * ppm;
      let y = 0;
      while (y < canvas.height) {
        const hh = Math.min(sp, canvas.height - y);
        const sc = document.createElement('canvas'); sc.width = canvas.width; sc.height = hh;
        const dc = sc.getContext('2d');
        dc.fillStyle = '#ffffff'; dc.fillRect(0, 0, sc.width, sc.height);
        dc.drawImage(canvas, 0, y, canvas.width, hh, 0, 0, canvas.width, hh);
        if (y > 0) pdf.addPage();
        pdf.addImage(sc.toDataURL('image/png'), 'PNG', mg, mg, iw, hh / ppm);
        y += sp;
      }
    }
    _download(pdf.output('blob'), filename);
    return true;
  } catch (e) {
    alert('PDF失败: ' + e.message);
    return false;
  }
}
