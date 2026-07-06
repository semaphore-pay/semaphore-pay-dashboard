import { useMemo } from "react";
import { MoreHorizontal, ArrowLeft, Save, Plus, TrendingUpIcon, TrendingDownIcon } from "lucide-react";
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
import { usePlansStore, useDashboardStore } from "@/store";

const overviewStats = [
  { label: "Active Plans", value: "6", change: 3.2, isIncrease: true },
  { label: "Total Subscribers", value: "2,842", change: 7.8, isIncrease: true },
  { label: "Total MRR", value: "$74.5k", change: 12.1, isIncrease: true },
];

const mockPlans = [
  {
    id: "plan_growth_mo",
    name: "Growth Monthly",
    description: "Standard tier for growing startups",
    price: 4900,
    interval: "month",
    subscribers: 612,
    mrr: 29988,
    status: "active",
    entitlements: ["core_features", "priority_support"],
  },
  {
    id: "plan_growth_yr",
    name: "Growth Annual",
    description: "Standard tier for growing startups (Annual)",
    price: 49000,
    interval: "year",
    subscribers: 498,
    mrr: 20335,
    status: "active",
    entitlements: ["core_features", "priority_support"],
  },
  {
    id: "plan_scale_mo",
    name: "Scale Monthly",
    description: "Advanced features and API access",
    price: 19900,
    interval: "month",
    subscribers: 174,
    mrr: 34626,
    status: "active",
    entitlements: ["core_features", "api_access", "premium_support"],
  },
  {
    id: "plan_starter_legacy",
    name: "Starter (Legacy)",
    description: "Old $29 tier, no longer offered",
    price: 2900,
    interval: "month",
    subscribers: 145,
    mrr: 4205,
    status: "grandfathered",
    entitlements: ["legacy_v1_access"],
  },
];

type Plan = typeof mockPlans[0];

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(cents / 100);
}

export function PlansPanel() {
  const { plansView, searchQuery } = useDashboardStore();
  const { plans, selectedPlan, openManage, goBack } = usePlansStore();

  // Use mock data for now
  const displayPlans = plans.length > 0 ? plans : mockPlans;

  const filteredPlans = useMemo(() => {
    if (!searchQuery) return displayPlans;
    const q = searchQuery.toLowerCase();
    return displayPlans.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.status.toLowerCase().includes(q)
    );
  }, [searchQuery, displayPlans]);

  const columns: ColumnDef<Plan>[] = [
    {
      id: "drag",
      header: () => null,
      cell: ({ row }) => <DragHandle id={row.original.id} />,
    },
    {
      accessorKey: "name",
      header: "Plan Name",
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-foreground">{row.original.name}</div>
          <div className="text-[10px] text-muted-foreground font-mono mt-0.5">{row.original.id}</div>
        </div>
      ),
    },
    {
      accessorKey: "price",
      header: "Pricing",
      cell: ({ row }) => (
        <div className="text-xs font-medium text-foreground">
          {formatCurrency(row.original.price)}
          <span className="text-muted-foreground font-normal"> / {row.original.interval}</span>
        </div>
      ),
    },
    {
      accessorKey: "subscribers",
      header: "Subscribers",
      cell: ({ row }) => <span className="text-xs font-medium text-foreground">{row.original.subscribers.toLocaleString()}</span>,
    },
    {
      accessorKey: "mrr",
      header: "MRR",
      cell: ({ row }) => <span className="text-xs font-medium text-foreground">{formatCurrency(row.original.mrr)}</span>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge
          variant="outline"
          className={`text-[10px] font-medium capitalize shadow-none border-transparent ${
            row.original.status === "active"
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              : "bg-amber-500/10 text-amber-700 dark:text-amber-400"
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

  if (plansView === "manage" && selectedPlan) {
    return (
      <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-6 bg-background [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] scrollbar-none">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={goBack} className="h-8 w-8 cursor-pointer">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Manage Plan</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Update configuration for {(selectedPlan as any).name}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-none border-border/60">
              <CardHeader className="p-4 border-b border-border/50">
                <CardTitle className="text-sm font-semibold">General Details</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground">Plan Name</label>
                    <Input defaultValue={(selectedPlan as any).name} className="h-8 text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground">API Identifier</label>
                    <Input defaultValue={selectedPlan.id} disabled className="h-8 text-sm bg-muted/50" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Description</label>
                  <Input defaultValue={(selectedPlan as any).description} className="h-8 text-sm" />
                  <p className="text-[10px] text-muted-foreground">Displayed on the customer checkout page.</p>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-none border-border/60">
              <CardHeader className="p-4 border-b border-border/50 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-semibold">Linked Entitlements</CardTitle>
                <Button variant="outline" size="sm" className="h-6 text-[10px] px-2 cursor-pointer">
                  <Plus className="mr-1 h-3 w-3" /> Add
                </Button>
              </CardHeader>
              <CardContent className="p-4">
                <div className="flex flex-wrap gap-2">
                  {(selectedPlan as any).entitlements?.map((ent: string) => (
                    <Badge key={ent} variant="secondary" className="text-[11px] font-medium px-2 py-1 bg-muted/60">
                      {ent}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="shadow-none border-border/60">
              <CardHeader className="p-4 border-b border-border/50">
                <CardTitle className="text-sm font-semibold">Pricing & Billing</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Price (USD)</label>
                  <Input defaultValue={((selectedPlan as any).price / 100).toString()} type="number" className="h-8 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Billing Interval</label>
                  <Input defaultValue={(selectedPlan as any).interval} disabled className="h-8 text-sm bg-muted/50 capitalize" />
                  <p className="text-[10px] text-muted-foreground">Intervals cannot be changed after creation.</p>
                </div>
              </CardContent>
              <CardFooter className="p-4 border-t border-border/50 flex justify-end gap-2 bg-muted/10">
                <Button size="sm" className="w-full gap-1.5 cursor-pointer">
                  <Save className="h-3.5 w-3.5" />
                  Save Changes
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-6 bg-background [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] scrollbar-none">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Subscription Plans</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Configure pricing tiers, billing intervals, and feature access.
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
        data={filteredPlans as any[]}
        onReorder={(newData) => console.log("New order:", newData)}
      />
    </div>
  );
}
