import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronRight, Database, Trash2, RefreshCw,
  FileText, Upload, Calculator, MessageSquare, AlertCircle,
  Package, FileBarChart, History, Settings2, HardDrive,
} from 'lucide-react';
import useSettingsStore from '../stores/settingsStore';
import useProductStore from '../stores/productStore';
import usePriceStore from '../stores/priceStore';
import useQuotationStore from '../stores/quotationStore';
import db from '../db/database';
import FloatingScrollButton from '../components/FloatingScrollButton';
import CustomScrollbar from '../components/CustomScrollbar';

/* ====== 子组件 ====== */

function TextInput({ value, onChange, placeholder, label }) {
  return (
    <div>
      <label className="block text-xs mb-1" style={{ color: '#6b7280' }}>{label}</label>
      <input
        type="text" value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-lg text-sm"
        style={{ border: '1px solid #e5e7eb', backgroundColor: '#ffffff', color: '#1e293b' }}
        placeholder={placeholder || label}
      />
    </div>
  );
}

/** Section 标题 */
function SectionHeader({ icon: Icon, title, color }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <Icon size={16} style={{ color: color || '#2563eb' }} />
      <span className="text-sm font-medium" style={{ color: '#1e293b' }}>{title}</span>
    </div>
  );
}

/** 点击行 */
function MenuRow({ icon: Icon, label, sub, onClick, color, danger }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 py-3 px-1 border-b border-gray-100 last:border-b-0 active:bg-gray-50 transition-colors text-left"
    >
      <Icon size={17} style={{ color: danger ? '#ef4444' : (color || '#64748b') }} />
      <span className="flex-1 text-sm" style={{ color: danger ? '#ef4444' : '#374151' }}>{label}</span>
      {sub && <span className="text-xs" style={{ color: '#9ca3af' }}>{sub}</span>}
      <ChevronRight size={14} style={{ color: '#d1d5db' }} />
    </button>
  );
}

/** 统计数字卡片 */
function StatCard({ icon: Icon, label, value, unit, color }) {
  return (
    <div className="flex-1 rounded-xl p-3 text-center" style={{ backgroundColor: '#f8fafc' }}>
      <Icon size={18} style={{ color: color || '#2563eb', margin: '0 auto 4px' }} />
      <div className="text-lg font-bold" style={{ color: '#1e293b' }}>{value}</div>
      <div className="text-xs" style={{ color: '#9ca3af' }}>{unit || label}</div>
    </div>
  );
}

/* ====== 主组件 ====== */

