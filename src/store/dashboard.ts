import { create } from "zustand";
import type { Section, AnalyticsSubView, AnalyticsMode } from "@/types/dashboard";

type PanelView = "list" | "manage" | "add";

interface DashboardState {
  activeSection: Section;
  activeSubView: AnalyticsSubView;
  analyticsMode: AnalyticsMode;
  environment: "sandbox" | "production";
  activeCollectionId: string | null;
  searchQuery: string;

  // Panel view states — App.tsx buttons write here, panels read here
  plansView: PanelView;
  productsView: PanelView;
  customersView: PanelView;
  entitlementsView: PanelView;

  // ──── Actions ────
  setSection: (section: Section) => void;
  setSubView: (view: AnalyticsSubView) => void;
  setAnalyticsMode: (mode: AnalyticsMode) => void;
  setEnvironment: (env: "sandbox" | "production") => void;
  setActiveCollection: (id: string | null) => void;
  setSearchQuery: (query: string) => void;

  openPlansAdd: () => void;
  openPlansList: () => void;
  openProductsAdd: () => void;
  openProductsList: () => void;
  openCustomersAdd: () => void;
  openCustomersList: () => void;
  openEntitlementsAdd: () => void;
  openEntitlementsList: () => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  activeSection: "analytics",
  activeSubView: "overview",
  analyticsMode: "basic",
  environment: "sandbox",
  activeCollectionId: null,
  searchQuery: "",

  plansView: "list",
  productsView: "list",
  customersView: "list",
  entitlementsView: "list",

  setSection: (section) => set({ activeSection: section, activeSubView: "overview", searchQuery: "" }),
  setSubView: (view) => set({ activeSubView: view }),
  setAnalyticsMode: (mode) => set({ analyticsMode: mode }),
  setEnvironment: (env) => set({ environment: env }),
  setActiveCollection: (id) => set({ activeCollectionId: id }),
  setSearchQuery: (query) => set({ searchQuery: query }),

  openPlansAdd: () => set({ plansView: "add", activeSection: "plans" }),
  openPlansList: () => set({ plansView: "list" }),
  openProductsAdd: () => set({ productsView: "add", activeSection: "products" }),
  openProductsList: () => set({ productsView: "list" }),
  openCustomersAdd: () => set({ customersView: "add", activeSection: "customers" }),
  openCustomersList: () => set({ customersView: "list" }),
  openEntitlementsAdd: () => set({ entitlementsView: "add", activeSection: "entitlements" }),
  openEntitlementsList: () => set({ entitlementsView: "list" }),
}));
