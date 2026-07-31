import { calcItemTotal, calcGrandTotal } from '../utils/priceEngine';

export default function PriceCalculator({ items, pricePerGram }) {
  const computed = items.map((item) => {
    const materialCost = (item.materialPrice || pricePerGram || 0) * (item.weightGrams || 0);
    const total = calcItemTotal(materialCost, item.factoryPrice || 0, item.quantity || 1);
    return { ...item, materialCost: parseFloat(materialCost.toFixed(6)), total };
  });

  const grandTotal = calcGrandTotal(computed);

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
        <h3 className="font-medium text-sm">计价明细</h3>
      </div>
      <div className="divide-y divide-gray-50">
        {computed.map((item) => (
          <div key={item.id} className="px-4 py-2.5 text-xs">
            <div className="flex justify-between">
              <span className="font-medium truncate mr-2">{item.name}</span>
              <span>×{item.quantity}</span>
            </div>
            <div className="flex justify-between text-gray-500 mt-0.5">
              <span>料成本: ¥{item.materialCost} + 出厂: ¥{item.factoryPrice}</span>
              <span className="text-blue-600 font-medium">¥{item.total}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="px-4 py-3 bg-blue-50 flex justify-between font-medium text-sm">
        <span>合计金额</span>
        <span className="text-blue-600 text-base">¥{grandTotal.toFixed(2)}</span>
      </div>
    </div>
  );
}
