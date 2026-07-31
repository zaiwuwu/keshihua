export default function ProductCard({ product, selected, onToggle, showCheckbox, onEdit, onViewImage }) {
  const hasPackDim = product.packLength && product.packWidth && product.packHeight;
  const boxVolume = hasPackDim
    ? ((product.packLength * product.packWidth * product.packHeight) / 1000000).toFixed(4)
    : null;

  return (
    <div
      onClick={() => {
        if (showCheckbox && onToggle) onToggle(product);
        else if (onEdit) onEdit(product);
      }}
      className={`bg-white rounded-xl p-3 border mb-2 transition ${
        selected ? 'border-blue-500 bg-blue-50' : 'border-gray-100'
      } ${showCheckbox || onEdit ? 'cursor-pointer active:bg-gray-50' : ''}`}
    >
      <div className="flex items-start gap-3">
        {showCheckbox && (
          <div
            className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
              selected ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
            }`}
          >
            {selected && <span className="text-white text-xs">✓</span>}
          </div>
        )}
        {/* Product image */}
        {product.image ? (
          <img
            src={product.image}
            alt=""
            className="w-14 h-14 rounded-lg object-cover flex-shrink-0 cursor-pointer active:opacity-80 transition"
            onClick={(e) => {
              e.stopPropagation();
              if (onViewImage) onViewImage(product);
            }}
          />
        ) : (
          <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
            <span className="text-gray-300 text-xl">📦</span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-medium">{product.category}</span>
            <span className="text-xs text-gray-400">{product.capacityMl}ml</span>
            {product.color && <span className="text-xs text-gray-400">· {product.color}</span>}
          </div>
          <h3 className="font-medium text-sm truncate">{product.name}</h3>

          {/* 核心信息：克重 + 箱规 + 包装尺寸 */}
          <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1.5 text-xs">
            <span className="text-gray-700">
              <span className="text-gray-400">克重 </span>
              <strong>{product.weightGrams || '-'}g</strong>
            </span>
            <span className="text-gray-700">
              <span className="text-gray-400">规格 </span>
              <strong>{product.spec || '-'}</strong>
            </span>
            {product.pcsPerBox > 0 && (
              <span className="text-gray-700">
                <span className="text-gray-400">箱规 </span>
                <strong>{product.pcsPerBox}套/箱</strong>
              </span>
            )}
            {hasPackDim ? (
              <span className="text-green-700">
                <span className="text-gray-400">尺寸 </span>
                <strong>{product.packLength}×{product.packWidth}×{product.packHeight}cm</strong>
                <span className="text-green-600 ml-0.5">({boxVolume}方)</span>
              </span>
            ) : (
              <span className="text-gray-400">未填包装尺寸</span>
            )}
          </div>

          {/* 价格信息 弱化 */}
          <div className="flex gap-3 mt-1 text-[10px] text-gray-400">
            <span>料价: ¥{product.materialPrice || '-'}</span>
            <span>出厂价: ¥{product.factoryPrice || '-'}</span>
            {product.boxSize && <span>原箱规: {product.boxSize}</span>}
          </div>
        </div>
        {!showCheckbox && (
          <div className="text-gray-300 text-xs flex-shrink-0">编辑 ›</div>
        )}
      </div>
    </div>
  );
}
