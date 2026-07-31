import { useState } from 'react';
import ImageUpload from './ImageUpload';

const emptyProduct = {
  category: '',
  name: '',
  capacityMl: '',
  spec: '',
  boxSize: '',
  weightGrams: '',
  packLength: '',
  packWidth: '',
  packHeight: '',
  pcsPerBox: '',
  color: '',
  materialPrice: '',
  factoryPrice: '',
};

const fields = [
  { key: 'category', label: '产品分类', type: 'text' },
  { key: 'name', label: '名称', type: 'text' },
  { key: 'capacityMl', label: '容量 (ml)', type: 'number' },
  { key: 'spec', label: '规格/套', type: 'number' },
  { key: 'boxSize', label: '箱规尺寸', type: 'text' },
  { key: 'weightGrams', label: '成套克重 (g)', type: 'number' },
  { key: 'pcsPerBox', label: '每箱套数', type: 'number' },
  { key: 'packLength', label: '包装长度 (cm)', type: 'number' },
  { key: 'packWidth', label: '包装宽度 (cm)', type: 'number' },
  { key: 'packHeight', label: '包装高度 (cm)', type: 'number' },
  { key: 'color', label: '颜色', type: 'text' },
  { key: 'materialPrice', label: '当日料价', type: 'number' },
  { key: 'factoryPrice', label: '出厂价格', type: 'number' },
];

export default function AddProductModal({ onSave, onClose }) {
  const [form, setForm] = useState({ ...emptyProduct });

  const handleChange = (key, value) => {
    setForm((prev) => {
      const updated = { ...prev, [key]: value };
      if (key === 'materialPrice' || key === 'spec' || key === 'weightGrams') {
        const mp = parseFloat(key === 'materialPrice' ? value : updated.materialPrice) || 0;
        const sp = parseFloat(key === 'spec' ? value : updated.spec) || 0;
        const wg = parseFloat(key === 'weightGrams' ? value : updated.weightGrams) || 0;
        updated.factoryPrice = parseFloat((mp * sp * wg).toFixed(2));
      }
      return updated;
    });
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    const fp = parseFloat(form.factoryPrice) || 0;
    onSave({
      ...form,
      capacityMl: parseInt(form.capacityMl) || 0,
      weightGrams: parseFloat(form.weightGrams) || 0,
      packLength: parseFloat(form.packLength) || 0,
      packWidth: parseFloat(form.packWidth) || 0,
      packHeight: parseFloat(form.packHeight) || 0,
      pcsPerBox: parseInt(form.pcsPerBox) || 0,
      materialPrice: parseFloat(form.materialPrice) || 0,
      factoryPrice: fp,
      originalFactoryPrice: fp,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-end sm:items-center justify-center">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-100 flex-shrink-0">
          <button onClick={onClose} className="text-gray-500 text-sm">取消</button>
          <h2 className="font-bold text-sm">新增产品</h2>
          <button onClick={handleSave} className="text-blue-600 font-medium text-sm">保存</button>
        </div>

        <div className="p-4 space-y-3 overflow-y-auto pb-8">
          <ImageUpload
            currentImage={form.image}
            onImageChange={(base64) => setForm((prev) => ({ ...prev, image: base64 }))}
          />
          {fields.map(({ key, label, type }) => (
            <div key={key}>
              <label className="block text-xs text-gray-500 mb-1">{label}</label>
              <input
                type={type}
                value={form[key] ?? ''}
                step={type === 'number' ? 'any' : undefined}
                onChange={(e) => handleChange(key, e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm"
                placeholder={label}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
