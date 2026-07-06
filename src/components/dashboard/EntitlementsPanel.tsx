import { useMemo } from "react";
import { MoreHorizontal, ArrowLeft, Save, TrendingUpIcon, TrendingDownIcon } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable, DragHandle } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { useEntitlementsStore, useDashboardStore } from "@/store";

const overviewStats = [
  { label: "Configured Entitlements", value: "12", change: 8.3, isIncrease: true },
  { label: "Active Grants", value: "14.2k", change: 15.2, isIncrease: true },
  { label: "Validation Success Rate", value: "99.9%", change: 0.4, isIncrease: true },
];

const mockEntitlements = [
  { id: "ent_premium_ui", featureId: "premium_features", identifier: "premium_features", description: "Access to advanced themes", plans: ["Growth", "Scale"], status: "active", customers: 672, type: "boolean" as const },
  { id: "ent_api_access", featureId: "api_access", identifier: "api_access", description: "Full REST API access", plans: ["Scale"], status: "active", customers: 174, type: "boolean" as const },
  { id: "ent_priority_support", featureId: "priority_support", identifier: "priority_support", description: "24/7 dedicated support", plans: ["Growth", "Scale"], status: "active", customers: 672, type: "boolean" as const },
  { id: "ent_legacy_v1", featureId: "legacy_v1_access", identifier: "legacy_v1_access", description: "Legacy features", plans: ["Starter (Legacy)"], status: "archived", customers: 45, type: "boolean" as const },
];

type Entitlement = { id: string; featureId: string; identifier: string; description: string; plans: string[]; status: string; customers: number; type: "boolean" | "limit" };

export function EntitlementsPanel() {
  const { entitlementsView, searchQuery } = useDashboardStore();
  const { entitlements, selectedEntitlement, openManage, goBack } = useEntitlementsStore();

  // Merge store entitlements with mock for now
  const displayEntitlements = entitlements.length > 0
    ? entitlements.map(e => ({
        id: e.id,
        featureId: e.featureId,
        identifier: e.featureId,
        description: e.type === "limit" ? `Limit: ${e.limit ?? "unlimited"}` : "Boolean feature",
        plans: e.plans,
        status: "active" as const,
        customers: 0,
        type: e.type,
      }))
    : mockEntitlements;

  const filteredEntitlements = useMemo(() => {
    if (!searchQuery) return displayEntitlements;
    const q = searchQuery.toLowerCase();
    return displayEntitlements.filter(
      (e) =>
        e.identifier.toLowerCase().includes(q) ||
        e.id.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.status.toLowerCase().includes(q)
    );
  }, [searchQuery, displayEntitlements]);

  const columns: ColumnDef<Entitlement>[] = [
    {
      id: "drag",
      header: () => null,
      cell: ({ row }) => <DragHandle id={row.original.id} />,
    },
    {
      accessorKey: "identifier",
      header: "Identifier",
      cell: ({ row }) => (
        <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono text-foreground">
          {row.original.identifier}
        </code>
      ),
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => <span className="text-xs text-muted-foreground">{row.original.description}</span>,
    },
    {
      accessorKey: "plans",
      header: "Attached Plans",
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.plans.map((plan) => (
            <Badge key={plan} variant="secondary" className="text-[10px] font-medium px-1.5 py-0 bg-muted/60 hover:bg-muted">
              {plan}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      accessorKey: "customers",
      header: "Active Customers",
      cell: ({ row }) => <span className="text-xs font-medium text-foreground">{row.original.customers.toLocaleString()}</span>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge
          variant={row.original.status === "active" ? "default" : "outline"}
          className={`text-[10px] font-medium capitalize shadow-none ${
            row.original.status === "active"
              ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20"
              : "text-muted-foreground border-border"
          }`}
        >
          {row.original.status}
        </Badge>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <button
          type="button"
          onClick={() => openManage(row.original)}
          className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      ),
    },
  ];

  if (entitlementsView === "manage" && selectedEntitlement) {
    return (
      <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-6 bg-background">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={goBack} className="h-8 w-8 cursor-pointer">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Manage Entitlement</h2>
            <p className="text-sm text-muted-foreground mt-1">Update configuration for {(selectedEntitlement as any).featureId ?? (selectedEntitlement as any).identifier}</p>
          </div>
        </div>

        <Card className="shadow-none border-border/60 max-w-2xl">
          <CardHeader className="p-4 border-b border-border/50">
            <CardTitle className="text-sm font-semibold">Configuration</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Identifier</label>
              <Input defaultValue={(selectedEntitlement as any).featureId ?? (selectedEntitlement as any).identifier} className="h-8 text-sm" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Description</label>
              <Input defaultValue={(selectedEntitlement as any).description} className="h-8 text-sm" />
            </div>
          </CardContent>
          <CardFooter className="p-4 border-t border-border/50 flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={goBack} className="cursor-pointer">
              Cancel
            </Button>
            <Button size="sm" className="gap-1.5 cursor-pointer">
              <Save className="h-3.5 w-3.5" />
              Save Changes
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-6 bg-background">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Entitlements</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Manage access levels and feature flags mapped to your subscription plans.
        </p>
      </div>

      <div className="@container/main">
        <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs @xl/main:grid-cols-3 dark:*:data-[slot=card]:bg-card">
          {overviewStats.map((stat) => {
            const TrendIcon = stat.isIncrease ? TrendingUpIcon : TrendingDownIcon;
            const colorClass = stat.isIncrease
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-red-600 dark:text-red-400";

            return (
              <Card key={stat.label} className="@container/card data-[slot=card]" data-slot="card">
                <CardHeader>
                  <CardDescription>{stat.label}</CardDescription>
                  <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                    {stat.value}
                  </CardTitle>
                  <CardAction>
                    <Badge variant="outline" className={colorClass}>
                      <TrendIcon className="mr-1 size-3.5" />
                      {stat.isIncrease ? "+" : "-"}{stat.change}%
                    </Badge>
                  </CardAction>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1.5 text-sm">
                  <div className={`line-clamp-1 flex gap-2 font-medium ${colorClass}`}>
                    {stat.isIncrease ? "Trending up" : "Trending down"} this period <TrendIcon className="size-4" />
                  </div>
                  <div className="text-muted-foreground">
                    Compared to last period
                  </div>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredEntitlements}
        onReorder={(newData) => console.log("New order:", newData)}
      />
    </div>
  );
}
