import { create } from "zustand";
import * as api from "@/lib/api";
import { useDashboardStore } from "./dashboard";

type ViewMode = "list" | "manage" | "add";

// Local customer type — matches mock shape
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  ipAddress: string;
  status: string;
  mrr: number;
  joined: string;
}

interface CustomersState {
  customers: Customer[];
  selectedCustomer: Customer | null;
  activeView: ViewMode;
  loading: boolean;
  error: string | null;

  upsert: (collectionId: string, input: api.CustomerInput) => Promise<void>;
  select: (customer: Customer | null) => void;
  openManage: (customer: Customer) => void;
  openAdd: () => void;
  goBack: () => void;
}

export const useCustomersStore = create<CustomersState>((set) => ({
  customers: [],
  selectedCustomer: null,
  activeView: "list",
  loading: false,
  error: null,

  upsert: async (collectionId, input) => {
    const customer = await api.upsertCustomer(collectionId, input);
    set((s) => ({
      customers: [...s.customers.filter((c) => c.id !== customer.id), customer as any],
      activeView: "list",
    }));
    useDashboardStore.getState().openCustomersList();
  },

  select: (customer) => set({ selectedCustomer: customer }),
  openManage: (customer) => set({ selectedCustomer: customer, activeView: "manage" }),
  openAdd: () => set({ activeView: "add", selectedCustomer: null }),
  goBack: () => set({ selectedCustomer: null, activeView: "list" }),
}));
