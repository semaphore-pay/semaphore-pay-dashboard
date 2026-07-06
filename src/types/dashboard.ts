// --- Navigation ---------------------------------------------------------

export type Section =
  | 'analytics'
  | 'entitlements'
  | 'plans'
  | 'products'
  | 'customers'
  | 'settings'
  | 'profile';

export type AnalyticsSubView =
  | 'overview'
  | 'revenue'
  | 'subscribers'
  | 'retention';

export type AnalyticsMode = 'basic' | 'full';

export type Environment = 'sandbox' | 'production';

// --- Analytics data shapes -----------------------------------------------

export interface Metric {
  label: string;
  value: number;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  prefix?: string;
  suffix?: string;
}

export interface RevenuePoint {
  date: string;
  mrr: number;
}

export interface ArrPoint {
  date: string;
  arr: number;
}

export interface SubscriberPoint {
  date: string;
  active: number;
  churned: number;
}

export interface TrialPoint {
  date: string;
  trials: number;
  conversions: number;
}

export interface PlanBreakdown {
  planName: string;
  subscribers: number;
  mrr: number;
}

export interface RetentionCohort {
  cohort: string;
  size: number;
  month0: number;
  month1: number;
  month2: number;
  month3: number;
}

// --- Legacy task-app types ------------------------------------------------
// Still used by OverviewPanel / KanbanPanel / ListPanel / PlaceholderPanels,
// which are now orphaned from navigation but not yet deleted. Remove these
// once all five Sections have real panels and those files are deleted.

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'backlog' | 'todo' | 'in-progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignee: string;
  dueDate: string;
  tags: string[];
  project: string;
}

export interface Activity {
  id: string;
  user: string;
  userAvatar: string;
  action: string;
  target: string;
  timestamp: string;
}

export interface Project {
  id: string;
  name: string;
  color: string;
  taskCount: number;
  completedCount: number;
}

export interface ChartDataPoint {
  name: string;
  completed: number;
  created: number;
}

export type ViewType =
  | 'overview'
  | 'kanban'
  | 'list'
  | 'calendar'
  | 'table'
  | 'folders'
  | 'timeline';

export type ViewMode = 'board' | 'split';
