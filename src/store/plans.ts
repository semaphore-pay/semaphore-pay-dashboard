import { create } from "zustand";
import * as api from "@/lib/api";
import type { Plan } from "@semaphore-pay/client";
import { useDashboardStore } from "./dashboard";

type ViewMode = "list" | "manage";

export interface PlanWithStats extends Plan {
  subscribers: number;
  mrr: number;
}

interface PlansState {
  plans: PlanWithStats[];
  selectedPlan: PlanWithStats | null;
  activeView: ViewMode;
  loading: boolean;
  error: string | null;

  fetch: (collectionId: string) => Promise<void>;
  select: (plan: PlanWithStats | null) => void;
  create: (collectionId: string, input: api.PlanInput) => Promise<void>;
  deactivate: (collectionId: string, planId: string, cancelRenewals?: boolean) => Promise<void>;
  reactivate: (collectionId: string, planId: string) => Promise<void>;
  remove: (collectionId: string, planId: string) => Promise<void>;
  openManage: (plan: PlanWithStats) => void;
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
      const [rawPlans, analytics] = await Promise.all([
        api.listPlans(collectionId),
        api.getAnalytics(collectionId),
      ]);

      const breakdownMap = new Map(
        analytics.planBreakdown.map((p) => [p.planId, p])
      );

      const plans: PlanWithStats[] = rawPlans.map((plan) => ({
        ...plan,
        subscribers: breakdownMap.get(plan.id)?.subscribers ?? 0,
        mrr: breakdownMap.get(plan.id)?.mrr ?? 0,
      }));

      set({ plans, loading: false });
    } catch (e: any) {
      set({ error: e.message, loading: false });
    }
  },

  select: (plan) => set({ selectedPlan: plan }),

  create: async (collectionId, input) => {
    await api.createPlan(collectionId, input);
    await usePlansStore.getState().fetch(collectionId);
    set({ activeView: "list" });
    useDashboardStore.getState().openPlansList();
  },

  deactivate: async (collectionId, planId, cancelRenewals) => {
    await api.deactivatePlan(collectionId, planId, cancelRenewals);
    set((s) => ({
      plans: s.plans.map((p) => (p.id === planId ? { ...p, isActive: false } : p)),
      selectedPlan: s.selectedPlan?.id === planId ? { ...s.selectedPlan, isActive: false } : s.selectedPlan,
    }));
  },

  reactivate: async (collectionId, planId) => {
    await api.reactivatePlan(collectionId, planId);
    set((s) => ({
      plans: s.plans.map((p) => (p.id === planId ? { ...p, isActive: true } : p)),
      selectedPlan: s.selectedPlan?.id === planId ? { ...s.selectedPlan, isActive: true } : s.selectedPlan,
    }));
  },

  remove: async (collectionId, planId) => {
    await api.deletePlan(collectionId, planId);
    await usePlansStore.getState().fetch(collectionId);
    set({ selectedPlan: null, activeView: "list" });
    useDashboardStore.getState().openPlansList();
  },

  openManage: (plan) => {
    set({ selectedPlan: plan, activeView: "manage" });
    useDashboardStore.getState().openPlansManage();
  },
  goBack: () => {
    set({ selectedPlan: null, activeView: "list" });
    useDashboardStore.getState().openPlansList();
  },
}));
