import { create } from "zustand";
import type { Metric } from "@/types/dashboard";

// Mock analytics data — replace with real API calls later
import {
  extendedOverviewMetrics,
  revenueTrend,
  arrTrend,
  subscriberTrend,
  trialTrend,
  planBreakdown,
  retentionCohorts,
} from "@/data/analytics-mock";

interface AnalyticsState {
  overviewMetrics: Metric[];
  revenueTrend: typeof revenueTrend;
  arrTrend: typeof arrTrend;
  subscriberTrend: typeof subscriberTrend;
  trialTrend: typeof trialTrend;
  planBreakdown: typeof planBreakdown;
  retentionCohorts: typeof retentionCohorts;
  loading: boolean;
  error: string | null;

  fetch: () => Promise<void>;
}

export const useAnalyticsStore = create<AnalyticsState>((set) => ({
  overviewMetrics: extendedOverviewMetrics,
  revenueTrend,
  arrTrend,
  subscriberTrend,
  trialTrend,
  planBreakdown,
  retentionCohorts,
  loading: false,
  error: null,

  fetch: async () => {
    set({ loading: true, error: null });
    try {
      // TODO: replace with real API endpoint
      // const data = await api.getAnalytics(collectionId);
      set({
        overviewMetrics: extendedOverviewMetrics,
        revenueTrend,
        arrTrend,
        subscriberTrend,
        trialTrend,
        planBreakdown,
        retentionCohorts,
        loading: false,
      });
    } catch (e: any) {
      set({ error: e.message, loading: false });
    }
  },
}));