export default function ProfilePage() {
  const navigate = useNavigate();
  const { settings, loadSettings, saveSettings } = useSettingsStore();
  const { products, loadProducts } = useProductStore();
  const { currentPrice, pricingMode, setPricingMode, loadPrice } = usePriceStore();
  const { quotations, loadQuotations } = useQuotationStore();

  const [preparers, setPreparers] = useState([]);
  const [newPreparer, setNewPreparer] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [defaultMarkup, setDefaultMarkup] = useState('');
  const [defaultMode, setDefaultMode] = useState('default');
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    loadSettings();
    loadProducts();
    loadPrice();
    loadQuotations();
  }, []);

  useEffect(() => {
    if (settings.preparers) {
      try { setPreparers(JSON.parse(settings.preparers)); } catch { setPreparers([]); }
    }
    if (settings.defaultMarkup) setDefaultMarkup(String(settings.defaultMarkup));
    if (settings.defaultPricingMode) setDefaultMode(settings.defaultPricingMode);
  }, [settings]);

  const updateField = (key, value) => saveSettings({ [key]: value });

  const addPreparer = () => {
    if (!newPreparer.trim()) return;
    const updated = [...preparers, newPreparer.trim()];
    setPreparers(updated);
    saveSettings({ preparers: JSON.stringify(updated) });
    setNewPreparer('');
  };

  const removePreparer = (idx) => {
    const updated = preparers.filter((_, i) => i !== idx);
    setPreparers(updated);
    saveSettings({ preparers: JSON.stringify(updated) });
  };

  const saveDefaultMarkup = () => {
    const val = parseFloat(defaultMarkup) || 0;
    saveSettings({ defaultMarkup: val });
  };

  const saveDefaultMode = async (mode) => {
    setDefaultMode(mode);
    saveSettings({ defaultPricingMode: mode });
    if (pricingMode !== mode) {
      await setPricingMode(mode);
    }
  };

  const handleClearCache = async () => {
    setClearing(true);
    try {
      await db.products.clear();
      await db.quotations.clear();
      await db.materialPrice.clear();
      await loadProducts();
      await loadQuotations();
      await loadPrice();
      setShowClearConfirm(false);
      alert('数据已清除');
    } catch (_) {
      alert('清除失败');
    }
    setClearing(false);
  };

  // 统计数据
  const productCount = products.length;
  const quotationCount = quotations.length;
  const totalAmount = quotations.reduce((s, q) => s + (q.totalAmount || 0), 0);
  const priceRecords = quotations.length;

  return (
    <div className="p-4 pb-20">
      {/* 页面标题 */}
      <h1 className="text-lg font-bold mb-4" style={{ color: '#1e293b' }}>我的</h1>


      {/* ===== 模块2: 业务数据统计 ===== */}
      <div className="rounded-xl border p-4 mb-4" style={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb' }}>
        <SectionHeader icon={FileBarChart} title="数据统计" color="#16a34a" />
        <div className="flex gap-2">
          <StatCard icon={Package} label="产品总数" value={productCount} unit="个" color="#2563eb" />
          <StatCard icon={FileText} label="报价单" value={quotationCount} unit="份" color="#16a34a" />
          <StatCard icon={Calculator} label="累计金额" value={`¥${(totalAmount / 10000).toFixed(1)}`} unit="万元" color="#f97316" />
        </div>
        <div className="flex gap-2 mt-2">
          <div className="flex-1 rounded-lg p-2 text-center" style={{ backgroundColor: '#f8fafc' }}>
            <div className="text-xs" style={{ color: '#9ca3af' }}>当前料价</div>
            <div className="text-sm font-bold" style={{ color: '#2563eb' }}>
              {currentPrice ? `¥${currentPrice.pricePerGram}/克` : '未设置'}
            </div>
          </div>
          <div className="flex-1 rounded-lg p-2 text-center" style={{ backgroundColor: '#f8fafc' }}>
            <div className="text-xs" style={{ color: '#9ca3af' }}>计价模式</div>
            <div className="text-sm font-bold" style={{ color: pricingMode === 'custom' ? '#f97316' : '#16a34a' }}>
              {pricingMode === 'custom' ? '自定义核算' : '默认出厂价'}
            </div>
          </div>
        </div>
      </div>

      {/* ===== 模块3: 常用功能 ===== */}
      <div className="rounded-xl border p-4 mb-4" style={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb' }}>
        <SectionHeader icon={Settings2} title="常用功能" color="#f97316" />
        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: FileText, label: '新建报价', color: '#2563eb', action: () => navigate('/quotation/new') },
            { icon: Upload, label: '导入Excel', color: '#16a34a', action: () => navigate('/products/import') },
            { icon: History, label: '报价记录', color: '#64748b', action: () => navigate('/records') },
            { icon: FileText, label: '消息待办', color: '#f97316', action: () => navigate('/messages') },
            { icon: Calculator, label: '批量更新', color: '#dc2626', action: () => navigate('/quotation') },
            { icon: Database, label: '数据备份', color: '#8b5cf6', action: () => alert('请通过系统分享导出数据') },
          ].map(({ icon: Icon, label, color, action }, i) => (
            <button
              key={i}
              onClick={action}
              className="flex flex-col items-center gap-1 p-3 rounded-xl active:opacity-70 transition-opacity"
              style={{ backgroundColor: '#f8fafc' }}
            >
              <Icon size={20} style={{ color }} />
              <span className="text-xs" style={{ color: '#374151' }}>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ===== 模块4: 业务设置 ===== */}
      <div className="rounded-xl border p-4 mb-4" style={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb' }}>
        <SectionHeader icon={Settings2} title="业务设置" color="#64748b" />

        {/* 默认计价模式 */}
        <div className="flex items-center justify-between py-3 border-b border-gray-100">
          <div>
            <div className="text-sm" style={{ color: '#374151' }}>默认计价模式</div>
            <div className="text-xs" style={{ color: '#9ca3af' }}>新建报价单时默认使用的计价方式</div>
          </div>
          <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid #e5e7eb' }}>
            <button
              onClick={() => saveDefaultMode('default')}
              className="px-3 py-1.5 text-xs font-medium transition-colors"
              style={{
                backgroundColor: defaultMode === 'default' ? '#2563eb' : '#ffffff',
                color: defaultMode === 'default' ? '#ffffff' : '#6b7280',
              }}
            >Excel 原始</button>
            <button
              onClick={() => saveDefaultMode('custom')}
              className="px-3 py-1.5 text-xs font-medium transition-colors"
              style={{
                backgroundColor: defaultMode === 'custom' ? '#f97316' : '#ffffff',
                color: defaultMode === 'custom' ? '#ffffff' : '#6b7280',
              }}
            >自定义核算</button>
          </div>
        </div>

        {/* 默认加价 */}
        <div className="flex items-center justify-between py-3 border-b border-gray-100">
          <div>
            <div className="text-sm" style={{ color: '#374151' }}>默认每套加价（元）</div>
            <div className="text-xs" style={{ color: '#9ca3af' }}>新建报价单自动填充的加价值</div>
          </div>
          <div className="flex items-center gap-1">
            <input
              type="number" step="0.01" min="0"
              value={defaultMarkup}
              onChange={(e) => setDefaultMarkup(e.target.value)}
              onBlur={saveDefaultMarkup}
              className="w-20 px-2 py-1.5 rounded-lg text-sm text-right"
              style={{ border: '1px solid #e5e7eb', color: '#1e293b' }}
            />
            <span className="text-xs" style={{ color: '#9ca3af' }}>元</span>
          </div>
        </div>

        {/* 制表人管理 */}
        <div className="py-3 border-b border-gray-100">
          <div className="text-sm mb-2" style={{ color: '#374151' }}>制表人管理</div>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {preparers.map((p, i) => (
              <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs" style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}>
                {p}
                <button onClick={() => removePreparer(i)} className="hover:opacity-70" style={{ color: '#93c5fd' }}>×</button>
              </span>
            ))}
            {preparers.length === 0 && <span className="text-xs" style={{ color: '#9ca3af' }}>暂无，请添加</span>}
          </div>
          <div className="flex gap-1.5">
            <input
              type="text" value={newPreparer}
              onChange={(e) => setNewPreparer(e.target.value)}
              className="flex-1 px-2.5 py-1.5 rounded-lg text-sm"
              style={{ border: '1px solid #e5e7eb', color: '#1e293b' }}
              placeholder="制表人姓名"
            />
            <button onClick={addPreparer} className="px-3 py-1.5 rounded-lg text-sm font-medium text-white" style={{ backgroundColor: '#2563eb' }}>添加</button>
          </div>
        </div>

        {/* 操作日志 */}
        <MenuRow
          icon={History}
          label="原料价格历史"
          sub={`${usePriceStore.getState().priceHistory.length} 条记录`}
          onClick={() => alert('价格记录功能开发中')}
          color="#64748b"
        />
      </div>

      {/* ===== 模块5: 数据与系统 ===== */}
      <div className="rounded-xl border p-4 mb-4" style={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb' }}>
        <SectionHeader icon={HardDrive} title="数据与系统" color="#8b5cf6" />

        <MenuRow icon={Database} label="数据缓存清理" sub="清除全部产品、报价数据"
          onClick={() => setShowClearConfirm(true)} danger />

        <MenuRow icon={MessageSquare} label="意见反馈" sub="发送邮件反馈"
          onClick={() => alert('请联系：18502674543')} color="#64748b" />

        <MenuRow icon={RefreshCw} label="版本更新" sub="九顺 v1.3.1"
          onClick={() => alert('已是最新版本')} color="#64748b" />
      </div>

      {/* 底部信息 */}
      <div className="text-center pb-4">
        <p className="text-xs" style={{ color: '#9ca3af' }}>九顺 v1.3.1 · 塑料制品专业报价工具</p>
      </div>

      {/* ===== 清除确认弹窗 ===== */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="rounded-xl p-5 mx-4 max-w-sm w-full" style={{ backgroundColor: '#ffffff' }}>
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle size={20} style={{ color: '#ef4444' }} />
              <span className="font-medium" style={{ color: '#1e293b' }}>确认清除数据</span>
            </div>
            <p className="text-sm mb-4" style={{ color: '#6b7280' }}>
              将清除所有产品数据、报价记录和价格历史。此操作不可恢复。建议先导出备份。
            </p>
            <div className="flex gap-2">
              <button onClick={() => setShowClearConfirm(false)} className="flex-1 py-2.5 rounded-lg text-sm font-medium"
                style={{ border: '1px solid #e5e7eb', color: '#374151' }}>取消</button>
              <button onClick={handleClearCache} disabled={clearing}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium text-white"
                style={{ backgroundColor: clearing ? '#fca5a5' : '#ef4444' }}>
                {clearing ? '清除中...' : '确认清除'}
              </button>
            </div>
          </div>
        </div>
      )}

      <FloatingScrollButton containerId="main-scroll" />
      <CustomScrollbar containerId="main-scroll" />
    </div>
  );
}
