import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Truck, X, Calculator, Package, AlertCircle } from 'lucide-react';
import useProductStore from '../stores/productStore';

const TRUCK_TIERS = [
  { maxVol: 3, name: '小面包车', vol: '2-3 m³', load: '0.5-1吨', icon: '🚐', color: '#16a34a' },
  { maxVol: 6, name: '中型面包车', vol: '5-7 m³', load: '1-2吨', icon: '🚐', color: '#2563eb' },
  { maxVol: 18, name: '4.2米厢式货车', vol: '15-18 m³', load: '2-5吨', icon: '🚛', color: '#f97316' },
  { maxVol: 38, name: '6.8米厢式货车', vol: '35-40 m³', load: '8-10吨', icon: '🚛', color: '#dc2626' },
  { maxVol: 55, name: '9.6米厢式货车', vol: '50-55 m³', load: '15-18吨', icon: '🚚', color: '#7c3aed' },
  { maxVol: 90, name: '13米半挂车', vol: '80-90 m³', load: '30-33吨', icon: '🚛', color: '#db2777' },
  { maxVol: Infinity, name: '建议分车运输', vol: '> 90 m³', load: '多车配载', icon: '⚠️', color: '#ef4444' },
];

function getTruckRecommendation(totalVol) {
  for (const tier of TRUCK_TIERS) {
    if (totalVol <= tier.maxVol) return tier;
  }
  return TRUCK_TIERS[TRUCK_TIERS.length - 1];
}

