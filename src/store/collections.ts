import { create } from "zustand";
import * as api from "@/lib/api";
import { useDashboardStore } from "./dashboard";

interface CollectionsState {
  collections: api.Collection[];
  loading: boolean;
  error: string | null;

  fetch: () => Promise<void>;
  create: (name: string) => Promise<void>;
}

export const useCollectionsStore = create<CollectionsState>((set) => ({
  collections: [],
  loading: false,
  error: null,

  fetch: async () => {
    set({ loading: true, error: null });
    try {
      const collections = await api.listCollections();
      set({ collections, loading: false });
      // Auto-select first collection if none selected
      const { activeCollectionId } = useDashboardStore.getState();
      if (!activeCollectionId && collections.length > 0) {
        useDashboardStore.getState().setActiveCollection(collections[0].id);
      }
    } catch (e: any) {
      set({ error: e.message, loading: false });
    }
  },

  create: async (name: string) => {
    const result = await api.createCollection(name);
    set((s) => ({ collections: [...s.collections, result.collection] }));
    useDashboardStore.getState().setActiveCollection(result.collection.id);
  },
}));
