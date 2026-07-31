import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Upload, RefreshCw, Calculator, CheckSquare, X, Trash2, Zap, Box } from 'lucide-react';
import useProductStore from '../stores/productStore';
import usePriceStore from '../stores/priceStore';
import SearchBar from '../components/SearchBar';
import CategoryFilter from '../components/CategoryFilter';
import ProductCard from '../components/ProductCard';
import EditProductModal from '../components/EditProductModal';
import AddProductModal from '../components/AddProductModal';
import ImageViewerModal from '../components/ImageViewerModal';
import QuickQuoteModal from '../components/QuickQuoteModal';
import FloatingScrollButton from '../components/FloatingScrollButton';
import CustomScrollbar from '../components/CustomScrollbar';

export default function QuotationPage() {
  const navigate = useNavigate();
  const { products, loading, loadProducts, getCategories, updateProduct, addProduct, deleteProducts, deleteAllProducts } = useProductStore();
  const { currentPrice, pricingMode, loadPrice, setPrice, setPricingMode, batchUpdateProductPrices } = usePriceStore();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [editingProduct, setEditingProduct] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [inputPrice, setInputPrice] = useState('');
  const [updating, setUpdating] = useState(false);
  const [batchMode, setBatchMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [viewingImage, setViewingImage] = useState(null);
  const [showQuickQuote, setShowQuickQuote] = useState(false);

  useEffect(() => { loadProducts(); loadPrice(); }, []);

  const categories = getCategories();
  const filtered = products.filter((p) => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = !category || p.category === category;
    return matchSearch && matchCat;
  });

  const handleSetPrice = async () => {
    const val = parseFloat(inputPrice);
    if (!val || val <= 0) return;
    await setPrice(val);
    setInputPrice('');
  };

  const handleBatchUpdate = async () => {
    if (pricingMode === 'default') {
      alert('当前为默认出厂价模式，无法批量更新。请关闭开关后重试。');
      return;
    }
    setUpdating(true);
    await batchUpdateProductPrices();
    await loadProducts();
    setUpdating(false);
  };

  const handleToggleMode = async () => {
    const newMode = pricingMode === 'default' ? 'custom' : 'default';
    setUpdating(true);
    await setPricingMode(newMode);
    await loadProducts();
    setUpdating(false);
  };

  const toggleSelect = (product) => {
    setSelectedIds((prev) =>
      prev.includes(product.id) ? prev.filter((id) => id !== product.id) : [...prev, product.id]
    );
  };

  const selectAll = () => {
    if (selectedIds.length === filtered.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map((p) => p.id));
    }
  };

  const handleBatchDelete = async () => {
    if (selectedIds.length === 0) return;
    await deleteProducts(selectedIds);
    setSelectedIds([]);
    setBatchMode(false);
  };

  const exitBatchMode = () => {
    setBatchMode(false);
    setSelectedIds([]);
  };

  return (
    <div className="p-4 pb-20">
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-lg font-bold">产品</h1>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/volume')}
            disabled={products.length === 0}
            className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-medium disabled:bg-gray-300"
            style={{ backgroundColor: '#f97316', color: '#ffffff' }}
          >
            <Box size={16} /> 方数计算
          </button>
          <button
            onClick={() => navigate('/quotation/new')}
            disabled={products.length === 0}
            className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium disabled:bg-gray-300"
          >
            <Plus size={16} /> 新建报价单
          </button>
        </div>
      </div>

      {/* Price bar */}
      <div className="bg-blue-50 rounded-xl p-3 mb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calculator size={16} className="text-blue-600" />
            <span className="text-xs text-blue-800">
              每克料价: <strong>{currentPrice ? `¥${currentPrice.pricePerGram}` : '未设置'}</strong>
            </span>
          </div>
          <div className="flex gap-1">
            <input
              type="number"
              value={inputPrice}
              onChange={(e) => setInputPrice(e.target.value)}
              placeholder="均价 元/吨"
              className="w-28 px-2 py-1 text-xs rounded-lg border border-blue-200 outline-none"
            />
            <button onClick={handleSetPrice} className="px-2 py-1 text-xs bg-blue-600 text-white rounded-lg">更新</button>
            <button
              onClick={handleBatchUpdate}
              disabled={!currentPrice || updating}
              className="flex items-center gap-1 px-2 py-1 text-xs bg-green-600 text-white rounded-lg disabled:bg-gray-300"
            >
              <RefreshCw size={12} className={updating ? 'animate-spin' : ''} /> 批量
            </button>
          </div>
        </div>
      </div>

      {/* Pricing mode toggle */}
      <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-xl" style={{ backgroundColor: pricingMode === 'default' ? '#f0fdf4' : '#fef3c7' }}>
        <span className="text-xs font-medium flex-1" style={{ color: '#374151' }}>
          {pricingMode === 'default'
            ? '已开启：使用导入的出厂价报价'
            : '已关闭：按料价计算出厂价'}
        </span>
        <button
          onClick={handleToggleMode}
          disabled={!currentPrice || updating}
          className="relative w-11 h-6 rounded-full transition-colors disabled:opacity-50"
          style={{ backgroundColor: pricingMode === 'default' ? '#16a34a' : '#d1d5db' }}
        >
          <div
            className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform"
            style={{
              transform: pricingMode === 'default' ? 'translateX(22px)' : 'translateX(2px)',
              backgroundColor: '#ffffff',
            }}
          />
        </button>
      </div>

      <div className="space-y-3 mb-3">
        <SearchBar value={search} onChange={setSearch} />
        {categories.length > 0 && (
          <CategoryFilter categories={categories} active={category} onChange={setCategory} />
        )}
      </div>

      {/* Action bar */}
      <div className="flex items-center gap-2 mb-3">
        {!batchMode ? (
          <>
            <button onClick={() => setShowAddModal(true)} className="flex items-center gap-1 px-3 py-1.5 text-xs text-blue-600 bg-blue-50 rounded-lg">
              <Plus size={14} /> 添加产品
            </button>
            <button onClick={() => navigate('/products/import')} className="flex items-center gap-1 px-3 py-1.5 text-xs text-gray-600 bg-gray-100 rounded-lg">
              <Upload size={14} /> 导入Excel
            </button>
            {products.length > 0 && (
              <button onClick={() => setBatchMode(true)} className="flex items-center gap-1 px-3 py-1.5 text-xs text-gray-600 bg-gray-100 rounded-lg">
                <CheckSquare size={14} /> 批量删除
              </button>
            )}
            <span className="text-xs text-gray-400 ml-auto">{products.length} 个产品</span>
          </>
        ) : (
          <div className="flex items-center gap-2 w-full">
            <button onClick={exitBatchMode} className="p-1.5 text-gray-500"><X size={18} /></button>
            <span className="text-xs text-gray-500 flex-1">已选 {selectedIds.length}/{filtered.length}</span>
            <button onClick={selectAll} className="px-2 py-1 text-xs text-blue-600">
              {selectedIds.length === filtered.length ? '取消全选' : '全选'}
            </button>
            <button onClick={handleBatchDelete} disabled={selectedIds.length === 0}
              className="flex items-center gap-1 px-3 py-1.5 text-xs bg-red-600 text-white rounded-lg disabled:bg-gray-200 disabled:text-gray-400">
              <Trash2 size={14} /> 删除选中
            </button>
          </div>
        )}
      </div>

      <div>
        {loading ? (
          <p className="text-center text-gray-400 py-8">加载中...</p>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-4">{products.length === 0 ? '暂无产品，请导入或添加' : '无匹配产品'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
            {filtered.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                showCheckbox={batchMode}
                selected={selectedIds.includes(p.id)}
                onToggle={toggleSelect}
                onEdit={batchMode ? undefined : setEditingProduct}
                onViewImage={batchMode ? undefined : setViewingImage}
              />
            ))}
          </div>
        )}
      </div>

      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          onSave={updateProduct}
          onDelete={async (id) => { await deleteProducts([id]); setEditingProduct(null); }}
          onClose={() => setEditingProduct(null)}
        />
      )}
      {showAddModal && (
        <AddProductModal onSave={addProduct} onClose={() => setShowAddModal(false)} />
      )}
      {viewingImage && (
        <ImageViewerModal image={viewingImage.image} onClose={() => setViewingImage(null)} />
      )}
      {showQuickQuote && (
        <QuickQuoteModal onClose={() => setShowQuickQuote(false)} />
      )}
      <FloatingScrollButton containerId="main-scroll" />
      <CustomScrollbar containerId="main-scroll" />
    </div>
  );
}
