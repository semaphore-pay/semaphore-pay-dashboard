import { create } from "zustand";
import { useDashboardStore } from "./dashboard";
import { usePlansStore } from "./plans";
import { useProductsStore } from "./products";
import * as api from "@/lib/api";

interface EntitlementsState {
  features: api.Feature[];
  planFeatures: Map<string, api.PlanFeatureConfig[]>; // planId → features
  productFeatures: Map<string, api.ProductFeatureConfig[]>; // productInternalId → features
  selectedFeature: api.Feature | null;
  loading: boolean;
  error: string | null;

  load: () => Promise<void>;
  create: (input: { id: string; name: string; type: "boolean" | "limit" }) => Promise<void>;
  remove: (featureId: string) => Promise<void>;
  attachToPlan: (input: {
    planId: string;
    featureId: string;
    type: "boolean" | "limit";
    limit?: number | null;
    resetInterval?: string | null;
  }) => Promise<void>;
  detachFromPlan: (planId: string, featureId: string) => Promise<void>;
  attachToProduct: (input: {
    productInternalId: string;
    featureId: string;
    type: "boolean" | "limit";
    limit?: number | null;
    resetInterval?: string | null;
  }) => Promise<void>;
  detachFromProduct: (productInternalId: string, featureId: string) => Promise<void>;
  select: (feature: api.Feature | null) => void;
  goBack: () => void;
}

function getCollectionId(): string {
  const id = useDashboardStore.getState().activeCollectionId;
  if (!id) throw new Error("No collection selected");
  return id;
}

export const useEntitlementsStore = create<EntitlementsState>((set, get) => ({
  features: [],
  planFeatures: new Map(),
  productFeatures: new Map(),
  selectedFeature: null,
  loading: false,
  error: null,

  load: async () => {
    set({ loading: true, error: null });
    try {
      const collectionId = getCollectionId();
      const features = await api.listFeatures(collectionId);
      set({ features, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  create: async (input) => {
    const collectionId = getCollectionId();
    await api.createFeature(collectionId, input);
    await get().load();
  },

  remove: async (featureId) => {
    const collectionId = getCollectionId();

    // Auto-detach from all plans
    const plans = usePlansStore.getState().plans;
    for (const plan of plans) {
      if (plan.features?.some((f: any) => f.featureId === featureId)) {
        await api.detachFeatureFromPlan(collectionId, { planId: plan.id, featureId });
      }
    }

    // Auto-detach from all products
    const products = useProductsStore.getState().products;
    for (const product of products) {
      if (product.features?.some((f: any) => f.featureId === featureId)) {
        await api.detachFeatureFromProduct(collectionId, { productInternalId: product.internalId, featureId });
      }
    }

    await api.deleteFeature(collectionId, featureId);
    await get().load();
  },

  attachToPlan: async (input) => {
    const collectionId = getCollectionId();
    await api.attachFeatureToPlan(collectionId, input);
  },

  detachFromPlan: async (planId, featureId) => {
    const collectionId = getCollectionId();
    await api.detachFeatureFromPlan(collectionId, { planId, featureId });
  },

  attachToProduct: async (input) => {
    const collectionId = getCollectionId();
    await api.attachFeatureToProduct(collectionId, input);
  },

  detachFromProduct: async (productInternalId, featureId) => {
    const collectionId = getCollectionId();
    await api.detachFeatureFromProduct(collectionId, { productInternalId, featureId });
  },

  select: (feature) => set({ selectedFeature: feature }),
  goBack: () => set({ selectedFeature: null }),
}));