export default function VolumePage() {
  const navigate = useNavigate();
  const { products, loadProducts } = useProductStore();
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [boxQuantities, setBoxQuantities] = useState({}); // productId → number of boxes

  useEffect(() => { loadProducts(); }, []);

  const filtered = search
    ? products.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase())
      )
    : products;

  const hasPackDim = (p) => p.packLength && p.packWidth && p.packHeight;

  const toggleProduct = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
    if (!boxQuantities[id]) {
      setBoxQuantities((q) => ({ ...q, [id]: 1 }));
    }
  };

  const updateBoxQty = (id, val) => {
    setBoxQuantities((q) => ({ ...q, [id]: Math.max(1, parseInt(val) || 1) }));
  };

  const removeProduct = (id) => {
    setSelectedIds((prev) => prev.filter((i) => i !== id));
    setBoxQuantities((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const selectedProducts = products.filter((p) => selectedIds.includes(p.id));

  // Calculate volumes
  const items = selectedProducts.map((p) => {
    const boxes = boxQuantities[p.id] || 1;
    const hasDim = hasPackDim(p);
    const singleBoxVol = hasDim
      ? (p.packLength * p.packWidth * p.packHeight) / 1000000
      : 0;
    const totalVol = singleBoxVol * boxes;
    return {
      id: p.id,
      name: p.name,
      category: p.category,
      hasDim,
      dimensions: hasDim ? `${p.packLength}×${p.packWidth}×${p.packHeight}cm` : '未填写',
      pcsPerBox: p.pcsPerBox || 0,
      boxes,
      singleBoxVol,
      totalVol,
    };
  });

  const validItems = items.filter((it) => it.hasDim);
  const skippedItems = items.filter((it) => !it.hasDim);
  const totalVolume = validItems.reduce((s, it) => s + it.totalVol, 0);
  const totalBoxes = validItems.reduce((s, it) => s + it.boxes, 0);
  const totalPcs = validItems.reduce((s, it) => s + it.boxes * (it.pcsPerBox || 0), 0);

  const recommendation = getTruckRecommendation(totalVolume);

  return (
    <div className="p-4 pb-20">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => navigate('/quotation')} className="p-1">
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-lg font-bold">方数计算</h1>
        <span className="text-xs text-gray-400 ml-auto">
          选产品 → 输箱数 → 算方数 → 荐车型
        </span>
      </div>

      {/* Step 1: Search & select products */}
      <div className="mb-4">
        <h2 className="text-sm font-medium mb-2 text-gray-500 flex items-center gap-1">
          <Package size={14} /> 选择产品
        </h2>
        <div className="relative mb-3">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索产品名称或分类..."
            className="w-full pl-9 pr-4 py-2.5 bg-gray-100 rounded-xl text-sm outline-none"
          />
        </div>

        {/* Product selection list */}
        <div className="max-h-64 overflow-y-auto space-y-1">
          {filtered.slice(0, 30).map((p) => {
            const isSelected = selectedIds.includes(p.id);
            const dimOk = hasPackDim(p);
            return (
              <div
                key={p.id}
                onClick={() => toggleProduct(p.id)}
                className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition ${
                  isSelected ? 'bg-blue-50 border border-blue-300' : 'bg-white border border-gray-100'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
                  }`}
                >
                  {isSelected && <span className="text-white text-[10px]">✓</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{p.name}</div>
                  <div className="text-xs text-gray-400">
                    {p.category} · {p.weightGrams || '-'}g · {p.pcsPerBox ? `${p.pcsPerBox}套/箱` : ''}
                    {dimOk
                      ? ` · ${p.packLength}×${p.packWidth}×${p.packHeight}cm`
                      : ' · 未填包装尺寸'}
                  </div>
                </div>
                {!dimOk && (
                  <span className="text-[10px] text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded flex-shrink-0">
                    缺尺寸
                  </span>
                )}
              </div>
            );
          })}
          {filtered.length === 0 && (
            <p className="text-center text-gray-400 text-sm py-6">无匹配产品</p>
          )}
        </div>
      </div>

      {/* Step 2: Selected products → input box quantities */}
      {selectedProducts.length > 0 && (
        <div className="mb-4">
          <h2 className="text-sm font-medium mb-2 text-gray-500 flex items-center gap-1">
            <Calculator size={14} /> 输入箱数
          </h2>
          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={item.id}
                className={`bg-white rounded-xl border p-3 ${
                  item.hasDim ? 'border-gray-200' : 'border-orange-200 bg-orange-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{item.name}</div>
                    <div className="text-xs text-gray-400">
                      {item.dimensions}
                      {item.pcsPerBox > 0 && ` · ${item.pcsPerBox}套/箱`}
                    </div>
                  </div>
                  <button
                    onClick={() => removeProduct(item.id)}
                    className="p-1 text-gray-300 hover:text-red-500 ml-2"
                  >
                    <X size={16} />
                  </button>
                </div>

                {!item.hasDim && (
                  <div className="flex items-center gap-1 text-xs text-orange-600 mb-2">
                    <AlertCircle size={12} />
                    未填写包装尺寸，无法计算方数
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">箱数</span>
                    <input
                      type="number"
                      min="1"
                      value={item.boxes}
                      onChange={(e) => updateBoxQty(item.id, e.target.value)}
                      className="w-20 px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-center"
                    />
                    <span className="text-xs text-gray-400">箱</span>
                  </div>
                  {item.hasDim && (
                    <div className="flex-1 text-right text-xs text-gray-500">
                      <span>单箱 {item.singleBoxVol.toFixed(4)} 方</span>
                      <span className="mx-1">→</span>
                      <span className="font-bold text-blue-600">
                        {item.totalVol.toFixed(3)} 方
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Results & Truck recommendation */}
      {validItems.length > 0 && (
        <div className="space-y-3">
          {/* Volume summary */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h2 className="text-sm font-medium mb-3 text-gray-500 flex items-center gap-1">
              <Truck size={14} /> 计算结果
            </h2>
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="text-xs text-gray-400">总箱数</div>
                <div className="text-lg font-bold text-gray-700">{totalBoxes}</div>
                <div className="text-xs text-gray-400">箱</div>
              </div>
              {totalPcs > 0 && (
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className="text-xs text-gray-400">总套数</div>
                  <div className="text-lg font-bold text-gray-700">{totalPcs.toLocaleString()}</div>
                  <div className="text-xs text-gray-400">套</div>
                </div>
              )}
              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <div className="text-xs text-gray-400">合计方数</div>
                <div className="text-lg font-bold text-blue-600">{totalVolume.toFixed(3)}</div>
                <div className="text-xs text-gray-400">m³</div>
              </div>
            </div>

            {/* Per-product detail */}
            <div className="text-xs text-gray-400 space-y-1 mb-3">
              {validItems.map((it) => (
                <div key={it.id} className="flex justify-between">
                  <span className="truncate flex-1">{it.name}</span>
                  <span className="ml-2 flex-shrink-0">
                    {it.boxes}箱 × {it.singleBoxVol.toFixed(4)}方 = {it.totalVol.toFixed(3)}方
                  </span>
                </div>
              ))}
            </div>

            {skippedItems.length > 0 && (
              <div className="text-xs text-orange-500 mb-3 bg-orange-50 rounded-lg p-2">
                ⚠ 已跳过 {skippedItems.length} 个未填包装尺寸的产品
              </div>
            )}

            {/* Truck recommendation */}
            <div
              className="rounded-xl p-4 text-white"
              style={{ backgroundColor: recommendation.color }}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">{recommendation.icon}</span>
                <div>
                  <div className="font-bold text-base">{recommendation.name}</div>
                  <div className="text-xs opacity-80">
                    容积 {recommendation.vol} · 载重 {recommendation.load}
                  </div>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-white/20 text-xs opacity-80">
                {totalVolume <= 90
                  ? `总方数 ${totalVolume.toFixed(2)} m³，${recommendation.name}可容纳，装载率约 ${((totalVolume / recommendation.maxVol) * 100).toFixed(0)}%`
                  : `总方数 ${totalVolume.toFixed(2)} m³ 超出单车容量，建议拆分为多车运输`}
              </div>
            </div>

            {/* All truck tiers reference */}
            <details className="mt-3">
              <summary className="text-xs text-gray-400 cursor-pointer">查看全部车型参考</summary>
              <div className="mt-2 space-y-1">
                {TRUCK_TIERS.map((t, i) => (
                  <div
                    key={i}
                    className={`flex items-center justify-between text-xs py-1.5 px-2 rounded ${
                      t.name === recommendation.name ? 'bg-gray-100 font-medium' : ''
                    }`}
                  >
                    <span>{t.icon} {t.name}</span>
                    <span className="text-gray-400">{t.vol} · {t.load}</span>
                  </div>
                ))}
              </div>
            </details>
          </div>
        </div>
      )}

      {/* Empty state when nothing selected */}
      {selectedProducts.length === 0 && (
        <div className="text-center py-12">
          <Package size={48} className="text-gray-200 mx-auto mb-4" />
          <p className="text-gray-400 text-sm">请在上方选择需要计算方数的产品</p>
          <p className="text-gray-300 text-xs mt-1">
            产品需填写包装尺寸（长×宽×高 cm）
          </p>
        </div>
      )}
    </div>
  );
}
