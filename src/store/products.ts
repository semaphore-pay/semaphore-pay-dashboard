import { create } from 'zustand';
import * as api from '@/lib/api';
import { useDashboardStore } from './dashboard';

type ViewMode = 'list' | 'manage' | 'add';

export interface Product {
  internalId: string;
  id: string;
  name: string;
  group: string;
  isDefault: boolean;
  priceAmount: number | null;
  priceCurrency: string | null;
  priceInterval: string | null;
  version: number;
  createdAt: string;
  updatedAt: string;
  features: Array<{
    featureId: string;
    type: string;
    limit?: number;
    resetInterval?: string;
    config?: Record<string, unknown>;
  }>;
}

interface ProductsState {
  products: Product[];
  selectedProduct: Product | null;
  activeView: ViewMode;
  loading: boolean;
  error: string | null;

  fetch: (collectionId: string) => Promise<void>;
  get: (collectionId: string, productId: string) => Promise<Product | null>;
  select: (product: Product | null) => void;
  create: (collectionId: string, input: api.ProductInput) => Promise<void>;
  update: (
    collectionId: string,
    productId: string,
    input: Partial<api.ProductInput>
  ) => Promise<void>;
  remove: (collectionId: string, productId: string) => Promise<void>;
  openManage: (product: Product) => void;
  openAdd: () => void;
  goBack: () => void;
}

export const useProductsStore = create<ProductsState>(set => ({
  products: [],
  selectedProduct: null,
  activeView: 'list',
  loading: false,
  error: null,

  fetch: async collectionId => {
    set({ loading: true, error: null });
    try {
      const products = await api.listProducts(collectionId);
      set({ products: products as Product[], loading: false });
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },

  get: async (collectionId, productId) => {
    try {
      const product = await api.getProduct(collectionId, productId);
      if (!product) return null;
      return {
        ...product,
        features: product.features.map(f => ({
          ...f,
          limit: f.limit ?? undefined,
        })),
      } as Product;
    } catch {
      return null;
    }
  },

  select: product => set({ selectedProduct: product }),

  create: async (collectionId, input) => {
    await api.createProduct(collectionId, input);
    const products = await api.listProducts(collectionId);
    set({ products: products as Product[], activeView: 'list' });
    useDashboardStore.getState().openProductsList();
  },

  update: async (collectionId, productId, input) => {
    await api.updateProduct(collectionId, productId, input);
    const products = await api.listProducts(collectionId);
    set({ products: products as Product[], activeView: 'list' });
    useDashboardStore.getState().openProductsList();
  },

  remove: async (collectionId, productId) => {
    await api.deleteProduct(collectionId, productId);
    const products = await api.listProducts(collectionId);
    set({ products: products as Product[] });
  },

  openManage: product => {
    set({ selectedProduct: product, activeView: 'manage' });
    useDashboardStore.getState().openProductsManage();
  },
  openAdd: () => {
    set({ activeView: 'add', selectedProduct: null });
    useDashboardStore.getState().openProductsAdd();
  },
  goBack: () => {
    set({ selectedProduct: null, activeView: 'list' });
    useDashboardStore.getState().openProductsList();
  },
}));
