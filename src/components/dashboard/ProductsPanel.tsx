import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { MoreHorizontal, ArrowLeft, Plus, Save } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useProductsStore, useDashboardStore } from "@/store";
import type { Product } from "@/store/products";

function formatCurrency(kobo: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(kobo / 100);
}

function intervalLabel(interval: string | null) {
  if (!interval) return "one-time";
  if (interval === "monthly") return "mo";
  if (interval === "yearly") return "yr";
  return interval;
}

const createProductSchema = z.object({
  name: z.string().min(1, "Name is required"),
  group: z.string().optional(),
  priceAmount: z.coerce.number().int().min(0).optional().nullable(),
  priceCurrency: z.string().optional(),
  priceInterval: z.string().optional(),
  version: z.coerce.number().int().min(1).optional(),
  isDefault: z.boolean().default(false),
});

type CreateProductForm = z.infer<typeof createProductSchema>;

export function ProductsPanel() {
  const { productsView, searchQuery, activeCollectionId } = useDashboardStore();
  const { products, selectedProduct, loading, fetch: fetchProducts, create, update, remove, goBack } = useProductsStore();

  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);
  const deleteTarget = products.find((p) => p.id === deleteProductId) ?? null;

  useEffect(() => {
    if (activeCollectionId) fetchProducts(activeCollectionId);
  }, [activeCollectionId, fetchProducts]);

  const filteredProducts = useMemo(() => {
    if (!searchQuery) return products;
    const q = searchQuery.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.group.toLowerCase().includes(q)
    );
  }, [searchQuery, products]);

  const overviewStats = useMemo(() => {
    const total = products.length;
    const withPrice = products.filter((p) => p.priceAmount && p.priceAmount > 0).length;
    const defaults = products.filter((p) => p.isDefault).length;
    return [
      { label: "Total Products", value: String(total), change: 0, isIncrease: true },
      { label: "Paid Products", value: String(withPrice), change: 0, isIncrease: true },
      { label: "Default Products", value: String(defaults), change: 0, isIncrease: true },
    ];
  }, [products]);

  const existingGroups = useMemo(() => {
    const groups = new Set(products.map((p) => p.group).filter(Boolean));
    return Array.from(groups).sort();
  }, [products]);

  const columns: ColumnDef<Product>[] = [
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
      accessorKey: "group",
      header: "Group",
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">{row.original.group || "—"}</span>
      ),
    },
    {
      accessorKey: "priceAmount",
      header: "Pricing",
      cell: ({ row }) => (
        <div className="text-xs font-medium text-foreground">
          {row.original.priceAmount ? formatCurrency(row.original.priceAmount) : "Free"}
          {row.original.priceAmount ? (
            <span className="text-muted-foreground font-normal"> / {intervalLabel(row.original.priceInterval)}</span>
          ) : null}
        </div>
      ),
    },
    {
      accessorKey: "version",
      header: "Version",
      cell: ({ row }) => (
        <Badge variant="outline" className="text-[10px] font-mono">
          v{row.original.version}
        </Badge>
      ),
    },
    {
      accessorKey: "features",
      header: "Features",
      cell: ({ row }) => (
        <span className="text-xs font-medium text-foreground">{row.original.features.length}</span>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const product = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger>
              <button
                type="button"
                className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => useProductsStore.getState().openManage(product)}>
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setDeleteProductId(product.id)} className="text-red-600 focus:text-red-600">
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  if (productsView === "add") {
    return <AddProductView onCancel={goBack} existingGroups={existingGroups} onSubmit={async (data) => {
      if (!activeCollectionId) throw new Error("No collection selected");
      const id = `prod_${data.name.toLowerCase().replace(/[^a-z0-9]+/g, "_")}`;
      await create(activeCollectionId, {
        id,
        name: data.name,
        group: data.group || undefined,
        isDefault: data.isDefault,
        priceAmount: data.priceAmount ?? undefined,
        priceCurrency: data.priceCurrency || undefined,
        priceInterval: data.priceInterval || undefined,
        version: data.version || undefined,
      });
      toast.success("Product created");
    }} />;
  }

  if (productsView === "manage" && selectedProduct) {
    return <ManageProductView product={selectedProduct} onCancel={goBack} existingGroups={existingGroups} onSubmit={async (data) => {
      if (!activeCollectionId) throw new Error("No collection selected");
      await update(activeCollectionId, selectedProduct.id, {
        name: data.name,
        group: data.group || undefined,
        isDefault: data.isDefault,
        priceAmount: data.priceAmount ?? undefined,
        priceCurrency: data.priceCurrency || undefined,
        priceInterval: data.priceInterval || undefined,
        version: data.version || undefined,
      });
      toast.success("Product updated");
    }} />;
  }

  return (
    <>
      <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-6 bg-background [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] scrollbar-none">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Products</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage products, pricing, and feature mappings.
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
          <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">Loading products...</div>
        ) : (
          <DataTable columns={columns} data={filteredProducts} />
        )}
      </div>

      <AlertDialog open={!!deleteProductId} onOpenChange={(open) => { if (!open) setDeleteProductId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete product?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove "{deleteTarget?.name}". Only possible if no purchases exist.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={async () => {
                if (!activeCollectionId || !deleteProductId) return;
                try {
                  await remove(activeCollectionId, deleteProductId);
                  toast.success("Product deleted");
                } catch (err: any) {
                  toast.error(err.message ?? "Failed to delete product");
                }
                setDeleteProductId(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function AddProductView({
  onCancel,
  existingGroups,
  onSubmit,
}: {
  onCancel: () => void;
  existingGroups: string[];
  onSubmit: (data: CreateProductForm) => Promise<void>;
}) {
  const [form, setForm] = useState<CreateProductForm>({
    name: "",
    group: "",
    priceAmount: undefined,
    priceCurrency: "NGN",
    priceInterval: undefined,
    version: 1,
    isDefault: false,
  });
  const [customGroup, setCustomGroup] = useState("");
  const [useCustomGroup, setUseCustomGroup] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    const groupValue = useCustomGroup ? customGroup : form.group;
    const result = createProductSchema.safeParse({ ...form, group: groupValue });
    if (!result.success) {
      toast.error(result.error.issues[0].message);
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({ ...result.data, group: groupValue });
    } catch (err: any) {
      toast.error(err.message ?? "Failed to create product");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-6 bg-background [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] scrollbar-none">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onCancel} className="h-8 w-8 cursor-pointer">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-lg font-semibold text-foreground">Add New Product</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Create a new product with pricing and settings.
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
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Pro Access"
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Group</label>
              {useCustomGroup ? (
                <div className="flex gap-2">
                  <Input
                    value={customGroup}
                    onChange={(e) => setCustomGroup(e.target.value)}
                    placeholder="Enter group name"
                    className="h-8 text-sm flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs cursor-pointer"
                    onClick={() => { setUseCustomGroup(false); setCustomGroup(""); }}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <Select
                  value={form.group ?? ""}
                  onValueChange={(v) => {
                    if (v === "__new__") {
                      setUseCustomGroup(true);
                    } else {
                      setForm({ ...form, group: v ?? undefined});
                    }
                  }}
                >
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="Select a group" />
                  </SelectTrigger>
                  <SelectContent>
                    {existingGroups.map((g) => (
                      <SelectItem key={g} value={g}>{g}</SelectItem>
                    ))}
                    <SelectItem value="__new__">+ New group...</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Price (₦)</label>
              <Input
                type="text"
                inputMode="numeric"
                value={form.priceAmount != null ? String(form.priceAmount) : ""}
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^0-9]/g, "");
                  setForm({ ...form, priceAmount: raw ? Number(raw) : undefined });
                }}
                placeholder="0 = free"
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Recurring</label>
              <div className="flex items-center h-8">
                <Checkbox
                  id="recurring-add"
                  checked={!!form.priceInterval}
                  onCheckedChange={(checked) => setForm({ ...form, priceInterval: checked ? "monthly" : undefined })}
                />
                <label htmlFor="recurring-add" className="text-sm text-foreground cursor-pointer ml-2">
                  Billing repeats
                </label>
              </div>
            </div>
          </div>

          {form.priceInterval && (
            <div className="space-y-1.5 max-w-50">
              <label className="text-xs font-medium text-foreground">Interval</label>
              <Select value={form.priceInterval} onValueChange={(v) => setForm({ ...form, priceInterval: v ?? undefined})}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Version</label>
              <Input
                type="number"
                value={form.version ?? 1}
                onChange={(e) => setForm({ ...form, version: Number(e.target.value) || 1 })}
                onKeyDown={(e) => { if (/[eE+\-]/.test(e.key)) e.preventDefault(); }}
                className="h-8 text-sm"
              />
            </div>
            <div className="flex items-end pb-1">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="isDefault"
                  checked={form.isDefault}
                  onCheckedChange={(checked) => setForm({ ...form, isDefault: checked === true })}
                />
                <label htmlFor="isDefault" className="text-sm text-foreground cursor-pointer">
                  Default product
                </label>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="p-4 border-t border-border/50 flex justify-end gap-2 bg-muted/10">
          <Button variant="outline" size="sm" onClick={onCancel} className="cursor-pointer">
            Cancel
          </Button>
          <Button size="sm" className="gap-1.5 cursor-pointer" onClick={handleSubmit} disabled={submitting}>
            <Plus className="h-3.5 w-3.5" />
            {submitting ? "Creating..." : "Create Product"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

function ManageProductView({
  product,
  onCancel,
  existingGroups,
  onSubmit,
}: {
  product: Product;
  onCancel: () => void;
  existingGroups: string[];
  onSubmit: (data: CreateProductForm) => Promise<void>;
}) {
  const [form, setForm] = useState<CreateProductForm>({
    name: product.name,
    group: product.group,
    priceAmount: product.priceAmount ?? undefined,
    priceCurrency: product.priceCurrency ?? "NGN",
    priceInterval: product.priceInterval ?? undefined,
    version: product.version,
    isDefault: product.isDefault,
  });
  const [customGroup, setCustomGroup] = useState("");
  const [useCustomGroup, setUseCustomGroup] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    const groupValue = useCustomGroup ? customGroup : form.group;
    const result = createProductSchema.safeParse({ ...form, group: groupValue });
    if (!result.success) {
      toast.error(result.error.issues[0].message);
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({ ...result.data, group: groupValue });
    } catch (err: any) {
      toast.error(err.message ?? "Failed to update product");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-6 bg-background [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] scrollbar-none">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onCancel} className="h-8 w-8 cursor-pointer">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-lg font-semibold text-foreground">Edit Product</h2>
          <p className="text-sm text-muted-foreground mt-1 font-mono">{product.id}</p>
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
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Group</label>
              {useCustomGroup ? (
                <div className="flex gap-2">
                  <Input
                    value={customGroup}
                    onChange={(e) => setCustomGroup(e.target.value)}
                    placeholder="Enter group name"
                    className="h-8 text-sm flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs cursor-pointer"
                    onClick={() => { setUseCustomGroup(false); setCustomGroup(""); }}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <Select
                  value={form.group ?? ""}
                  onValueChange={(v) => {
                    if (v === "__new__") {
                      setUseCustomGroup(true);
                    } else {
                      setForm({ ...form, group: v ?? undefined });
                    }
                  }}
                >
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="Select a group" />
                  </SelectTrigger>
                  <SelectContent>
                    {existingGroups.map((g) => (
                      <SelectItem key={g} value={g}>{g}</SelectItem>
                    ))}
                    <SelectItem value="__new__">+ New group...</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Price (₦)</label>
              <Input
                type="text"
                inputMode="numeric"
                value={form.priceAmount != null ? String(form.priceAmount) : ""}
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^0-9]/g, "");
                  setForm({ ...form, priceAmount: raw ? Number(raw) : undefined });
                }}
                placeholder="0 = free"
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Recurring</label>
              <div className="flex items-center h-8">
                <Checkbox
                  id="recurring-manage"
                  checked={!!form.priceInterval}
                  onCheckedChange={(checked) => setForm({ ...form, priceInterval: checked ? "monthly" : undefined })}
                />
                <label htmlFor="recurring-manage" className="text-sm text-foreground cursor-pointer ml-2">
                  Billing repeats
                </label>
              </div>
            </div>
          </div>

          {form.priceInterval && (
            <div className="space-y-1.5 max-w-50">
              <label className="text-xs font-medium text-foreground">Interval</label>
              <Select value={form.priceInterval} onValueChange={(v) => setForm({ ...form, priceInterval: v ?? undefined })}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Version</label>
              <Input
                type="number"
                value={form.version ?? 1}
                onChange={(e) => setForm({ ...form, version: Number(e.target.value) || 1 })}
                onKeyDown={(e) => { if (/[eE+\-]/.test(e.key)) e.preventDefault(); }}
                className="h-8 text-sm"
              />
            </div>
            <div className="flex items-end pb-1">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="isDefault"
                  checked={form.isDefault}
                  onCheckedChange={(checked) => setForm({ ...form, isDefault: checked === true })}
                />
                <label htmlFor="isDefault" className="text-sm text-foreground cursor-pointer">
                  Default product
                </label>
              </div>
            </div>
          </div>

          {product.features.length > 0 && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Features</label>
              <div className="flex flex-wrap gap-2">
                {product.features.map((f) => (
                  <Badge key={f.featureId} variant="outline" className="text-[10px] font-mono">
                    {f.featureId} ({f.type}{f.limit !== undefined ? `, limit: ${f.limit}` : ""})
                  </Badge>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground">Features can be managed via the API.</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="p-4 border-t border-border/50 flex justify-end gap-2 bg-muted/10">
          <Button variant="outline" size="sm" onClick={onCancel} className="cursor-pointer">
            Cancel
          </Button>
          <Button size="sm" className="gap-1.5 cursor-pointer" onClick={handleSubmit} disabled={submitting}>
            <Save className="h-3.5 w-3.5" />
            {submitting ? "Saving..." : "Save Changes"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
