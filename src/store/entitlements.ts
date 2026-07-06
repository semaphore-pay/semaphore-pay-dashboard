import { create } from "zustand";

type ViewMode = "list" | "manage" | "add";

// Entitlement shape — maps from the plan's features array
export interface Entitlement {
  id: string;
  featureId: string;
  type: "boolean" | "limit";
  limit?: number | null;
  resetInterval?: string | null;
  plans: string[];
}

interface EntitlementsState {
  entitlements: Entitlement[];
  selectedEntitlement: Entitlement | null;
  activeView: ViewMode;
  loading: boolean;
  error: string | null;

  loadFromPlans: (plans: any[], products: any[]) => void;
  select: (entitlement: Entitlement | null) => void;
  openManage: (entitlement: Entitlement) => void;
  openAdd: () => void;
  goBack: () => void;
}

export const useEntitlementsStore = create<EntitlementsState>((set) => ({
  entitlements: [],
  selectedEntitlement: null,
  activeView: "list",
  loading: false,
  error: null,

  loadFromPlans: (plans) => {
    const map = new Map<string, Entitlement>();

    for (const plan of plans) {
      for (const feat of plan.features ?? []) {
        const existing = map.get(feat.featureId);
        if (existing) {
          existing.plans.push(plan.name);
        } else {
          map.set(feat.featureId, {
            id: feat.featureId,
            featureId: feat.featureId,
            type: feat.type,
            limit: feat.limit,
            resetInterval: feat.resetInterval,
            plans: [plan.name],
          });
        }
      }
    }

    set({ entitlements: [...map.values()] });
  },

  select: (entitlement) => set({ selectedEntitlement: entitlement }),
  openManage: (entitlement) =>
    set({ selectedEntitlement: entitlement, activeView: "manage" }),
  openAdd: () => set({ activeView: "add", selectedEntitlement: null }),
  goBack: () => set({ selectedEntitlement: null, activeView: "list" }),
}));
