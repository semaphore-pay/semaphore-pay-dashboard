import { create } from "zustand";
import * as api from "@/lib/api";
import { useDashboardStore } from "./dashboard";

interface CollectionsState {
  collections: api.Collection[];
  loading: boolean;
  error: string | null;

  fetch: () => Promise<void>;
  create: (name: string, environment?: "sandbox" | "production") => Promise<api.Collection>;
  ensureSandbox: () => Promise<api.Collection>;
}

export const useCollectionsStore = create<CollectionsState>((set, get) => ({
  collections: [],
  loading: false,
  error: null,

  fetch: async () => {
    const { collections: currentCollections, loading } = get();
    if (loading) return;

    const { environment } = useDashboardStore.getState();

    // Quick check: if we already have a Sandbox in current env, skip API call
    if (environment === "sandbox") {
      const hasSandbox = currentCollections.some(
        (c) => c.name === "Sandbox" && c.environment === "sandbox"
      );
      if (hasSandbox) return;
    }

    set({ loading: true, error: null });
    try {
      const collections = await api.listCollections();
      set({ collections, loading: false });

      const filtered = collections.filter((c) => c.environment === environment);

      if (filtered.length === 0 && environment === "sandbox") {
        const existing = collections.find((c) => c.name === "Sandbox" && c.environment === "sandbox");
        if (!existing) {
          const sandbox = await get().create("Sandbox", "sandbox");
          useDashboardStore.getState().setActiveCollection(sandbox.id);
        } else {
          useDashboardStore.getState().setActiveCollection(existing.id);
        }
      } else if (filtered.length > 0) {
        const { activeCollectionId } = useDashboardStore.getState();
        const exists = filtered.some((c) => c.id === activeCollectionId);
        if (!exists) {
          useDashboardStore.getState().setActiveCollection(filtered[0].id);
        }
      }
    } catch (e: any) {
      set({ error: e.message, loading: false });
    }
  },

  create: async (name: string, environment: "sandbox" | "production" = "sandbox") => {
    const result = await api.createCollection(name, environment);
    set((s) => ({ collections: [...s.collections, result.collection] }));
    useDashboardStore.getState().setActiveCollection(result.collection.id);
    return result.collection;
  },

  ensureSandbox: async () => {
    const { collections } = get();
    const existing = collections.find((c) => c.name === "Sandbox" && c.environment === "sandbox");
    if (existing) return existing;
    return await get().create("Sandbox", "sandbox");
  },
}));
