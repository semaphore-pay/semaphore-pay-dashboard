import { create } from "zustand";
import type { Metric } from "@/types/dashboard";
import * as api from "@/lib/api";
import { useCollectionsStore } from "@/store";

interface AnalyticsState {
  mrr: number;
  arr: number;
  activeTrials: number;
  subscribersByStatus: Record<string, number>;
  planBreakdown: Array<{
    planId: string;
    planName: string;
    subscribers: number;
    mrr: number;
    interval: string;
  }>;
  overviewMetrics: Metric[];
  revenueTrend: Array<{ date: string; mrr: number }>;
  subscriberTrend: Array<{ date: string; active: number; churned: number }>;
  arrTrend: Array<{ date: string; arr: number }>;
  trialTrend: Array<{ date: string; trials: number; conversions: number }>;
  retentionCohorts: Array<{
    cohort: string;
    size: number;
    month0: number;
    month1: number;
    month2: number;
    month3: number;
  }>;
  loading: boolean;
  error: string | null;

  fetch: () => Promise<void>;
}

export const useAnalyticsStore = create<AnalyticsState>((set, get) => ({
  mrr: 0,
  arr: 0,
  activeTrials: 0,
  subscribersByStatus: {},
  planBreakdown: [],
  overviewMetrics: [],
  revenueTrend: [],
  subscriberTrend: [],
  arrTrend: [],
  trialTrend: [],
  retentionCohorts: [],
  loading: false,
  error: null,

  fetch: async () => {
    set({ loading: true, error: null });
    try {
      const activeCollectionId = useCollectionsStore.getState().activeCollectionId;
      if (!activeCollectionId) {
        set({ loading: false });
        return;
      }

      const data = await api.getAnalytics(activeCollectionId);

      const mrrNaira = Math.round(data.mrr / 100);
      const arrNaira = Math.round(data.arr / 100);

      const overviewMetrics: Metric[] = [
        { label: "MRR", value: mrrNaira, change: 0, changeType: "increase", prefix: "₦" },
        { label: "Active Subscribers", value: data.subscribersByStatus["active"] ?? 0, change: 0, changeType: "increase" },
        { label: "Customers", value: data.stats.customers, change: 0, changeType: "increase" },
        { label: "ARR", value: arrNaira, change: 0, changeType: "increase", prefix: "₦" },
        { label: "Active Trials", value: data.activeTrials, change: 0, changeType: "increase" },
        { label: "Past Due", value: data.subscribersByStatus["past_due"] ?? 0, change: 0, changeType: "decrease" },
      ];

      const planBreakdown = data.planBreakdown.map((p) => ({
        planName: p.planName,
        subscribers: p.subscribers,
        mrr: Math.round(p.mrr / 100),
      }));

      set({
        mrr: mrrNaira,
        arr: arrNaira,
        activeTrials: data.activeTrials,
        subscribersByStatus: data.subscribersByStatus,
        planBreakdown,
        overviewMetrics,
        revenueTrend: [{ date: "Now", mrr: mrrNaira }],
        subscriberTrend: [{ date: "Now", active: data.subscribersByStatus["active"] ?? 0, churned: data.subscribersByStatus["canceled"] ?? 0 }],
        arrTrend: [{ date: "Now", arr: arrNaira }],
        trialTrend: [{ date: "Now", trials: data.activeTrials, conversions: 0 }],
        retentionCohorts: [],
        loading: false,
      });
    } catch (e: any) {
      set({ error: e.message, loading: false });
    }
  },
}));
