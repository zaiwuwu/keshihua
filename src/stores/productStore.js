import { create } from 'zustand';
import db from '../db/database';

const useProductStore = create((set, get) => ({
  products: [],
  loading: false,

  loadProducts: async () => {
    set({ loading: true });
    const products = await db.products.toArray();
    set({ products, loading: false });
  },

  addProduct: async (product) => {
    const id = await db.products.add({ ...product, updatedAt: new Date().toISOString() });
    await get().loadProducts();
    return id;
  },

  addProducts: async (items) => {
    const now = new Date().toISOString();
    const enriched = items.map(p => ({ ...p, updatedAt: now }));
    const ids = await db.products.bulkAdd(enriched, { allKeys: true });
    await get().loadProducts();
    return ids;
  },

  updateProduct: async (id, changes) => {
    await db.products.update(id, { ...changes, updatedAt: new Date().toISOString() });
    await get().loadProducts();
  },

  deleteProducts: async (ids) => {
    await db.products.bulkDelete(ids);
    await get().loadProducts();
  },

  deleteAllProducts: async () => {
    await db.products.clear();
    set({ products: [] });
  },

  getCategories: () => {
    const cats = new Set(get().products.map(p => p.category).filter(Boolean));
    return [...cats];
  },
}));

export default useProductStore;
