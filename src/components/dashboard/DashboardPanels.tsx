import { useDashboardStore } from "@/store";
import { AnalyticsPanel } from "@/components/dashboard/AnalyticsPanel";
import { EntitlementsPanel } from "@/components/dashboard/EntitlementsPanel";
import { PlansPanel } from "./PlansPanel";
import { ProductsPanel } from "./ProductsPanel";
import { CustomersPanel } from "./CustomersPanel";
import { SettingsPanel } from "./SettingsPanel";
import { ProfilePanel } from "./ProfilePanel";

export function DashboardPanels() {
  const { activeSection, activeSubView, analyticsMode, setAnalyticsMode } = useDashboardStore();

  switch (activeSection) {
    case "analytics":
      return (
        <AnalyticsPanel
          activeSubView={activeSubView}
          mode={analyticsMode}
          onModeChange={setAnalyticsMode}
        />
      );
    case "entitlements":
      return <EntitlementsPanel />;
    case "plans":
      return <PlansPanel />;
    case "products":
      return <ProductsPanel />;
    case "customers":
      return <CustomersPanel />;
    case "settings":
      return <SettingsPanel />;
    case "profile":
      return <ProfilePanel />;
    default:
      return (
        <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
          Coming soon.
        </div>
      );
  }
}
