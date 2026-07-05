import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import LoginPage from "@/pages/Login";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsAndConditions from "@/pages/TermsAndConditions";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopBar } from "@/components/dashboard/TopBar";
import { ViewTabs } from "@/components/dashboard/ViewTabs";
import { DashboardPanels } from "@/components/dashboard/DashboardPanels";
import type { Section, AnalyticsSubView, AnalyticsMode } from "@/types/dashboard";
import { authClient } from "@/lib/auth-client";

function Dashboard() {
  const [activeSection, setActiveSection] = useState<Section>("analytics");
  const [activeSubView, setActiveSubView] = useState<AnalyticsSubView>("overview");
  const [analyticsMode, setAnalyticsMode] = useState<AnalyticsMode>("basic");

  function handleSectionChange(section: Section) {
    setActiveSection(section);
    setActiveSubView("overview");
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground">
      <Sidebar active={activeSection} onActiveChange={handleSectionChange} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar activeSection={activeSection} />
        <ViewTabs
          activeSection={activeSection}
          activeSubView={activeSubView}
          onSubViewChange={setActiveSubView}
          analyticsMode={analyticsMode}
        />
        <DashboardPanels
          activeSection={activeSection}
          activeSubView={activeSubView}
          analyticsMode={analyticsMode}
          onAnalyticsModeChange={setAnalyticsMode}
        />
      </div>
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <span className="text-muted-foreground">Loading...</span>
      </div>
    );
  }

  if (!session) {
    return <LoginPage />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <Routes>
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<TermsAndConditions />} />
      <Route
        path="*"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
