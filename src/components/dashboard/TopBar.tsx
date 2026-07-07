import { useEffect, useRef } from "react";
import { Search, HelpCircle, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDashboardStore, useBalanceStore } from "@/store";
import type { Section } from "@/types/dashboard";

const sectionLabels: Record<Section, string> = {
  analytics: "Analytics",
  entitlements: "Entitlements",
  plans: "Plans",
  products: "Products",
  customers: "Customers",
  settings: "Settings",
  profile: "Profile",
};

function formatBalance(amount: number): string {
  return `₦${(amount / 100).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function TopBar() {
  const activeSection = useDashboardStore((s) => s.activeSection);
  const searchQuery = useDashboardStore((s) => s.searchQuery);
  const setSearchQuery = useDashboardStore((s) => s.setSearchQuery);
  const inputRef = useRef<HTMLInputElement>(null);
  const { balance, fetch: fetchBalance } = useBalanceStore();
  const { activeCollectionId } = useDashboardStore();

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance, activeCollectionId]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-border px-4 bg-background">
      <div className="flex items-center gap-1.5 text-sm">
        <span className="text-muted-foreground">Semaphore Pay</span>
        <span className="text-muted-foreground/50">/</span>
        <span className="font-medium text-foreground">
          {sectionLabels[activeSection]}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-md border border-border px-2.5 py-1">
          <Wallet className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs font-medium tabular-nums">
            {formatBalance(balance?.available ?? 0)}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-5 px-1.5 text-[10px] text-muted-foreground hover:text-foreground cursor-pointer"
            onClick={() => useDashboardStore.getState().setSection("settings")}
          >
            Withdraw
          </Button>
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={inputRef}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..."
            className="h-8 w-48 rounded-md border-border bg-muted pl-8 pr-9 text-xs placeholder:text-muted-foreground"
          />
          <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded border border-border bg-background px-1 text-[10px] text-muted-foreground">
            ⌘K
          </kbd>
        </div>

        <button
          type="button"
          className="rounded-md p-1.5 text-muted-foreground hover:bg-muted"
        >
          <HelpCircle className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
