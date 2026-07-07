import { create } from "zustand";
import { getBalance, type Balance } from "@/lib/api";
import { useDashboardStore } from "./dashboard";

interface BalanceState {
  balance: Balance | null;
  loading: boolean;
  error: string | null;
  fetch: () => Promise<void>;
}

export const useBalanceStore = create<BalanceState>((set) => ({
  balance: null,
  loading: false,
  error: null,

  fetch: async () => {
    const collectionId = useDashboardStore.getState().activeCollectionId;
    if (!collectionId) return;

    set({ loading: true, error: null });
    try {
      const balance = await getBalance(collectionId);
      set({ balance, loading: false });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to fetch balance";
      set({ error: message, loading: false });
    }
  },
}));
