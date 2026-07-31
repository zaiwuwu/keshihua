import { create } from 'zustand';
import db from '../db/database';

const useQuotationStore = create((set, get) => ({
  quotations: [],

  loadQuotations: async () => {
    const quotations = await db.quotations.orderBy('createdAt').reverse().toArray();
    set({ quotations });
  },

  saveQuotation: async (quotation) => {
    const record = {
      ...quotation,
      createdAt: new Date().toISOString(),
      status: 'draft',
    };
    const id = await db.quotations.add(record);
    await get().loadQuotations();
    return id;
  },

  getQuotation: async (id) => {
    return await db.quotations.get(id);
  },

  /** 从报价记录构建编辑/复制用的初始状态 */
  buildEditState: (q) => ({
    quotationId: q.id,
    selectedIds: (q.items || []).map(i => i.id),
    quantities: Object.fromEntries((q.items || []).map(i => [i.id, i.quantity])),
    businessInfo: { ...(q.businessInfo || {}) },
    markup: String(q.businessInfo?.markup ?? ''),
    freight: String(q.freight ?? q.businessInfo?.freight ?? ''),
    taxRate: String(q.taxRate ?? q.businessInfo?.taxRate ?? ''),
    preparer: q.businessInfo?.preparer || '',
  }),

  updateQuotation: async (id, data) => {
    await db.quotations.update(id, { ...data, updatedAt: new Date().toISOString() });
    await get().loadQuotations();
  },

  deleteQuotation: async (id) => {
    await db.quotations.delete(id);
    await get().loadQuotations();
  },
}));

export default useQuotationStore;
