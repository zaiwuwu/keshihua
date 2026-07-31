import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload } from 'lucide-react';
import { parseExcelFile, mapExcelRows } from '../utils/excelParser';
import useProductStore from '../stores/productStore';

export default function ImportPage() {
  const navigate = useNavigate();
  const { addProducts } = useProductStore();
  const [preview, setPreview] = useState(null);
  const [importing, setImporting] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const rows = await parseExcelFile(file);
    const mapped = mapExcelRows(rows);
    setPreview(mapped);
  };

  const handleImport = async () => {
    if (!preview) return;
    setImporting(true);
    await addProducts(preview);
    setImporting(false);
    navigate('/products');
  };

  return (
    <div className="p-4 pb-20">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => navigate('/quotation')} className="p-1"><ArrowLeft size={22} /></button>
        <h1 className="text-lg font-bold">导入 Excel</h1>
      </div>

      {!preview ? (
        <label className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-400 transition">
          <Upload size={40} className="text-gray-300 mb-3" />
          <p className="text-gray-500 text-sm">点击选择 Excel 文件</p>
          <p className="text-gray-400 text-xs mt-1">支持 .xlsx / .xls</p>
          <input type="file" accept=".xlsx,.xls" onChange={handleFile} className="hidden" />
        </label>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-gray-600">共解析 {preview.length} 条产品数据</p>
            <button
              onClick={() => setPreview(null)}
              className="text-sm text-gray-500"
            >
              重新选择
            </button>
          </div>

          <div className="overflow-x-auto mb-4 rounded-xl border border-gray-200">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50">
                  <th className="p-2 text-left">分类</th>
                  <th className="p-2 text-left">名称</th>
                  <th className="p-2 text-right">容量ml</th>
                  <th className="p-2 text-right">克重g</th>
                  <th className="p-2 text-right">料价</th>
                  <th className="p-2 text-right">出厂价</th>
                </tr>
              </thead>
              <tbody>
                {preview.slice(0, 20).map((r, i) => (
                  <tr key={i} className="border-t border-gray-100">
                    <td className="p-2">{r.category}</td>
                    <td className="p-2">{r.name}</td>
                    <td className="p-2 text-right">{r.capacityMl}</td>
                    <td className="p-2 text-right">{r.weightGrams}</td>
                    <td className="p-2 text-right">{r.materialPrice}</td>
                    <td className="p-2 text-right">{r.factoryPrice}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            onClick={handleImport}
            disabled={importing}
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium text-sm disabled:bg-gray-300"
          >
            {importing ? '导入中...' : `确认导入 ${preview.length} 条产品`}
          </button>
        </div>
      )}
    </div>
  );
}
