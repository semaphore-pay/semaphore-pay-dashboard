import { create } from "zustand";
import * as api from "@/lib/api";
import { useDashboardStore } from "./dashboard";

type ViewMode = "list" | "manage";

// Local plan type — matches mock shape, not @semaphore-pay/client Plan
export interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  interval: string;
  subscribers: number;
  mrr: number;
  status: string;
  entitlements: string[];
}

interface PlansState {
  plans: Plan[];
  selectedPlan: Plan | null;
  activeView: ViewMode;
  loading: boolean;
  error: string | null;

  fetch: (collectionId: string) => Promise<void>;
  select: (plan: Plan | null) => void;
  create: (collectionId: string, input: api.PlanInput) => Promise<void>;
  openManage: (plan: Plan) => void;
  goBack: () => void;
}

export const usePlansStore = create<PlansState>((set) => ({
  plans: [],
  selectedPlan: null,
  activeView: "list",
  loading: false,
  error: null,

  fetch: async (collectionId) => {
    set({ loading: true, error: null });
    try {
      const plans = await api.listPlans(collectionId);
      set({ plans: plans as any[], loading: false });
    } catch (e: any) {
      set({ error: e.message, loading: false });
    }
  },

  select: (plan) => set({ selectedPlan: plan }),

  create: async (collectionId, input) => {
    await api.createPlan(collectionId, input);
    const plans = await api.listPlans(collectionId);
    set({ plans: plans as any[], activeView: "list" });
    useDashboardStore.getState().openPlansList();
  },

  openManage: (plan) => set({ selectedPlan: plan, activeView: "manage" }),
  goBack: () => set({ selectedPlan: null, activeView: "list" }),
}));
