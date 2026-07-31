import { useState } from 'react';
import ImageViewerModal from './ImageViewerModal';

export default function ProductPicker({ products, selectedIds, onToggle, quantities, onQuantityChange }) {
  const [viewingImage, setViewingImage] = useState(null);

  return (
    <div>
      {products.map((p) => {
        const isSelected = selectedIds.includes(p.id);
        const qty = quantities[p.id] || 1;
        return (
          <div
            key={p.id}
            className={`bg-white rounded-xl p-3 border mb-2 transition ${
              isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-100'
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                onClick={() => onToggle(p.id)}
                className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 cursor-pointer ${
                  isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
                }`}
              >
                {isSelected && <span className="text-white text-xs">✓</span>}
              </div>
              {p.image ? (
                <img
                  src={p.image}
                  alt=""
                  className="w-14 h-14 rounded-lg object-cover flex-shrink-0 cursor-pointer active:opacity-80 transition"
                  onClick={(e) => { e.stopPropagation(); setViewingImage(p); }}
                />
              ) : (
                <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-gray-300 text-xl">📦</span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">{p.category}</span>
                  <span className="text-xs text-gray-400">{p.capacityMl}ml</span>
                </div>
                <h3 className="font-medium text-sm truncate">{p.name}</h3>
                <div className="text-xs text-gray-500 mt-0.5">
                  克重: {p.weightGrams}g | 规格: {p.spec || '-'}
                  {p.pcsPerBox > 0 && <span> | {p.pcsPerBox}套/箱</span>}
                  {(p.packLength && p.packWidth && p.packHeight) && (
                    <span> | {p.packLength}×{p.packWidth}×{p.packHeight}cm</span>
                  )}
                </div>
                <div className="text-[10px] text-gray-400 mt-0.5">
                  料价: ¥{p.materialPrice || '-'} | 出厂价: ¥{p.factoryPrice || '-'}
                </div>
                {isSelected && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-gray-500">数量:</span>
                    <input
                      type="number"
                      min="1"
                      value={qty}
                      onChange={(e) => onQuantityChange(p.id, parseInt(e.target.value) || 1)}
                      className="w-20 px-3 py-1 border rounded text-sm"
                    />
                    <span className="text-xs text-gray-400">套</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {viewingImage && (
        <ImageViewerModal image={viewingImage.image} onClose={() => setViewingImage(null)} />
      )}
    </div>
  );
}
