import { create } from 'zustand';
import * as api from '@/lib/api';
import { useDashboardStore } from './dashboard';

interface CustomersState {
  customers: api.CustomerListItem[];
  total: number;
  hasMore: boolean;
  selectedCustomer: api.CustomerListItem | null;
  activeView: 'list' | 'manage';
  loading: boolean;
  error: string | null;

  load: (params?: {
    search?: string;
    limit?: number;
    offset?: number;
  }) => Promise<void>;
  select: (customer: api.CustomerListItem | null) => void;
  openManage: (customer: api.CustomerListItem) => void;
  goBack: () => void;
}

function getCollectionId(): string {
  const id = useDashboardStore.getState().activeCollectionId;
  if (!id) throw new Error('No collection selected');
  return id;
}

export const useCustomersStore = create<CustomersState>((set, _) => ({
  customers: [],
  total: 0,
  hasMore: false,
  selectedCustomer: null,
  activeView: 'list',
  loading: false,
  error: null,

  load: async params => {
    set({ loading: true, error: null });
    try {
      const collectionId = getCollectionId();
      const result = await api.listCustomers(collectionId, params);
      set({
        customers: result.data,
        total: result.total,
        hasMore: result.hasMore,
        loading: false,
      });
    } catch (err) {
      if (err instanceof Error) {
        set({ error: err.message, loading: false });
      } else {
        set({ error: (err as Error).message, loading: false });
      }
    }
  },

  select: customer => set({ selectedCustomer: customer }),
  openManage: customer =>
    set({ selectedCustomer: customer, activeView: 'manage' }),
  goBack: () => set({ selectedCustomer: null, activeView: 'list' }),
}));
