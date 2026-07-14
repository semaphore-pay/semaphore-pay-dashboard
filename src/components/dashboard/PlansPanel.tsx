import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { MoreHorizontal, TrendingUpIcon, TrendingDownIcon, ArrowLeft, Plus, Trash2 } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { usePlansStore, useDashboardStore, useEntitlementsStore } from "@/store";
import type { PlanWithStats } from "@/store/plans";

function formatCurrency(kobo: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(kobo / 100);
}

function intervalLabel(interval: string) {
  if (interval === "test_15min") return "15m";
  if (interval === "monthly") return "mo";
  if (interval === "yearly") return "yr";
  if (interval === "test_15min") return "15m";
  return interval;
}

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
}

const createPlanSchema = z.object({
  name: z.string().min(1, "Name is required"),
  id: z.string().min(1, "ID is required"),
  description: z.string().optional(),
  price: z.number().min(0, "Price must be ≥ 0"),
  interval: z.enum(["monthly", "yearly", "none", "test_15min"]),
  trialPeriodDays: z.number().int().min(0).optional(),
  badge: z.string().optional(),
  isActive: z.boolean().default(true),
});

type CreatePlanForm = z.infer<typeof createPlanSchema>;

export function PlansPanel() {
  const { plansView, searchQuery, activeCollectionId } = useDashboardStore();
  const { plans, selectedPlan, loading, fetch: fetchPlans, create, deactivate, reactivate, remove, openManage, goBack } = usePlansStore();

  const [deactivatePlanId, setDeactivatePlanId] = useState<string | null>(null);
  const [reactivatePlanId, setReactivatePlanId] = useState<string | null>(null);
  const [deletePlanId, setDeletePlanId] = useState<string | null>(null);
  const [cancelRenewals, setCancelRenewals] = useState(false);

  // const deactivateTarget = plans.find((p) => p.id === deactivatePlanId) ?? null;
  // const reactivateTarget = plans.find((p) => p.id === reactivatePlanId) ?? null;
  // const deleteTarget = plans.find((p) => p.id === deletePlanId) ?? null;

  useEffect(() => {
    if (activeCollectionId) fetchPlans(activeCollectionId);
  }, [activeCollectionId, fetchPlans]);

  const filteredPlans = useMemo(() => {
    if (!searchQuery) return plans;
    const q = searchQuery.toLowerCase();
    return plans.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        (p.description ?? "").toLowerCase().includes(q)
    );
  }, [searchQuery, plans]);

  const overviewStats = useMemo(() => {
    const active = plans.filter((p) => p.isActive).length;
    const totalSubs = plans.reduce((sum, p) => sum + p.subscribers, 0);
    const totalMrr = plans.reduce((sum, p) => sum + p.mrr, 0);
    return [
      { label: "Active Plans", value: String(active), change: 0, isIncrease: true },
      { label: "Total Subscribers", value: totalSubs.toLocaleString(), change: 0, isIncrease: true },
      { label: "Total MRR", value: formatCurrency(totalMrr), change: 0, isIncrease: true },
    ];
  }, [plans]);

  const columns: ColumnDef<PlanWithStats>[] = [
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
      accessorKey: "priceAmount",
      header: "Pricing",
      cell: ({ row }) => (
        <div className="text-xs font-medium text-foreground">
          {formatCurrency(row.original.priceAmount)}
          <span className="text-muted-foreground font-normal"> / {intervalLabel(row.original.interval)}</span>
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
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => (
        <Badge
          variant="outline"
          className={`text-[10px] font-medium capitalize shadow-none border-transparent ${
            row.original.isActive
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              : "bg-amber-500/10 text-amber-700 dark:text-amber-400"
          }`}
        >
          {row.original.isActive ? "active" : "inactive"}
        </Badge>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const plan = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger
  render={
    <button
      type="button"
      className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
    >
      <MoreHorizontal className="h-4 w-4" />
    </button>
  }
/>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => openManage(plan)}>
                Manage
              </DropdownMenuItem>
              {plan.isActive ? (
                <DropdownMenuItem onClick={() => setDeactivatePlanId(plan.id)}>
                  Deactivate
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => setReactivatePlanId(plan.id)}>
                  Reactivate
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => setDeletePlanId(plan.id)} className="text-red-600 focus:text-red-600">
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  if (plansView === "add") {
    return (
      <AddPlanView
        onCancel={goBack}
        onSubmit={async (data) => {
          if (!activeCollectionId) throw new Error("No collection selected");
          await create(activeCollectionId, {
            id: data.id,
            name: data.name,
            description: data.description || undefined,
            priceAmount: data.price * 100,
            interval: data.interval,
            trialPeriodDays: data.trialPeriodDays || undefined,
            badge: data.badge || undefined,
            isActive: data.isActive,
          });
        }}
      />
    );
  }

  if (plansView === "manage" && selectedPlan) {
    return <ManagePlanView plan={selectedPlan} onCancel={goBack} />;
  }

  return (
    <>
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

      {loading ? (
        <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">Loading plans...</div>
      ) : (
        <DataTable
          columns={columns}
          data={filteredPlans}
        />
      )}
      </div>

      <AlertDialog open={!!deactivatePlanId} onOpenChange={(open) => { if (!open) { setDeactivatePlanId(null); setCancelRenewals(false); } }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate plan?</AlertDialogTitle>
            <AlertDialogDescription>
              New signups will be blocked. Existing subscribers keep access until they cancel.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex items-center gap-2 py-2">
            <Checkbox
              id="cancel-renewals"
              checked={cancelRenewals}
              onCheckedChange={(checked) => setCancelRenewals(checked === true)}
            />
            <label htmlFor="cancel-renewals" className="text-sm text-foreground cursor-pointer">
              Cancel existing renewals at period end
            </label>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!activeCollectionId || !deactivatePlanId) return;
                await deactivate(activeCollectionId, deactivatePlanId, cancelRenewals);
                toast.success("Plan deactivated");
                setDeactivatePlanId(null);
                setCancelRenewals(false);
              }}
            >
              Deactivate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!reactivatePlanId} onOpenChange={(open) => { if (!open) setReactivatePlanId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reactivate plan?</AlertDialogTitle>
            <AlertDialogDescription>
              This plan will accept new signups again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!activeCollectionId || !reactivatePlanId) return;
                await reactivate(activeCollectionId, reactivatePlanId);
                toast.success("Plan reactivated");
                setReactivatePlanId(null);
              }}
            >
              Reactivate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deletePlanId} onOpenChange={(open) => { if (!open) setDeletePlanId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete plan?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the plan. Only possible if no active subscriptions exist.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={async () => {
                if (!activeCollectionId || !deletePlanId) return;
                try {
                  await remove(activeCollectionId, deletePlanId);
                  toast.success("Plan deleted");
                } catch (err: any) {
                  toast.error(err.message ?? "Failed to delete plan");
                }
                setDeletePlanId(null);
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

function AddPlanView({
  onCancel,
  onSubmit,
}: {
  onCancel: () => void;
  onSubmit: (data: CreatePlanForm) => Promise<void>;
}) {
  const [form, setForm] = useState<CreatePlanForm>({
    name: "",
    id: "",
    description: "",
    price: 0,
    interval: "monthly",
    trialPeriodDays: undefined,
    badge: "",
    isActive: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [idEdited, setIdEdited] = useState(false);

  function update<K extends keyof CreatePlanForm>(key: K, value: CreatePlanForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: "" }));
  }

  useEffect(() => {
    if (form.name && !idEdited) {
      update("id", `plan_${slugify(form.name)}_${form.interval}`);
    }
  }, [form.name, form.interval]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    const result = createPlanSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as string;
        fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit(result.data);
      toast.success("Plan created successfully");
    } catch (err: any) {
      toast.error(err.message ?? "Failed to create plan");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-6 bg-background [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] scrollbar-none">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onCancel} className="h-8 w-8 cursor-pointer">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-lg font-semibold text-foreground">Add New Plan</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Create a new subscription plan for your collection.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <Card className="shadow-none border-border/60">
          <CardHeader className="p-4 border-b border-border/50">
            <CardTitle className="text-sm font-semibold">General Details</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Plan Name *</label>
                <Input
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="e.g. Growth Monthly"
                  className="h-8 text-sm"
                />
                {errors.name && <p className="text-[10px] text-red-500">{errors.name}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Plan ID *</label>
                <Input
                  value={form.id}
                  onChange={(e) => { setIdEdited(true); update("id", e.target.value); }}
                  placeholder="e.g. plan_growth_mo"
                  className="h-8 text-sm font-mono"
                />
                {errors.id && <p className="text-[10px] text-red-500">{errors.id}</p>}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Description</label>
              <Input
                value={form.description ?? ""}
                onChange={(e) => update("description", e.target.value || undefined)}
                placeholder="Displayed on the customer checkout page"
                className="h-8 text-sm"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-none border-border/60">
          <CardHeader className="p-4 border-b border-border/50">
            <CardTitle className="text-sm font-semibold">Pricing & Billing</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Price (₦) *</label>
                <Input
                  value={form.price || ""}
                  onChange={(e) => update("price", Number(e.target.value))}
                  type="number"
                  min={0}
                  placeholder="0"
                  className="h-8 text-sm"
                  onKeyDown={(e) => { if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault(); }}
                />
                {errors.price && <p className="text-[10px] text-red-500">{errors.price}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Billing Interval *</label>
                <Select
                  value={form.interval}
                  onValueChange={(v) => { if (v) update("interval", v as CreatePlanForm["interval"]); }}
                >
                  <SelectTrigger className="h-8 w-full">
                    <SelectValue placeholder="Select interval" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                    <SelectItem value="none">One-time</SelectItem>
                    <SelectItem value="test_15min">Test (15 min)</SelectItem>
                  </SelectContent>
                </Select>
                {errors.interval && <p className="text-[10px] text-red-500">{errors.interval}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Trial Period (days)</label>
                <Input
                  value={form.trialPeriodDays ?? ""}
                  onChange={(e) => update("trialPeriodDays", e.target.value ? Number(e.target.value) : undefined)}
                  type="number"
                  min={0}
                  placeholder="0"
                  className="h-8 text-sm"
                  onKeyDown={(e) => { if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault(); }}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Badge</label>
                <Input
                  value={form.badge ?? ""}
                  onChange={(e) => update("badge", e.target.value || undefined)}
                  placeholder="e.g. Popular"
                  className="h-8 text-sm"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-xs font-medium text-foreground">Active</label>
              <button
                type="button"
                onClick={() => update("isActive", !form.isActive)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                  form.isActive ? "bg-emerald-500" : "bg-muted"
                }`}
              >
                <span
                  className={`pointer-events-none block h-4 w-4 rounded-full bg-white shadow-lg ring-0 transition-transform ${
                    form.isActive ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </CardContent>
          <CardFooter className="p-4 border-t border-border/50 flex justify-end gap-2 bg-muted/10">
            <Button type="button" variant="outline" size="sm" onClick={onCancel} className="cursor-pointer">
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={submitting} className="gap-1.5 cursor-pointer">
              <Plus className="h-3.5 w-3.5" />
              {submitting ? "Creating..." : "Create Plan"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}

function ManagePlanView({
  plan,
  onCancel,
}: {
  plan: PlanWithStats;
  onCancel: () => void;
}) {
  const { features, load: loadFeatures, attachToPlan, detachFromPlan } = useEntitlementsStore();
  const [showAddFeature, setShowAddFeature] = useState(false);
  const [selectedFeatureId, setSelectedFeatureId] = useState("");
  const [featureLimit, setFeatureLimit] = useState("");
  const [featureResetInterval, setFeatureResetInterval] = useState<string>("");

  useEffect(() => {
    loadFeatures();
  }, [loadFeatures]);

  const attachedFeatureIds = new Set(plan.features?.map((f) => f.featureId) ?? []);
  const availableFeatures = features.filter((f) => !attachedFeatureIds.has(f.id));

  const handleAttach = async () => {
    if (!selectedFeatureId) return;
    const feature = features.find((f) => f.id === selectedFeatureId);
    if (!feature) return;

    try {
      await attachToPlan({
        planId: plan.id,
        featureId: feature.id,
        type: feature.type,
        limit: feature.type === "limit" ? (featureLimit ? Number(featureLimit) : null) : null,
        resetInterval: featureResetInterval || null,
      });
      toast.success(`Attached ${feature.name} to plan`);
      setShowAddFeature(false);
      setSelectedFeatureId("");
      setFeatureLimit("");
      setFeatureResetInterval("");
      // Reload plans to refresh features
      usePlansStore.getState().fetch(plan.collectionId);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDetach = async (featureId: string) => {
    try {
      await detachFromPlan(plan.id, featureId);
      toast.success("Feature detached");
      usePlansStore.getState().fetch(plan.collectionId);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-6 bg-background [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] scrollbar-none">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onCancel} className="h-8 w-8 cursor-pointer">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-lg font-semibold text-foreground">{plan.name}</h2>
          <p className="text-sm text-muted-foreground mt-1 font-mono">{plan.id}</p>
        </div>
      </div>

      <Card className="shadow-none border-border/60 max-w-2xl">
        <CardHeader className="p-4 border-b border-border/50">
          <CardTitle className="text-sm font-semibold">Plan Details</CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Price</label>
              <p className="text-sm text-foreground">{formatCurrency(plan.priceAmount)} / {intervalLabel(plan.interval)}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Status</label>
              <p className="text-sm">
                <Badge
                  variant="outline"
                  className={`text-[10px] font-medium capitalize shadow-none border-transparent ${
                    plan.isActive
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                  }`}
                >
                  {plan.isActive ? "active" : "inactive"}
                </Badge>
              </p>
            </div>
          </div>
          {plan.description && (
            <div>
              <label className="text-xs font-medium text-muted-foreground">Description</label>
              <p className="text-sm text-foreground">{plan.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-none border-border/60 max-w-2xl">
        <CardHeader className="p-4 border-b border-border/50 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold">Features</CardTitle>
          <Button
            size="sm"
            variant="outline"
            className="h-7 gap-1.5 text-xs cursor-pointer"
            onClick={() => setShowAddFeature(!showAddFeature)}
          >
            <Plus className="h-3.5 w-3.5" />
            Add Feature
          </Button>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          {showAddFeature && (
            <div className="border border-border/50 rounded-lg p-3 space-y-3 bg-muted/20">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Select Feature</label>
                <Select value={selectedFeatureId} onValueChange={(v) => setSelectedFeatureId(v ?? "")}>
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="Choose a feature" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableFeatures.map((feature) => (
                      <SelectItem key={feature.id} value={feature.id}>
                        {feature.name} ({feature.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedFeatureId && features.find((f) => f.id === selectedFeatureId)?.type === "limit" && (
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

              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" className="h-7 text-xs cursor-pointer" onClick={() => { setShowAddFeature(false); setSelectedFeatureId(""); }}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="h-7 text-xs cursor-pointer"
                  disabled={!selectedFeatureId}
                  onClick={handleAttach}
                >
                  Attach
                </Button>
              </div>
            </div>
          )}

          {(plan.features?.length ?? 0) === 0 ? (
            <p className="text-sm text-muted-foreground">No features attached to this plan.</p>
          ) : (
            <div className="space-y-2">
              {plan.features?.map((feat) => {
                const feature = features.find((f) => f.id === feat.featureId);
                return (
                  <div key={feat.featureId} className="flex items-center justify-between py-2 px-3 border border-border/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-medium capitalize shadow-none ${
                          feat.type === "boolean"
                            ? "bg-blue-500/10 text-blue-600 hover:bg-blue-500/20"
                            : "bg-amber-500/10 text-amber-600 hover:bg-amber-500/20"
                        }`}
                      >
                        {feat.type}
                      </Badge>
                      <div>
                        <span className="text-sm font-medium text-foreground">{feature?.name ?? feat.featureId}</span>
                        <span className="text-xs text-muted-foreground ml-2 font-mono">{feat.featureId}</span>
                      </div>
                      {feat.type === "limit" && feat.limit != null && (
                        <span className="text-xs text-muted-foreground">Limit: {feat.limit.toLocaleString()}</span>
                      )}
                      {feat.resetInterval && (
                        <span className="text-xs text-muted-foreground">Resets: {feat.resetInterval}</span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDetach(feat.featureId)}
                      className="rounded p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
