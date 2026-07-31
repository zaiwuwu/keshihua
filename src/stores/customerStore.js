import { create } from 'zustand';
import db from '../db/database';

const useCustomerStore = create((set, get) => ({
  customers: [],

  loadCustomers: async () => {
    const list = await db.customers.toArray();
    set({ customers: list });
  },

  addCustomer: async (customer) => {
    const id = await db.customers.add({
      ...customer,
      createdAt: new Date().toISOString(),
    });
    await get().loadCustomers();
    return id;
  },

  updateCustomer: async (id, changes) => {
    await db.customers.update(id, changes);
    await get().loadCustomers();
  },

  deleteCustomer: async (id) => {
    await db.customers.delete(id);
    await get().loadCustomers();
  },
}));

export default useCustomerStore;
