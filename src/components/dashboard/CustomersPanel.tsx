import { useMemo } from "react";
import {
  MoreHorizontal,
  ArrowLeft,
  Save,
  Mail,
  Phone,
  MapPin,
  CreditCard,
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
import { useCustomersStore, useDashboardStore } from "@/store";

function resolveCountryFromData(phone?: string, ip?: string) {
  if (phone?.startsWith("+234") || ip?.startsWith("102.")) return { code: "NG", name: "Nigeria", flag: "🇳🇬" };
  if (phone?.startsWith("+1") || ip?.startsWith("104.")) return { code: "US", name: "United States", flag: "🇺🇸" };
  if (phone?.startsWith("+44") || ip?.startsWith("82.")) return { code: "GB", name: "United Kingdom", flag: "🇬🇧" };
  if (phone?.startsWith("+49") || ip?.startsWith("31.")) return { code: "DE", name: "Germany", flag: "🇩🇪" };
  return { code: "UN", name: "Unknown", flag: "🌍" };
}

const overviewStats = [
  { label: "Total Customers", value: "12,482", change: 12.5, isIncrease: true },
  { label: "Global Reach", value: "42", suffix: " Countries", change: 2.1, isIncrease: true },
  { label: "Past Due", value: "142", change: 5.4, isIncrease: false },
];

const mockCustomers = [
  { id: "cus_9238f4j2", name: "Samuel Ayibatarri", email: "samuel@example.com", phone: "+2348012345678", ipAddress: "102.89.34.12", status: "active", mrr: 4900, joined: "2026-04-12" },
  { id: "cus_38nf29xk", name: "Sarah Jenkins", email: "s.jenkins@acme.inc", phone: "+14155552671", ipAddress: "104.28.19.44", status: "active", mrr: 19900, joined: "2026-05-01" },
  { id: "cus_882md90p", name: "Liam O'Connor", email: "liam.oconnor@domain.co.uk", phone: "+447700900077", ipAddress: "82.132.21.1", status: "past_due", mrr: 4900, joined: "2026-02-18" },
  { id: "cus_unkn2049", name: "Hidden User", email: "hidden@proxy.net", phone: "", ipAddress: "192.168.1.1", status: "inactive", mrr: 0, joined: "2026-06-20" },
];

type Customer = typeof mockCustomers[0];

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(cents / 100);
}

export function CustomersPanel() {
  const { customersView, searchQuery } = useDashboardStore();
  const { selectedCustomer, openManage, goBack } = useCustomersStore();

  const filteredCustomers = useMemo(() => {
    if (!searchQuery) return mockCustomers;
    const q = searchQuery.toLowerCase();
    return mockCustomers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q) ||
        c.status.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const columns: ColumnDef<Customer>[] = [
    {
      id: "drag",
      header: () => null,
      cell: ({ row }) => <DragHandle id={row.original.id} />,
    },
    {
      accessorKey: "name",
      header: "Customer",
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-foreground">{row.original.name}</div>
          <div className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
            <Mail className="h-3 w-3" /> {row.original.email}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "location",
      header: "Location",
      cell: ({ row }) => {
        const location = resolveCountryFromData(row.original.phone, row.original.ipAddress);
        return (
          <div className="flex items-center gap-1.5">
            <span className="text-sm" title={location.name}>{location.flag}</span>
            <span className="text-xs font-medium text-foreground">{location.code}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const isPastDue = row.original.status === "past_due";
        const isActive = row.original.status === "active";
        return (
          <Badge
            variant="outline"
            className={`text-[10px] font-medium capitalize shadow-none border-transparent ${
              isActive
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : isPastDue
                ? "bg-red-500/10 text-red-600 dark:text-red-400"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {row.original.status.replace("_", " ")}
          </Badge>
        );
      },
    },
    {
      accessorKey: "mrr",
      header: "MRR",
      cell: ({ row }) => <span className="text-xs font-medium text-foreground">{formatCurrency(row.original.mrr)}</span>,
    },
    {
      accessorKey: "joined",
      header: "Joined",
      cell: ({ row }) => <span className="text-[11px] text-muted-foreground">{row.original.joined}</span>,
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
    const location = resolveCountryFromData(
      (selectedCustomer as any).phone,
      (selectedCustomer as any).ipAddress,
    );

    return (
      <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-6 bg-background [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={goBack} className="h-8 w-8 cursor-pointer">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-lg font-semibold text-foreground">{(selectedCustomer as any).name}</h2>
            <p className="text-sm text-muted-foreground mt-1 font-mono">
              {(selectedCustomer as any).id}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-none border-border/60">
              <CardHeader className="p-4 border-b border-border/50">
                <CardTitle className="text-sm font-semibold">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground">Full Name</label>
                    <Input defaultValue={(selectedCustomer as any).name} className="h-8 text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                      <Input defaultValue={(selectedCustomer as any).email} className="h-8 pl-8 text-sm" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                      <Input defaultValue={(selectedCustomer as any).phone} className="h-8 pl-8 text-sm font-mono" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground">Last Known IP</label>
                    <Input defaultValue={(selectedCustomer as any).ipAddress} disabled className="h-8 text-sm font-mono bg-muted/50" />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-4 border-t border-border/50 flex justify-end gap-2 bg-muted/10">
                <Button size="sm" className="gap-1.5 cursor-pointer">
                  <Save className="h-3.5 w-3.5" />
                  Update Profile
                </Button>
              </CardFooter>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="shadow-none border-border/60 bg-muted/20">
              <CardHeader className="p-4 border-b border-border/50">
                <CardTitle className="text-sm font-semibold">Resolved Data</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-md bg-background p-1.5 border border-border">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-foreground">Inferred Location</p>
                    <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
                      {location.flag} {location.name} ({location.code})
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-md bg-background p-1.5 border border-border">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-foreground">Lifetime Value</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatCurrency((selectedCustomer as any).mrr * 3)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-6 bg-background [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold text-foreground">Customers</h2>
        <p className="text-sm text-muted-foreground">
          Manage your user base, view subscription status, and analyze customer locations.
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
                    {stat.value}{stat.suffix || ""}
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
        data={filteredCustomers}
      />
    </div>
  );
}
