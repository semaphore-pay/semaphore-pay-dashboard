import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Download, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LoginPage from '@/pages/Login';
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import TermsAndConditions from '@/pages/TermsAndConditions';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { TopBar } from '@/components/dashboard/TopBar';
import { ViewTabs } from '@/components/dashboard/ViewTabs';
import { DashboardPanels } from '@/components/dashboard/DashboardPanels';
import { useDashboardStore, useAuthStore } from '@/store';
import { authClient } from '@/lib/auth-client';
import type { Section } from '@/types/dashboard';

function TabActions({ section }: { section: Section }) {
  const store = useDashboardStore();

  switch (section) {
    case 'analytics':
      return (
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:bg-muted cursor-pointer"
        >
          <Download className="h-3.5 w-3.5" />
          Export
        </button>
      );
    case 'entitlements':
      return (
        <Button
          size="sm"
          className="h-7 gap-1.5 text-xs cursor-pointer"
          onClick={() => store.openEntitlementsAdd()}
        >
          <Plus className="h-3.5 w-3.5" />
          New Feature
        </Button>
      );
    case 'plans':
      return (
        <Button
          size="sm"
          className="h-7 gap-1.5 text-xs cursor-pointer"
          onClick={() => store.openPlansAdd()}
        >
          <Plus className="h-3.5 w-3.5" />
          New Plan
        </Button>
      );
    case 'products':
      return (
        <>
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:bg-muted cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </button>
          <Button
            size="sm"
            className="h-7 gap-1.5 text-xs cursor-pointer"
            onClick={() => store.openProductsAdd()}
          >
            <Plus className="h-3.5 w-3.5" />
            New Product
          </Button>
        </>
      );
    case 'customers':
      return null;
    default:
      return null;
  }
}

function Dashboard() {
  const { activeSection, activeSubView, analyticsMode, setSubView } = useDashboardStore();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden min-h-0">
        <TopBar />
        <ViewTabs
          activeSection={activeSection}
          activeSubView={activeSubView}
          onSubViewChange={setSubView}
          analyticsMode={analyticsMode}
          actions={<TabActions section={activeSection} />}
        />
        <DashboardPanels />
      </div>
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = authClient.useSession();
  const { setAuth, clearAuth, setPending } = useAuthStore();

  useEffect(() => {
    if (isPending) {
      setPending(true);
      return;
    }
    if (session?.user) {
      setAuth(
        {
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
          image: session.user.image,
          role: (session.user as any).role ?? 'buyer',
          phoneNumber: (session.user as any).phoneNumber ?? null,
          username: (session.user as any).username ?? null,
          businessType: (session.user as any).businessType ?? 'none',
          profileSetupComplete: (session.user as any).profileSetupComplete === true || useAuthStore.getState().user?.profileSetupComplete === true,
          createdAt: session.user.createdAt,
        },
        {
          id: session.session.id,
          userId: session.session.userId,
          token: session.session.token,
          expiresAt: session.session.expiresAt,
          createdAt: session.session.createdAt,
        },
      );
    } else {
      clearAuth();
    }
  }, [session, isPending, setAuth, clearAuth, setPending]);

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
