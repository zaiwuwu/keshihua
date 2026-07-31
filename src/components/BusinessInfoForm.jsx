import { useEffect } from 'react';
import useCustomerStore from '../stores/customerStore';

const fields = [
  { key: 'customerName', label: '客户名称', type: 'text' },
  { key: 'contactPerson', label: '联系人', type: 'text' },
  { key: 'customerPhone', label: '客户电话', type: 'tel' },
  { key: 'paymentTerms', label: '付款方式', type: 'text' },
];

const remarkOptions = [
  '此报价不含税点和运费',
  '此报价包含税点不含运费',
  '此报价包含运费不含税点',
];

export default function BusinessInfoForm({ info, onChange }) {
  const { customers, loadCustomers, addCustomer } = useCustomerStore();

  useEffect(() => { loadCustomers(); }, []);

  // 选中已有客户 → 自动填充
  const handleSelectCustomer = (e) => {
    const name = e.target.value;
    if (!name) return;
    const c = customers.find((x) => x.customerName === name);
    if (c) {
      fields.forEach(({ key }) => onChange(key, c[key] || ''));
    }
  };

  // 保存为新客户
  const handleSaveCustomer = () => {
    if (!info.customerName?.trim()) { alert('请先填写客户名称'); return; }
    addCustomer({
      customerName: info.customerName || '',
      contactPerson: info.contactPerson || '',
      customerPhone: info.customerPhone || '',
      paymentTerms: info.paymentTerms || '',
      remarks: info.remarks || '',
    });
    alert('客户已保存');
  };

  return (
    <div className="space-y-3">
      {/* 选择已存客户下拉框 */}
      <div>
        <label className="block text-xs mb-1" style={{ color: '#6b7280' }}>选择已存客户</label>
        <select
          onChange={handleSelectCustomer}
          defaultValue=""
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
          style={{ color: '#1e293b' }}
        >
          <option value="">{customers.length === 0 ? '暂无已存客户' : '-- 选择客户 --'}</option>
          {customers.map((c) => (
            <option key={c.id} value={c.customerName}>{c.customerName}{c.contactPerson ? ` (${c.contactPerson})` : ''}</option>
          ))}
        </select>
      </div>

      {/* 商务信息字段 */}
      {fields.map(({ key, label, type }) => (
        <div key={key}>
          <label className="block text-xs text-gray-500 mb-1">{label}</label>
          <input
            type={type}
            value={info[key] || ''}
            onChange={(e) => onChange(key, e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
            placeholder={`请输入${label}`}
          />
        </div>
      ))}

      {/* 备注：下拉选择 + 自定义输入 */}
      <div>
        <label className="block text-xs text-gray-500 mb-1">备注</label>
        <div className="flex gap-2">
          <select
            value={remarkOptions.includes(info.remarks) ? info.remarks : '__custom__'}
            onChange={(e) => {
              if (e.target.value === '__custom__') {
                onChange('remarks', '');
              } else {
                onChange('remarks', e.target.value);
              }
            }}
            className="flex-shrink-0 px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
            style={{ color: '#1e293b', minWidth: '120px' }}
          >
            <option value="">预设</option>
            {remarkOptions.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          <input
            type="text"
            value={remarkOptions.includes(info.remarks) ? '' : (info.remarks || '')}
            onChange={(e) => onChange('remarks', e.target.value)}
            placeholder="或自定义填写..."
            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
          />
        </div>
      </div>

      {/* 保存为客户按钮 */}
      <button
        onClick={handleSaveCustomer}
        className="w-full py-2 rounded-lg text-sm font-medium border"
        style={{ color: '#2563eb', borderColor: '#2563eb', backgroundColor: '#ffffff' }}
      >
        保存为客户
      </button>
    </div>
  );
}
