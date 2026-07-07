import { useEffect, useMemo } from "react";
import {
  MoreHorizontal,
  ArrowLeft,
  Mail,
  User,
} from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { useCustomersStore, useDashboardStore } from "@/store";
import type { CustomerListItem } from "@/lib/api";

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function CustomersPanel() {
  const { customersView, searchQuery } = useDashboardStore();
  const { customers, total, loading, load, selectedCustomer, openManage, goBack } = useCustomersStore();

  const { activeCollectionId } = useDashboardStore();

  useEffect(() => {
    if (activeCollectionId) load({ search: searchQuery || undefined });
  }, [activeCollectionId, searchQuery]);

  const overviewStats = useMemo(() => {
    const withSubscriptions = customers.filter((c) => c.subscriptionCount > 0).length;
    const withActivity = customers.filter((c) => c.lastActivityAt).length;
    return [
      { label: "Total Customers", value: String(total), change: 0, isIncrease: true },
      { label: "With Subscriptions", value: String(withSubscriptions), change: 0, isIncrease: true },
      { label: "Active Recently", value: String(withActivity), change: 0, isIncrease: true },
    ];
  }, [customers, total]);

  const columns: ColumnDef<CustomerListItem>[] = [
    {
      accessorKey: "name",
      header: "Customer",
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-foreground">{row.original.name || row.original.userId}</div>
          <div className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
            {row.original.email ? (
              <><Mail className="h-3 w-3" /> {row.original.email}</>
            ) : (
              <><User className="h-3 w-3" /> {row.original.userId}</>
            )}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "subscriptionCount",
      header: "Subscriptions",
      cell: ({ row }) => (
        <span className="text-xs font-medium text-foreground">
          {row.original.subscriptionCount}
        </span>
      ),
    },
    {
      accessorKey: "lastActivityAt",
      header: "Last Activity",
      cell: ({ row }) => (
        <span className="text-[11px] text-muted-foreground">
          {formatDate(row.original.lastActivityAt)}
        </span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Joined",
      cell: ({ row }) => (
        <span className="text-[11px] text-muted-foreground">
          {formatDate(row.original.createdAt)}
        </span>
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

  if (customersView === "manage" && selectedCustomer) {
    return (
      <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-6 bg-background [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] scrollbar-none">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={goBack} className="h-8 w-8 cursor-pointer">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-lg font-semibold text-foreground">{selectedCustomer.name || selectedCustomer.userId}</h2>
            <p className="text-sm text-muted-foreground mt-1 font-mono">{selectedCustomer.id}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-lg border border-border/60 p-4 space-y-3">
              <h3 className="text-sm font-semibold">Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">User ID</span>
                  <p className="font-mono mt-0.5">{selectedCustomer.userId}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Email</span>
                  <p className="mt-0.5">{selectedCustomer.email ?? "—"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Subscriptions</span>
                  <p className="mt-0.5">{selectedCustomer.subscriptionCount}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Active Subscriptions</span>
                  <p className="mt-0.5">{selectedCustomer.activeSubscriptionCount}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-lg border border-border/60 p-4 space-y-3 bg-muted/20">
              <h3 className="text-sm font-semibold">Activity</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Joined</span>
                  <p className="mt-0.5">{formatDate(selectedCustomer.createdAt)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Last Activity</span>
                  <p className="mt-0.5">{formatDate(selectedCustomer.lastActivityAt)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-6 bg-background [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] scrollbar-none">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold text-foreground">Customers</h2>
        <p className="text-sm text-muted-foreground">
          Manage your user base, view subscription status, and analyze customer activity.
        </p>
      </div>

      <div className="@container/main">
        <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs @xl/main:grid-cols-3 dark:*:data-[slot=card]:bg-card">
          {overviewStats.map((stat) => {
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
                      {stat.isIncrease ? "+" : "-"}{stat.change}%
                    </Badge>
                  </CardAction>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1.5 text-sm">
                  <div className={`line-clamp-1 flex gap-2 font-medium ${colorClass}`}>
                    {stat.isIncrease ? "Trending up" : "Trending down"} this period
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

      {loading ? (
        <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">Loading...</div>
      ) : (
        <DataTable
          columns={columns}
          data={customers}
        />
      )}
    </div>
  );
}
