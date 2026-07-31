import { useState, useEffect, useRef } from 'react';
import { Search, X, Download, FileText } from 'lucide-react';
import useProductStore from '../stores/productStore';
import { exportToPDF, exportToImage } from '../utils/exporter';

export default function QuickQuoteModal({ onClose }) {
  const { products, loadProducts } = useProductStore();
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [qty, setQty] = useState(1);
  const [markup, setMarkup] = useState('');
  const previewRef = useRef(null);

  useEffect(() => { loadProducts(); }, []);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const product = products.find((p) => p.id === selectedId);
  const nMarkup = parseFloat(markup) || 0;
  const sellPrice = product ? (product.factoryPrice || 0) + nMarkup : 0;
  const total = parseFloat((sellPrice * qty).toFixed(2));

  const previewId = 'quick-quote-preview';

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        {/* 标题栏 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <button onClick={onClose} className="text-gray-500 text-sm">取消</button>
          <h2 className="font-bold text-sm">快速报价</h2>
          <div style={{ width: 40 }} />
        </div>

        <div className="p-4 space-y-3 overflow-y-auto flex-1">
          {/* 搜索产品 */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">搜索产品</label>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text" value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="输入产品名称..."
                className="w-full pl-9 pr-4 py-2.5 bg-gray-100 rounded-xl text-sm outline-none"
              />
            </div>
          </div>

          {/* 产品列表 */}
          <div className="max-h-48 overflow-y-auto">
            {filtered.slice(0, 20).map((p) => (
              <div
                key={p.id}
                onClick={() => { setSelectedId(p.id); setSearch(''); }}
                className={`p-3 rounded-lg mb-1 cursor-pointer transition ${
                  selectedId === p.id ? 'bg-blue-50 border border-blue-300' : 'bg-gray-50 border border-transparent'
                }`}
              >
                <div className="text-sm font-medium">{p.name}</div>
                <div className="text-xs text-gray-400">
                  {p.category} · {p.capacityMl}ml · 出厂价 ¥{p.factoryPrice}
                </div>
              </div>
            ))}
            {filtered.length === 0 && <p className="text-xs text-gray-400 text-center py-4">无匹配产品</p>}
          </div>

          {/* 数量 + 加价 */}
          {product && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">采购数量（套）</label>
                  <input type="number" min="1" value={qty}
                    onChange={(e) => setQty(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">每套加价（元）</label>
                  <input type="number" min="0" step="0.01" value={markup}
                    onChange={(e) => setMarkup(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                </div>
              </div>

              {/* 预览 */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">报价预览</label>
                <div ref={previewRef} id={previewId} className="bg-white border border-gray-200 rounded-lg p-3 text-sm">
                  <div className="text-xs text-gray-400 mb-2">快速报价单</div>
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="py-1 text-left">产品</th><th className="py-1 text-right">数量</th>
                        <th className="py-1 text-right">单价</th><th className="py-1 text-right">总价</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-100">
                        <td className="py-1">{product.name}</td>
                        <td className="py-1 text-right">{qty}</td>
                        <td className="py-1 text-right">¥{sellPrice.toFixed(2)}</td>
                        <td className="py-1 text-right font-medium">¥{total.toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </table>
                  <div className="text-right text-xs text-gray-400 mt-2">
                    出厂价: ¥{product.factoryPrice} + 加价: ¥{nMarkup}
                  </div>
                </div>
              </div>

              {/* 导出按钮 */}
              <div className="flex gap-2">
                <button
                  onClick={() => exportToPDF(previewId, `快速报价_${product.name}`)}
                  className="flex-1 flex items-center justify-center gap-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium"
                >
                  <FileText size={16} /> 导出 PDF
                </button>
                <button
                  onClick={() => exportToImage(previewId, `快速报价_${product.name}`)}
                  className="flex-1 flex items-center justify-center gap-1 py-2.5 bg-green-600 text-white rounded-xl text-sm font-medium"
                >
                  <Download size={16} /> 导出长图
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
