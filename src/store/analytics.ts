import { create } from "zustand";
import type { Metric, RevenuePoint, ArrPoint, SubscriberPoint, TrialPoint, PlanBreakdown, RetentionCohort } from "@/types/dashboard";
import { getAnalytics, getMetricsHistory, type CollectionAnalytics, type MetricSnapshot } from "@/lib/api";
import { useDashboardStore } from "./dashboard";

interface AnalyticsState {
  overviewMetrics: Metric[];
  revenueTrend: RevenuePoint[];
  arrTrend: ArrPoint[];
  subscriberTrend: SubscriberPoint[];
  trialTrend: TrialPoint[];
  planBreakdown: PlanBreakdown[];
  retentionCohorts: RetentionCohort[];
  loading: boolean;
  error: string | null;

  fetch: () => Promise<void>;
}

function computeChange(current: number, previous: number): { change: number; changeType: "increase" | "decrease" | "neutral" } {
  if (previous === 0 && current === 0) return { change: 0, changeType: "neutral" };
  if (previous === 0) return { change: 100, changeType: "increase" };
  const pct = Math.round(((current - previous) / previous) * 100 * 10) / 10;
  if (pct > 0) return { change: pct, changeType: "increase" };
  if (pct < 0) return { change: Math.abs(pct), changeType: "decrease" };
  return { change: 0, changeType: "neutral" };
}

type TrendData = Pick<MetricSnapshot, "mrr" | "activeSubscriptions" | "customers">;
function buildOverviewMetrics(analytics: CollectionAnalytics, trend: { current: TrendData | null; previous: TrendData | null }): Metric[] {
  const mrrChange = computeChange(trend.current?.mrr ?? 0, trend.previous?.mrr ?? 0);
  const subChange = computeChange(trend.current?.activeSubscriptions ?? 0, trend.previous?.activeSubscriptions ?? 0);
  const custChange = computeChange(trend.current?.customers ?? 0, trend.previous?.customers ?? 0);

  const metrics: Metric[] = [
    { label: "MRR", value: Math.round((analytics.mrr ?? 0) / 100), ...mrrChange, prefix: "₦" },
    { label: "Active Subscribers", value: analytics.stats.activeSubscriptions, ...subChange },
    { label: "Customers", value: analytics.stats.customers, ...custChange },
  ];

  // Extended metrics (full mode)
  metrics.push(
    { label: "ARR", value: Math.round((analytics.arr ?? 0) / 100), ...mrrChange, prefix: "₦" },
    { label: "Active Trials", value: analytics.activeTrials, change: 0, changeType: "neutral" },
    { label: "Churn Rate", value: 0, change: 0, changeType: "neutral", suffix: "%" },
  );

  return metrics;
}

function buildRevenueTrend(history: MetricSnapshot[]): RevenuePoint[] {
  return history
    .slice()
    .reverse()
    .map(s => ({
      date: s.date,
      mrr: Math.round((s.mrr ?? 0) / 100),
    }));
}

function buildArrTrend(history: MetricSnapshot[]): ArrPoint[] {
  return history
    .slice()
    .reverse()
    .map(s => ({
      date: s.date,
      arr: Math.round(((s.mrr ?? 0) * 12) / 100),
    }));
}

function buildSubscriberTrend(history: MetricSnapshot[]): SubscriberPoint[] {
  return history
    .slice()
    .reverse()
    .map(s => ({
      date: s.date,
      active: s.activeSubscriptions,
      churned: s.churnedSubscriptions,
    }));
}

function buildTrialTrend(history: MetricSnapshot[]): TrialPoint[] {
  return history
    .slice()
    .reverse()
    .map(s => ({
      date: s.date,
      trials: s.trialingSubscriptions,
      conversions: 0,
    }));
}

function buildPlanBreakdown(analytics: CollectionAnalytics): PlanBreakdown[] {
  return analytics.planBreakdown.map(p => ({
    planName: p.planName,
    subscribers: p.subscribers,
    mrr: Math.round((p.mrr ?? 0) / 100),
  }));
}

const emptyRetentionCohorts: RetentionCohort[] = [];

export const useAnalyticsStore = create<AnalyticsState>((set) => ({
  overviewMetrics: [],
  revenueTrend: [],
  arrTrend: [],
  subscriberTrend: [],
  trialTrend: [],
  planBreakdown: [],
  retentionCohorts: emptyRetentionCohorts,
  loading: false,
  error: null,

  fetch: async () => {
    const collectionId = useDashboardStore.getState().activeCollectionId;
    if (!collectionId) return;

    set({ loading: true, error: null });
    try {
      const [analytics, history, trend] = await Promise.all([
        getAnalytics(collectionId),
        getMetricsHistory(collectionId, 90),
        getMetricsHistory(collectionId, 2).then(h => ({
          current: h[0] ?? null,
          previous: h[1] ?? null,
        })),
      ]);

      // If no metric snapshots exist yet, use live analytics as current
      // so trend cards show green increase instead of grey neutral
      const effectiveTrend = trend.current
        ? trend
        : {
            current: {
              mrr: analytics.mrr,
              activeSubscriptions: analytics.stats.activeSubscriptions,
              customers: analytics.stats.customers,
              activeTrials: analytics.activeTrials,
            },
            previous: null,
          };

      set({
        overviewMetrics: buildOverviewMetrics(analytics, effectiveTrend),
        revenueTrend: buildRevenueTrend(history),
        arrTrend: buildArrTrend(history),
        subscriberTrend: buildSubscriberTrend(history),
        trialTrend: buildTrialTrend(history),
        planBreakdown: buildPlanBreakdown(analytics),
        retentionCohorts: emptyRetentionCohorts,
        loading: false,
      });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to fetch analytics";
      set({ error: message, loading: false });
    }
  },
}));
