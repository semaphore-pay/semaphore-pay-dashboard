import type { Section, AnalyticsSubView, AnalyticsMode } from "@/types/dashboard";
import { AnalyticsPanel } from "@/components/dashboard/AnalyticsPanel";

interface DashboardPanelsProps {
  activeSection: Section;
  activeSubView: AnalyticsSubView;
  analyticsMode: AnalyticsMode;
  onAnalyticsModeChange: (mode: AnalyticsMode) => void;
}

const sectionLabels: Record<Section, string> = {
  analytics: "Analytics",
  entitlements: "Entitlements",
  plans: "Plans",
  products: "Products",
  customers: "Customers",
};

function ComingSoonPanel({ section }: { section: Section }) {
  return (
    <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
      {sectionLabels[section]} isn't built yet.
    </div>
  );
}

export function DashboardPanels({
  activeSection,
  activeSubView,
  analyticsMode,
  onAnalyticsModeChange,
}: DashboardPanelsProps) {
  if (activeSection === "analytics") {
    return (
      <AnalyticsPanel
        activeSubView={activeSubView}
        mode={analyticsMode}
        onModeChange={onAnalyticsModeChange}
      />
    );
  }

  return <ComingSoonPanel section={activeSection} />;
}
