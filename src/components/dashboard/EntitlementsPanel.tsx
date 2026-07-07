import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Plus, Trash2, X } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEntitlementsStore, useDashboardStore, usePlansStore, useProductsStore } from "@/store";
import { toast } from "sonner";
import type { Feature } from "@/lib/api";

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
}

export function EntitlementsPanel() {
  const { entitlementsView, searchQuery, activeCollectionId } = useDashboardStore();
  const { features, loading, load, create, remove, attachToPlan, attachToProduct, detachFromPlan, detachFromProduct, goBack } = useEntitlementsStore();
  const { plans, fetch: fetchPlans } = usePlansStore();
  const { products, fetch: fetchProducts } = useProductsStore();

  const [deleteFeatureId, setDeleteFeatureId] = useState<string | null>(null);

  // Create form state
  const [newFeatureId, setNewFeatureId] = useState("");
  const [newFeatureName, setNewFeatureName] = useState("");
  const [newFeatureType, setNewFeatureType] = useState<"boolean" | "limit">("boolean");
  const [idEdited, setIdEdited] = useState(false);
  const [attachEnabled, setAttachEnabled] = useState(false);
  const [attachType, setAttachType] = useState<"plan" | "product">("plan");
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [featureLimit, setFeatureLimit] = useState("");
  const [featureResetInterval, setFeatureResetInterval] = useState<string>("");

  const deleteTarget = features.find((f) => f.id === deleteFeatureId) ?? null;

  useEffect(() => {
    if (activeCollectionId) {
      load();
      fetchPlans(activeCollectionId);
      fetchProducts(activeCollectionId);
    }
  }, [activeCollectionId, load, fetchPlans, fetchProducts]);

  useEffect(() => {
    if (newFeatureName && !idEdited) {
      setNewFeatureId(slugify(newFeatureName));
    }
  }, [newFeatureName, idEdited]);

  const filteredFeatures = useMemo(() => {
    if (!searchQuery) return features;
    const q = searchQuery.toLowerCase();
    return features.filter(
      (f) =>
        f.id.toLowerCase().includes(q) ||
        f.type.toLowerCase().includes(q)
    );
  }, [searchQuery, features]);

  const overviewStats = useMemo(() => {
    const booleanCount = features.filter((f) => f.type === "boolean").length;
    const limitCount = features.filter((f) => f.type === "limit").length;
    return [
      { label: "Total Features", value: String(features.length), change: 0, isIncrease: true },
      { label: "Boolean Features", value: String(booleanCount), change: 0, isIncrease: true },
      { label: "Metered Features", value: String(limitCount), change: 0, isIncrease: true },
    ];
  }, [features]);

  const getAttachedPlans = (featureId: string) => {
    return plans.filter((p) =>
      p.features?.some((f: any) => f.featureId === featureId)
    );
  };

  const getAttachedProducts = (featureId: string) => {
    return products.filter((p) =>
      p.features?.some((f: any) => f.featureId === featureId)
    );
  };

  const handleBack = () => {
    useDashboardStore.getState().openEntitlementsList();
    goBack();
    resetCreateForm();
  };

  const resetCreateForm = () => {
    setNewFeatureId("");
    setNewFeatureName("");
    setNewFeatureType("boolean");
    setIdEdited(false);
    setAttachEnabled(false);
    setAttachType("plan");
    setSelectedPlanId("");
    setSelectedProductId("");
    setFeatureLimit("");
    setFeatureResetInterval("");
  };

  const handleCreate = async () => {
    if (!newFeatureId.trim() || !newFeatureName.trim()) return;

    try {
      await create({ id: newFeatureId.trim(), name: newFeatureName.trim(), type: newFeatureType });

      // Attach to plan if enabled
      if (attachEnabled && attachType === "plan" && selectedPlanId) {
        await attachToPlan({
          planId: selectedPlanId,
          featureId: newFeatureId.trim(),
          type: newFeatureType,
          limit: newFeatureType === "limit" ? (featureLimit ? Number(featureLimit) : null) : null,
          resetInterval: featureResetInterval || null,
        });
        if (activeCollectionId) fetchPlans(activeCollectionId);
      }

      // Attach to product if enabled
      if (attachEnabled && attachType === "product" && selectedProductId) {
        await attachToProduct({
          productInternalId: selectedProductId,
          featureId: newFeatureId.trim(),
          type: newFeatureType,
          limit: newFeatureType === "limit" ? (featureLimit ? Number(featureLimit) : null) : null,
          resetInterval: featureResetInterval || null,
        });
        if (activeCollectionId) fetchProducts(activeCollectionId);
      }

      toast.success("Feature created");
      resetCreateForm();
      useDashboardStore.getState().openEntitlementsList();
      await load();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const columns: ColumnDef<Feature>[] = [
    {
      accessorKey: "id",
      header: "Feature ID",
      cell: ({ row }) => (
        <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono text-foreground">
          {row.original.id}
        </code>
      ),
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <span className="text-sm font-medium text-foreground">{row.original.name}</span>
      ),
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => (
        <Badge
          variant="outline"
          className={`text-[10px] font-medium capitalize shadow-none ${
            row.original.type === "boolean"
              ? "bg-blue-500/10 text-blue-600 hover:bg-blue-500/20"
              : "bg-amber-500/10 text-amber-600 hover:bg-amber-500/20"
          }`}
        >
          {row.original.type}
        </Badge>
      ),
    },
    {
      id: "attachedPlans",
      header: "Plans",
      cell: ({ row }) => {
        const attachedPlans = getAttachedPlans(row.original.id);
        const featureId = row.original.id;
        return (
          <div className="flex flex-wrap gap-1">
            {attachedPlans.length === 0 ? (
              <span className="text-xs text-muted-foreground">None</span>
            ) : (
              attachedPlans.map((plan) => (
                <Badge key={plan.id} variant="secondary" className="text-[10px] font-medium px-1.5 py-0 bg-muted/60 gap-1">
                  {plan.name}
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await detachFromPlan(plan.id, featureId);
                        toast.success(`Detached from ${plan.name}`);
                        load();
                      } catch (err: any) {
                        toast.error(err.message);
                      }
                    }}
                    className="rounded-full hover:bg-muted-foreground/20 p-0.5 cursor-pointer"
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                </Badge>
              ))
            )}
          </div>
        );
      },
    },
    {
      id: "attachedProducts",
      header: "Products",
      cell: ({ row }) => {
        const attachedProducts = getAttachedProducts(row.original.id);
        const featureId = row.original.id;
        return (
          <div className="flex flex-wrap gap-1">
            {attachedProducts.length === 0 ? (
              <span className="text-xs text-muted-foreground">None</span>
            ) : (
              attachedProducts.map((product) => (
                <Badge key={product.internalId} variant="secondary" className="text-[10px] font-medium px-1.5 py-0 bg-muted/60 gap-1">
                  {product.name}
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await detachFromProduct(product.internalId, featureId);
                        toast.success(`Detached from ${product.name}`);
                        load();
                      } catch (err: any) {
                        toast.error(err.message);
                      }
                    }}
                    className="rounded-full hover:bg-muted-foreground/20 p-0.5 cursor-pointer"
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                </Badge>
              ))
            )}
          </div>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <button
          type="button"
          onClick={() => setDeleteFeatureId(row.original.id)}
          className="rounded p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors cursor-pointer"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      ),
    },
  ];

  if (entitlementsView === "add") {
    return (
      <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-6 bg-background">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleBack} className="h-8 w-8 cursor-pointer">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Create Feature</h2>
            <p className="text-sm text-muted-foreground mt-1">Define a feature and attach it to a plan or product</p>
          </div>
        </div>

        <Card className="shadow-none border-border/60 max-w-2xl">
          <CardContent className="p-4 space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Name</label>
              <Input
                value={newFeatureName}
                onChange={(e) => setNewFeatureName(e.target.value)}
                placeholder="e.g. API Calls, Premium Support"
                className="h-8 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Feature ID</label>
              <Input
                value={newFeatureId}
                onChange={(e) => { setIdEdited(true); setNewFeatureId(e.target.value); }}
                placeholder="e.g. api_calls, premium_support"
                className="h-8 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Type</label>
              <Select value={newFeatureType} onValueChange={(v) => setNewFeatureType(v as "boolean" | "limit")}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="boolean">Boolean (on/off)</SelectItem>
                  <SelectItem value="limit">Limit (metered)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="border-t border-border/50 pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-foreground">Attach to plan or product</label>
                <button
                  type="button"
                  role="switch"
                  aria-checked={attachEnabled}
                  onClick={() => {
                    setAttachEnabled(!attachEnabled);
                    setSelectedPlanId("");
                    setSelectedProductId("");
                  }}
                  className={`peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                    attachEnabled ? "bg-primary" : "bg-input"
                  }`}
                >
                  <span
                    className={`pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform ${
                      attachEnabled ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {attachEnabled && (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={attachType === "plan" ? "default" : "outline"}
                      size="sm"
                      className="h-8 text-xs cursor-pointer"
                      onClick={() => { setAttachType("plan"); setSelectedProductId(""); }}
                    >
                      Plan
                    </Button>
                    <Button
                      type="button"
                      variant={attachType === "product" ? "default" : "outline"}
                      size="sm"
                      className="h-8 text-xs cursor-pointer"
                      onClick={() => { setAttachType("product"); setSelectedPlanId(""); }}
                    >
                      Product
                    </Button>
                  </div>

                  {attachType === "plan" && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-foreground">Select Plan</label>
                      <Select value={selectedPlanId} onValueChange={(v) => setSelectedPlanId(v ?? "")}>
                        <SelectTrigger className="h-8 text-sm">
                          <SelectValue placeholder="Choose a plan" />
                        </SelectTrigger>
                        <SelectContent>
                          {plans.filter((p) => p.isActive).map((plan) => (
                            <SelectItem key={plan.id} value={plan.id}>
                              {plan.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {attachType === "product" && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-foreground">Select Product</label>
                      <Select value={selectedProductId} onValueChange={(v) => setSelectedProductId(v ?? "")}>
                        <SelectTrigger className="h-8 text-sm">
                          <SelectValue placeholder="Choose a product" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map((product) => (
                            <SelectItem key={product.internalId} value={product.internalId}>
                              {product.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {newFeatureType === "limit" && (
                    <>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-foreground">Limit</label>
                        <Input
                          type="number"
                          value={featureLimit}
                          onChange={(e) => setFeatureLimit(e.target.value)}
                          placeholder="e.g. 1000"
                          className="h-8 text-sm"
                          min="0"
                          onKeyDown={(e) => {
                            if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault();
                          }}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-foreground">Reset Interval</label>
                        <Select value={featureResetInterval} onValueChange={(v) => setFeatureResetInterval(v ?? "")}>
                          <SelectTrigger className="h-8 text-sm">
                            <SelectValue placeholder="Never" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Never</SelectItem>
                            <SelectItem value="day">Daily</SelectItem>
                            <SelectItem value="week">Weekly</SelectItem>
                            <SelectItem value="month">Monthly</SelectItem>
                            <SelectItem value="year">Yearly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </CardContent>
          <div className="p-4 border-t border-border/50 flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={handleBack} className="cursor-pointer">
              Cancel
            </Button>
            <Button
              size="sm"
              className="gap-1.5 cursor-pointer"
              disabled={!newFeatureId.trim() || !newFeatureName.trim() || (attachEnabled && attachType === "plan" && !selectedPlanId) || (attachEnabled && attachType === "product" && !selectedProductId)}
              onClick={handleCreate}
            >
              <Plus className="h-3.5 w-3.5" />
              Create Feature
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-6 bg-background">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Entitlements</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Manage features and their availability across plans and products.
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
        <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">Loading features...</div>
      ) : (
        <DataTable columns={columns} data={filteredFeatures} />
      )}

      <AlertDialog open={!!deleteFeatureId} onOpenChange={(open) => { if (!open) setDeleteFeatureId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete feature?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove "{deleteTarget?.id}" and detach it from any plans or products using it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer"
              onClick={async () => {
                if (!deleteFeatureId) return;
                try {
                  await remove(deleteFeatureId);
                  toast.success("Feature deleted");
                } catch (err: any) {
                  toast.error(err.message);
                }
                setDeleteFeatureId(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
