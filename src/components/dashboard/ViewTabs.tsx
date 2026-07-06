import {
  LayoutGrid,
  DollarSign,
  Users,
  RefreshCcw,
  type LucideIcon,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Section, AnalyticsSubView, AnalyticsMode } from "@/types/dashboard";

interface ViewTabItem {
  value: string;
  label: string;
  icon: LucideIcon;
}

const sectionViews: Record<Section, ViewTabItem[]> = {
  analytics: [
    { value: "overview", label: "Overview", icon: LayoutGrid },
    { value: "revenue", label: "Revenue", icon: DollarSign },
    { value: "subscribers", label: "Subscribers", icon: Users },
    { value: "retention", label: "Retention", icon: RefreshCcw },
  ],
  entitlements: [{ value: "overview", label: "Overview", icon: LayoutGrid }],
  plans: [{ value: "overview", label: "Overview", icon: LayoutGrid }],
  products: [{ value: "overview", label: "Overview", icon: LayoutGrid }],
  customers: [{ value: "overview", label: "Overview", icon: LayoutGrid }],
  settings: [{ value: "overview", label: "Overview", icon: LayoutGrid }],
  profile: [{ value: "overview", label: "Overview", icon: LayoutGrid }],
};

interface ViewTabsProps {
  activeSection: Section;
  activeSubView: AnalyticsSubView;
  onSubViewChange: (view: AnalyticsSubView) => void;
  analyticsMode: AnalyticsMode;
  actions?: React.ReactNode;
}

export function ViewTabs({
  activeSection,
  activeSubView,
  onSubViewChange,
  analyticsMode,
  actions,
}: ViewTabsProps) {
  const isBasicAnalytics = activeSection === "analytics" && analyticsMode === "basic";
  const views = isBasicAnalytics
    ? sectionViews.analytics.filter(v => v.value === "overview")
    : sectionViews[activeSection];

  return (
    <div className="flex h-10 shrink-0 items-center justify-between border-b border-border px-4 bg-background">
      <Tabs
        value={activeSubView}
        onValueChange={v => onSubViewChange(v as AnalyticsSubView)}
      >
        <TabsList className="h-auto gap-1 rounded-none bg-transparent p-0">
          {views.map(({ value, label, icon: Icon }) => (
            <TabsTrigger
              key={value}
              value={value}
              className="gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground data-[state=active]:rounded-none data-[state=active]:border-b-2 data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none"
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Render the passed-in buttons on the right */}
      {actions && (
        <div className="flex items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  );
}