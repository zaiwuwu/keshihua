import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Trash2, Edit3, Copy } from 'lucide-react';
import useQuotationStore from '../stores/quotationStore';
import FloatingScrollButton from '../components/FloatingScrollButton';
import CustomScrollbar from '../components/CustomScrollbar';

export default function RecordsPage() {
  const navigate = useNavigate();
  const { quotations, loadQuotations, deleteQuotation, buildEditState } = useQuotationStore();
  const [expanded, setExpanded] = useState(null);

  useEffect(() => { loadQuotations(); }, []);

  const handleDelete = async (id) => {
    if (confirm('确定删除该报价记录？')) await deleteQuotation(id);
  };

  const handleEdit = (q) => {
    const editData = buildEditState(q);
    navigate(`/quotation/new?edit=${q.id}`, { state: { editData } });
  };

  const handleCopy = (q) => {
    const state = buildEditState(q);
    delete state.quotationId;
    navigate(`/quotation/new?copy=${q.id}`, { state: { editData: state } });
  };

  return (
    <div className="p-4 pb-20">
      <h1 className="text-lg font-bold mb-4">报价记录</h1>

      {quotations.length === 0 ? (
        <div className="text-center py-16">
          <FileText size={48} className="text-gray-200 mx-auto mb-4" />
          <p className="text-gray-400">暂无报价记录</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
          {quotations.map((q) => (
            <div key={q.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="p-3" onClick={() => setExpanded(expanded === q.id ? null : q.id)}>
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {q.businessInfo?.companyName || q.customerInfo || '报价单'}
                    </p>
                    <div className="flex gap-3 mt-1 text-xs text-gray-400">
                      <span>{new Date(q.createdAt).toLocaleString('zh-CN')}</span>
                      {q.businessInfo?.preparer && <span>制表: {q.businessInfo.preparer}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    <span className="text-blue-600 font-bold text-sm">¥{q.totalAmount?.toFixed(2) || '0.00'}</span>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(q.id); }} className="text-gray-300 hover:text-red-500">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                {q.businessInfo?.markup !== undefined && (
                  <div className="mt-1 text-xs text-green-600">
                    每套加价: ¥{q.businessInfo.markup}
                  </div>
                )}
              </div>
              {expanded === q.id && q.items && (
                <div className="border-t border-gray-100 px-3 py-2 bg-gray-50 text-xs">
                  {q.items.map((item, i) => (
                    <div key={i} className="flex justify-between py-1">
                      <span>{item.name} × {item.quantity}</span>
                      <span>¥{item.total?.toFixed(2)}</span>
                    </div>
                  ))}
                  {/* 操作按钮 */}
                  <div className="flex gap-2 mt-2 pt-2 border-t border-gray-200">
                    <button
                      onClick={() => handleEdit(q)}
                      className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-medium"
                      style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}
                    >
                      <Edit3 size={14} /> 编辑
                    </button>
                    <button
                      onClick={() => handleCopy(q)}
                      className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-medium"
                      style={{ backgroundColor: '#f0fdf4', color: '#16a34a' }}
                    >
                      <Copy size={14} /> 复制
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      <FloatingScrollButton containerId="main-scroll" />
      <CustomScrollbar containerId="main-scroll" />
    </div>
  );
}
