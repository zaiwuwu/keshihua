import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Search, Loader } from 'lucide-react';
import useProductStore from '../stores/productStore';
import usePriceStore from '../stores/priceStore';
import useSettingsStore from '../stores/settingsStore';
import useQuotationStore from '../stores/quotationStore';
import ProductPicker from '../components/ProductPicker';
import BusinessInfoForm from '../components/BusinessInfoForm';
import ExportPanel from '../components/ExportPanel';
import FloatingScrollButton from '../components/FloatingScrollButton';
import CustomScrollbar from '../components/CustomScrollbar';

export default function QuotationNewPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { products, loadProducts } = useProductStore();
  const { currentPrice, loadPrice } = usePriceStore();
  const { settings, loadSettings } = useSettingsStore();
  const { saveQuotation, updateQuotation, getQuotation, buildEditState: storeBuildEdit } = useQuotationStore();

  // 编辑/复制来源：route state（主）或 URL params（回退）
  const routeEditData = location.state?.editData;
  const editId = searchParams.get('edit');
  const copyId = searchParams.get('copy');

  const [editData, setEditData] = useState(routeEditData || null);
  const [loadingRecord, setLoadingRecord] = useState(!!(editId || copyId) && !routeEditData);
  const isEdit = !!(editData?.quotationId);

  const [selectedIds, setSelectedIds] = useState(editData?.selectedIds || []);
  const [quantities, setQuantities] = useState(editData?.quantities || {});
  const [businessInfo, setBusinessInfo] = useState(editData?.businessInfo || {});
  const [profitMargin, setProfitMargin] = useState(15);
  const [markup, setMarkup] = useState(editData?.markup ?? '');
  const [freight, setFreight] = useState(editData?.freight ?? '');
  const [taxRate, setTaxRate] = useState(editData?.taxRate ?? '');
  const [preparer, setPreparer] = useState(editData?.preparer || '');
  const [saved, setSaved] = useState(false);
  const [search, setSearch] = useState('');
  const previewRef = useRef(null);

  // 回退：route state 丢失时从 IndexedDB 加载报价记录
  useEffect(() => {
    if (routeEditData) return;
    const id = editId || copyId;
    if (!id) return;

    (async () => {
      setLoadingRecord(true);
      try {
        const q = await getQuotation(parseInt(id));
        if (q) {
          const state = storeBuildEdit(q);
          if (copyId) delete state.quotationId;
          setEditData(state);
        }
      } catch (e) {
        console.error('加载报价记录失败', e);
      }
      setLoadingRecord(false);
    })();
  }, []);

  // 异步加载完成后同步到各表单字段
  useEffect(() => {
    if (!editData) return;
    setSelectedIds(editData.selectedIds || []);
    setQuantities(editData.quantities || {});
    setBusinessInfo(editData.businessInfo || {});
    setMarkup(editData.markup ?? '');
    setFreight(editData.freight ?? '');
    setTaxRate(editData.taxRate ?? '');
    setPreparer(editData.preparer || '');
  }, [editData]);

  const supplier = {
    companyName: '天津市鑫淼家联塑料制品有限公司',
    contactPhone: '18502674543',
    address: '天津市静海区陈官屯镇吕官屯村村委会南500米',
  };

  useEffect(() => { loadProducts(); loadPrice(); loadSettings(); }, []);

  const preparers = (() => {
    try { return JSON.parse(settings.preparers || '[]'); } catch { return []; }
  })();

  const toggleProduct = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
    if (!quantities[id]) setQuantities((q) => ({ ...q, [id]: 1 }));
  };

  const updateQuantity = (id, val) => {
    setQuantities((q) => ({ ...q, [id]: val }));
  };

  const filteredProducts = search
    ? products.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase())
      )
    : products;

  const selectedProducts = products.filter((p) => selectedIds.includes(p.id));
  const pricePerGram = currentPrice?.pricePerGram || 0;
  const nMarkup = parseFloat(markup) || 0;
  const nFreight = parseFloat(freight) || 0;
  const nTaxRate = parseFloat(taxRate) || 0;

  const items = selectedProducts.map((p) => {
    const qty = quantities[p.id] || 1;
    const factoryPrice = p.factoryPrice || 0;
    const sellPrice = factoryPrice + nMarkup;
    const total = parseFloat((sellPrice * qty).toFixed(2));
    return {
      id: p.id, name: p.name, weightGrams: p.weightGrams, spec: p.spec, boxSize: p.boxSize || '',
      quantity: qty, factoryPrice, markup: nMarkup,
      sellPrice: parseFloat(sellPrice.toFixed(4)), total,
    };
  });
  const grandTotal = items.reduce((s, i) => s + i.total, 0);
  const totalFactory = items.reduce((s, i) => s + i.factoryPrice * i.quantity, 0);
  const totalMarkup = items.reduce((s, i) => s + i.markup * i.quantity, 0);
  const subtotal = grandTotal;
  const taxAmount = parseFloat((subtotal * nTaxRate / 100).toFixed(2));
  const grandTotalWithTax = parseFloat((subtotal + nFreight + taxAmount).toFixed(2));

  const handleSave = async () => {
    const payload = {
      customerInfo: businessInfo.customerName || '',
      items,
      totalAmount: grandTotalWithTax,
      subtotal: parseFloat(subtotal.toFixed(2)),
      freight: nFreight, taxRate: nTaxRate, taxAmount,
      totalFactory: parseFloat(totalFactory.toFixed(2)),
      totalMarkup: parseFloat(totalMarkup.toFixed(2)),
      businessInfo: { ...businessInfo, preparer, markup: nMarkup, freight: nFreight, taxRate: nTaxRate, quoteDate: businessInfo.quoteDate || new Date().toLocaleDateString('zh-CN') },
    };
    if (isEdit) {
      await updateQuotation(editData.quotationId, payload);
    } else {
      await saveQuotation(payload);
    }
    setSaved(true);
  };

  const updateInfo = (key, value) => {
    setBusinessInfo((prev) => ({ ...prev, [key]: value }));
  };

  // Auto-fill preparer and markup from settings (新建时无回填数据才触发)
  useEffect(() => {
    if (editData) return;
    if (settings.personalName && !preparer) {
      setPreparer(settings.personalName);
    }
    setMarkup(settings.defaultMarkup ? String(settings.defaultMarkup) : '');
  }, [settings]);

  return (
    <div className="p-4 pb-20">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => navigate('/quotation')} className="p-1"><ArrowLeft size={22} /></button>
        <h1 className="text-lg font-bold">{isEdit ? '编辑报价单' : '新建报价单'}</h1>
      </div>

      {loadingRecord && (
        <div className="flex items-center justify-center py-12">
          <Loader size={20} className="animate-spin text-blue-600" />
          <span className="ml-2 text-sm text-gray-500">加载报价记录...</span>
        </div>
      )}

      {!currentPrice && !loadingRecord && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-4 text-sm text-yellow-700">
          请先在报价页设置当日聚丙烯市场均价
        </div>
      )}

      {!loadingRecord && (
        <div className="space-y-4">
          {/* Step 1: Select products */}
        <div>
          <h2 className="text-sm font-medium mb-2 text-gray-500">1. 选择产品</h2>
          <div className="relative mb-3">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text" value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索产品..."
              className="w-full pl-9 pr-4 py-2.5 bg-gray-100 rounded-xl text-sm outline-none"
            />
          </div>
          <ProductPicker products={filteredProducts} selectedIds={selectedIds} onToggle={toggleProduct}
            quantities={quantities} onQuantityChange={updateQuantity} />
        </div>

        {selectedProducts.length > 0 && (
          <>
            {/* Step 2: Markup, Freight, Tax & Preparer */}
            <div>
              <h2 className="text-sm font-medium mb-2 text-gray-500">2. 加价/运费/税点 & 制表人</h2>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">每套加价 (元)</label>
                  <input type="number" value={markup} onChange={(e) => setMarkup(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm" min="0" step="0.01" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">运费 (元)</label>
                  <input type="number" value={freight} onChange={(e) => setFreight(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm" min="0" step="0.01" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">税率 (%)</label>
                  <input type="number" value={taxRate} onChange={(e) => setTaxRate(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm" min="0" step="0.1" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">制表人</label>
                  <select value={preparer} onChange={(e) => setPreparer(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white">
                    <option value="">请选择</option>
                    {preparers.map((p, i) => <option key={i} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <p className="text-xs text-gray-400">售价 = 出厂价 + 加价</p>
              {/* Quick summary */}
              <div className="mt-3 grid grid-cols-4 gap-2 text-center text-xs">
                <div className="bg-gray-50 rounded-lg p-2">
                  <div className="text-gray-400">小计</div>
                  <div className="font-bold text-gray-700">¥{subtotal.toFixed(2)}</div>
                </div>
                <div className="bg-yellow-50 rounded-lg p-2">
                  <div className="text-gray-400">运费</div>
                  <div className="font-bold text-yellow-600">¥{nFreight.toFixed(2)}</div>
                </div>
                <div className="bg-orange-50 rounded-lg p-2">
                  <div className="text-gray-400">税额</div>
                  <div className="font-bold text-orange-600">¥{taxAmount.toFixed(2)}</div>
                </div>
                <div className="bg-blue-50 rounded-lg p-2">
                  <div className="text-gray-400">合计</div>
                  <div className="font-bold text-blue-600">¥{grandTotalWithTax.toFixed(2)}</div>
                </div>
              </div>
            </div>

            {/* Step 3: Business Info */}
            <div>
              <h2 className="text-sm font-medium mb-2 text-gray-500">3. 商务信息</h2>
              <BusinessInfoForm info={businessInfo} onChange={updateInfo} />
            </div>

            {/* Step 4: Preview */}
            <div>
              <h2 className="text-sm font-medium mb-2 text-gray-500">4. 报价单预览</h2>
              <div ref={previewRef} id="quotation-preview" className="bg-white rounded-xl border border-gray-200 p-4 text-sm">
                {/* Customer info */}
                {(businessInfo.customerName || businessInfo.contactPerson) && (
                  <div className="mb-3 pb-3 border-b border-gray-100">
                    <div className="text-xs text-gray-500">致客户</div>
                    {businessInfo.customerName && <div className="font-medium mt-1">{businessInfo.customerName}</div>}
                    <div className="flex gap-3 text-xs text-gray-500 mt-0.5">
                      {businessInfo.contactPerson && <span>联系人: {businessInfo.contactPerson}</span>}
                      {businessInfo.customerPhone && <span>电话: {businessInfo.customerPhone}</span>}
                    </div>
                  </div>
                )}

                <div className="border-t border-gray-200 pt-3 mb-3">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>报价日期: {new Date().toLocaleDateString('zh-CN')}</span>
                    <span>报价有效期: 3天</span>
                  </div>
                  {preparer && <div className="text-xs text-gray-500 mt-1">制表人: {preparer}</div>}
                </div>

                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="py-1.5 text-left">产品</th>
                      <th className="py-1.5 text-right">规格/套</th>
                      <th className="py-1.5 text-right">箱规尺寸</th>
                      <th className="py-1.5 text-right">数量</th>
                      <th className="py-1.5 text-right">单价</th>
                      <th className="py-1.5 text-right">总价</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id} className="border-b border-gray-100">
                        <td className="py-1.5">{item.name}</td>
                        <td className="py-1.5 text-right text-xs">{item.spec || '-'}</td>
                        <td className="py-1.5 text-right text-xs">{item.boxSize || '-'}</td>
                        <td className="py-1.5 text-right">{item.quantity}</td>
                        <td className="py-1.5 text-right">¥{item.sellPrice}</td>
                        <td className="py-1.5 text-right font-medium">¥{item.total}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-b border-gray-100">
                      <td colSpan={5} className="py-1.5 text-right text-xs text-gray-500">小计</td>
                      <td className="py-1.5 text-right text-xs">¥{subtotal.toFixed(2)}</td>
                    </tr>
                    {nFreight > 0 && (
                      <tr className="border-b border-gray-100">
                        <td colSpan={5} className="py-1.5 text-right text-xs text-gray-500">运费</td>
                        <td className="py-1.5 text-right text-xs">¥{nFreight.toFixed(2)}</td>
                      </tr>
                    )}
                    {nTaxRate > 0 && (
                      <tr className="border-b border-gray-100">
                        <td colSpan={5} className="py-1.5 text-right text-xs text-gray-500">税额 ({nTaxRate}%)</td>
                        <td className="py-1.5 text-right text-xs">¥{taxAmount.toFixed(2)}</td>
                      </tr>
                    )}
                    <tr>
                      <td colSpan={5} className="py-2 text-right font-medium">合计金额</td>
                      <td className="py-2 text-right font-bold text-blue-600 text-base">¥{grandTotalWithTax.toFixed(2)}</td>
                    </tr>
                  </tfoot>
                </table>

                <div className="border-t border-gray-200 mt-3 pt-3 text-xs text-gray-500 space-y-1">
                  {businessInfo.paymentTerms && <p>付款方式: {businessInfo.paymentTerms}</p>}
                  {businessInfo.remarks && <p>备注: {businessInfo.remarks}</p>}
                </div>

                {/* Supplier info - bottom right (hardcoded) */}
                <div className="border-t border-gray-200 mt-3 pt-3 text-right text-xs text-gray-500">
                  <p className="font-medium text-gray-700">{supplier.companyName}</p>
                  <p>电话: {supplier.contactPhone}</p>
                  <p>地址: {supplier.address}</p>
                </div>

                <div className="border-t border-gray-200 mt-3 pt-2 text-xs text-gray-300 text-center">
                  本报价由九顺生成
                </div>
              </div>

              <div className="flex gap-2 mt-3">
                {!saved ? (
                  <button onClick={handleSave} className="flex-1 py-3 bg-gray-800 text-white rounded-xl font-medium text-sm">
                    保存报价单
                  </button>
                ) : (
                  <p className="flex-1 py-3 text-center text-green-600 text-sm font-medium">已保存</p>
                )}
              </div>
              <div className="mt-2">
                <ExportPanel previewId="quotation-preview" filename={businessInfo.customerName || '报价单'} />
              </div>
            </div>
          </>
        )}
        </div>
      )}
      <FloatingScrollButton containerId="main-scroll" />
      <CustomScrollbar containerId="main-scroll" />
    </div>
  );
}
