import type {
  Metric,
  RevenuePoint,
  SubscriberPoint,
  PlanBreakdown,
  RetentionCohort,
} from "@/types/dashboard"

// TODO: replace with a real endpoint once the backend exposes revenue/MRR,
// not just counts (see getCollectionStats — plans/products/customers/
// activeSubscriptions only, no pricing data yet).

export const overviewMetrics: Metric[] = [
  { label: "MRR", value: 18420, change: 8.2, changeType: "increase", prefix: "$" },
  { label: "Active Subscribers", value: 1284, change: 4.6, changeType: "increase" },
  { label: "Customers", value: 2931, change: 2.1, changeType: "increase" },
]

export const revenueTrend: RevenuePoint[] = [
  { date: "Jan", mrr: 11200 },
  { date: "Feb", mrr: 12850 },
  { date: "Mar", mrr: 13100 },
  { date: "Apr", mrr: 14600 },
  { date: "May", mrr: 15950 },
  { date: "Jun", mrr: 16400 },
  { date: "Jul", mrr: 18420 },
]

export const subscriberTrend: SubscriberPoint[] = [
  { date: "Jan", active: 860, churned: 32 },
  { date: "Feb", active: 940, churned: 28 },
  { date: "Mar", active: 985, churned: 35 },
  { date: "Apr", active: 1080, churned: 24 },
  { date: "May", active: 1150, churned: 30 },
  { date: "Jun", active: 1210, churned: 22 },
  { date: "Jul", active: 1284, churned: 19 },
]

export const planBreakdown: PlanBreakdown[] = [
  { planName: "Starter", subscribers: 612, mrr: 4284 },
  { planName: "Growth", subscribers: 498, mrr: 9960 },
  { planName: "Scale", subscribers: 174, mrr: 4176 },
]

export const retentionCohorts: RetentionCohort[] = [
  { cohort: "Jan 2026", size: 1250, month0: 100, month1: 82, month2: 74, month3: 68 },
  { cohort: "Feb 2026", size: 1420, month0: 100, month1: 85, month2: 77, month3: 71 },
  { cohort: "Mar 2026", size: 1100, month0: 100, month1: 88, month2: 80, month3: 0 },
  { cohort: "Apr 2026", size: 1580, month0: 100, month1: 90, month2: 0, month3: 0 },
];
export const extendedOverviewMetrics: Metric[] = [
  ...overviewMetrics,
  { label: "ARR", value: 145000, change: 15, changeType: "increase", prefix: "$" },
  { label: "Active Trials", value: 1240, change: 8, changeType: "increase" },
  { label: "Realized LTV", value: 450, change: 2, changeType: "increase", prefix: "$" },
  { label: "Churn Rate", value: 3.2, change: 0.5, changeType: "decrease", suffix: "%" },
];

export const arrTrend = [
  { date: "Jan", arr: 120000 },
  { date: "Feb", arr: 125000 },
  { date: "Mar", arr: 132000 },
  { date: "Apr", arr: 145000 },
];

export const trialTrend = [
  { date: "Jan", trials: 800, conversions: 240 },
  { date: "Feb", trials: 950, conversions: 280 },
  { date: "Mar", trials: 1100, conversions: 350 },
  { date: "Apr", trials: 1240, conversions: 410 },
];
