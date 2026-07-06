import { useMemo } from "react";
import {
  MoreHorizontal,
  ArrowLeft,
  Save,
  Plus,
  TrendingUpIcon,
  TrendingDownIcon
} from "lucide-react";
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
import { useProductsStore, useDashboardStore } from "@/store";

const overviewStats = [
  { label: "Active Products", value: "24", change: 12.5, isIncrease: true },
  { label: "Inventory Alerts", value: "3", change: 2.1, isIncrease: false },
  { label: "SKU Diversity", value: "1.2k", change: 4.5, isIncrease: true },
];

const mockProducts = [
  { id: "prod_001", name: "Semaphore Core API", sku: "SEM-CORE-001", status: "published", price: 4900, planId: "plan_abc123" },
  { id: "prod_002", name: "Data Analytics Engine", sku: "SEM-ENG-002", status: "published", price: 19900, planId: "plan_xyz789" },
  { id: "prod_003", name: "UI Component Library", sku: "SEM-UI-003", status: "draft", price: 0, planId: "plan_abc123" },
  { id: "prod_004", name: "Custom Integration Layer", sku: "SEM-CUST-004", status: "archived", price: 49000, planId: "plan_ent001" },
];

type Product = typeof mockProducts[0];

export function ProductsPanel() {
  const { productsView, searchQuery } = useDashboardStore();
  const { products, selectedProduct, openManage, goBack } = useProductsStore();

  const displayProducts = products.length > 0 ? products : mockProducts;

  const filteredProducts = useMemo(() => {
    if (!searchQuery) return displayProducts;
    const q = searchQuery.toLowerCase();
    return displayProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.status.toLowerCase().includes(q) ||
        p.planId.toLowerCase().includes(q)
    );
  }, [searchQuery, displayProducts]);

  const columns: ColumnDef<Product>[] = [
    {
      id: "drag",
      header: () => null,
      cell: ({ row }) => <DragHandle id={row.original.id} />,
    },
    {
      accessorKey: "name",
      header: "Product Name",
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-foreground">{row.original.name}</div>
          <div className="text-[10px] text-muted-foreground font-mono mt-0.5">{row.original.id}</div>
        </div>
      ),
    },
    {
      accessorKey: "sku",
      header: "SKU",
      cell: ({ row }) => <code className="text-[11px] font-mono text-muted-foreground">{row.original.sku}</code>,
    },
    {
      accessorKey: "planId",
      header: "Associated Plan",
      cell: ({ row }) => <code className="text-[11px] font-mono text-muted-foreground">{row.original.planId}</code>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge
          variant="outline"
          className={`text-[10px] font-medium capitalize shadow-none border-transparent ${
            row.original.status === "published"
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              : row.original.status === "draft"
              ? "bg-amber-500/10 text-amber-700 dark:text-amber-400"
              : "bg-muted text-muted-foreground"
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
          onClick={() => openManage(row.original)}
          className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      ),
    },
  ];

  if (productsView === "add") {
    return (
      <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-6 bg-background [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={goBack} className="h-8 w-8 cursor-pointer">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Add New Product</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Create a new product and map it to an existing subscription plan.
            </p>
          </div>
        </div>

        <Card className="shadow-none border-border/60 max-w-2xl">
          <CardHeader className="p-4 border-b border-border/50">
            <CardTitle className="text-sm font-semibold">Product Configuration</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Product Name *</label>
                <Input placeholder="e.g. Pro Access" className="h-8 text-sm" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Plan ID *</label>
                <Input placeholder="e.g. plan_abc123" className="h-8 text-sm font-mono" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Description</label>
              <Input placeholder="e.g. Unlimited access to core features" className="h-8 text-sm" />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Metadata (JSON)</label>
              <Input placeholder='{"features": "api,export,priority_support"}' className="h-8 text-sm font-mono" />
              <p className="text-[10px] text-muted-foreground">Custom key-value pairs associated with this product.</p>
            </div>
          </CardContent>
          <CardFooter className="p-4 border-t border-border/50 flex justify-end gap-2 bg-muted/10">
            <Button variant="outline" size="sm" onClick={goBack} className="cursor-pointer">
              Cancel
            </Button>
            <Button size="sm" className="gap-1.5 cursor-pointer">
              <Plus className="h-3.5 w-3.5" />
              Create Product
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (productsView === "manage" && selectedProduct) {
    return (
      <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-6 bg-background [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={goBack} className="h-8 w-8 cursor-pointer">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Manage Product</h2>
            <p className="text-sm text-muted-foreground mt-1 font-mono">
              {(selectedProduct as any).id}
            </p>
          </div>
        </div>

        <Card className="shadow-none border-border/60 max-w-2xl">
          <CardHeader className="p-4 border-b border-border/50">
            <CardTitle className="text-sm font-semibold">General Details</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Product Name *</label>
                <Input defaultValue={(selectedProduct as any).name} className="h-8 text-sm" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">SKU</label>
                <Input defaultValue={(selectedProduct as any).sku} className="h-8 text-sm font-mono" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Plan ID *</label>
              <Input defaultValue={(selectedProduct as any).planId} className="h-8 text-sm font-mono" />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Description</label>
              <Input placeholder="Product description" className="h-8 text-sm" />
            </div>
          </CardContent>
          <CardFooter className="p-4 border-t border-border/50 flex justify-end gap-2 bg-muted/10">
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
    <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-6 bg-background [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-foreground">Products</h2>
          <p className="text-sm text-muted-foreground">
            Manage your inventory, SKUs, and map products to active subscription plans.
          </p>
        </div>
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

      <DataTable columns={columns} data={filteredProducts as any[]} />
    </div>
  );
}
