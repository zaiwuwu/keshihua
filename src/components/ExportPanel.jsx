import { useState } from 'react';
import { exportToPDF, exportToImage } from '../utils/exporter';

export default function ExportPanel({ previewId, filename }) {
  const name = filename || '报价单';
  const ts = new Date().toLocaleString('zh-CN').replace(/[/:]/g, '-').replace(/\s/g, '_');
  const [exporting, setExporting] = useState(null);

  const handleExportPDF = async () => {
    setExporting('pdf');
    await exportToPDF(previewId, `${ts}_${name}`);
    setExporting(null);
  };

  const handleExportImage = async () => {
    setExporting('image');
    await exportToImage(previewId, `${ts}_${name}`);
    setExporting(null);
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={handleExportPDF}
        disabled={exporting !== null}
        className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-medium text-sm disabled:opacity-60"
      >
        {exporting === 'pdf' ? '生成中...' : '导出 PDF'}
      </button>
      <button
        onClick={handleExportImage}
        disabled={exporting !== null}
        className="flex-1 py-3 bg-green-600 text-white rounded-xl font-medium text-sm disabled:opacity-60"
      >
        {exporting === 'image' ? '生成中...' : '导出长图'}
      </button>
    </div>
  );
}
