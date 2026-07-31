import { create } from 'zustand';
import db from '../db/database';

const usePriceStore = create((set, get) => ({
  currentPrice: null,
  priceHistory: [],
  pricingMode: 'default', // 'default' | 'custom'

  loadPrice: async () => {
    const all = await db.materialPrice.orderBy('updatedAt').reverse().toArray();
    set({ currentPrice: all[0] || null, priceHistory: all });
  },

  setPrice: async (marketPricePerTon) => {
    const pricePerGram = marketPricePerTon / 1000000;
    const record = {
      marketPricePerTon,
      pricePerGram,
      updatedAt: new Date().toISOString(),
      source: 'manual',
    };
    const id = await db.materialPrice.add(record);
    set({ currentPrice: record });
    await get().loadPrice();
  },

  /** 切换计价模式 */
  setPricingMode: async (mode) => {
    if (mode === get().pricingMode) return;
    set({ pricingMode: mode });

    if (mode === 'custom') {
      // 切换到自定义模式：用当前料价重算所有出厂价
      await get().applyCustomPrices();
    } else {
      // 切换回默认模式：恢复 Excel 原始出厂价
      await get().resetToDefaultPrices();
    }
  },

  /** 自定义核算：用料价重算全部产品出厂价 */
  applyCustomPrices: async () => {
    const { currentPrice } = get();
    if (!currentPrice) return;
    const allProducts = await db.products.toArray();
    for (const p of allProducts) {
      const materialPrice = currentPrice.pricePerGram;
      const factoryPrice = parseFloat((materialPrice * (p.spec || 0) * (p.weightGrams || 0)).toFixed(2));
      const updates = {
        materialPrice,
        factoryPrice,
        updatedAt: new Date().toISOString(),
      };
      // 首次切换时备份原始出厂价，防止丢失 Excel 原始值
      if (p.originalFactoryPrice === undefined) {
        updates.originalFactoryPrice = p.factoryPrice;
      }
      await db.products.update(p.id, updates);
    }
  },

  /** 恢复默认：将出厂价还原为 Excel 原始值 */
  resetToDefaultPrices: async () => {
    const allProducts = await db.products.toArray();
    for (const p of allProducts) {
      // 有原始值则恢复，无原始值则保持当前出厂价不变
      if (p.originalFactoryPrice !== undefined) {
        await db.products.update(p.id, {
          factoryPrice: p.originalFactoryPrice,
          updatedAt: new Date().toISOString(),
        });
      }
    }
  },

  /** 兼容旧版批量更新（默认模式下也更新 originalFactoryPrice） */
  batchUpdateProductPrices: async () => {
    const { currentPrice } = get();
    if (!currentPrice) return;
    const allProducts = await db.products.toArray();
    for (const p of allProducts) {
      const materialPrice = currentPrice.pricePerGram;
      const factoryPrice = parseFloat((materialPrice * (p.spec || 0) * (p.weightGrams || 0)).toFixed(2));
      await db.products.update(p.id, {
        materialPrice,
        factoryPrice,
        updatedAt: new Date().toISOString(),
      });
    }
  },
}));

export default usePriceStore;
