import { create } from "zustand";
import * as api from "@/lib/api";
import { useDashboardStore } from "./dashboard";

type ViewMode = "list" | "manage" | "add";

// Local product type — matches mock shape
export interface Product {
  id: string;
  name: string;
  sku: string;
  status: string;
  price: number;
  planId: string;
}

interface ProductsState {
  products: Product[];
  selectedProduct: Product | null;
  activeView: ViewMode;
  loading: boolean;
  error: string | null;

  fetch: (collectionId: string) => Promise<void>;
  select: (product: Product | null) => void;
  create: (collectionId: string, input: api.ProductInput) => Promise<void>;
  openManage: (product: Product) => void;
  openAdd: () => void;
  goBack: () => void;
}

export const useProductsStore = create<ProductsState>((set) => ({
  products: [],
  selectedProduct: null,
  activeView: "list",
  loading: false,
  error: null,

  fetch: async (collectionId) => {
    set({ loading: true, error: null });
    try {
      const products = await api.listProducts(collectionId);
      set({ products: products as any[], loading: false });
    } catch (e: any) {
      set({ error: e.message, loading: false });
    }
  },

  select: (product) => set({ selectedProduct: product }),

  create: async (collectionId, input) => {
    await api.createProduct(collectionId, input);
    const products = await api.listProducts(collectionId);
    set({ products: products as any[], activeView: "list" });
    useDashboardStore.getState().openProductsList();
  },

  openManage: (product) => set({ selectedProduct: product, activeView: "manage" }),
  openAdd: () => set({ activeView: "add", selectedProduct: null }),
  goBack: () => set({ selectedProduct: null, activeView: "list" }),
}));
