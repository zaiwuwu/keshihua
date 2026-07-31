import { create } from 'zustand';
import db from '../db/database';

const useSettingsStore = create((set, get) => ({
  settings: {
    companyName: '',
    logo: '',
    bankInfo: '',
    contactPhone: '',
    address: '',
  },

  loadSettings: async () => {
    const s = await db.settings.get(1);
    if (s) set({ settings: s });
  },

  saveSettings: async (updates) => {
    const existing = await db.settings.get(1);
    if (existing) {
      await db.settings.update(1, updates);
    } else {
      await db.settings.put({ id: 1, ...updates });
    }
    set((state) => ({ settings: { ...state.settings, ...updates } }));
  },
}));

export default useSettingsStore;
