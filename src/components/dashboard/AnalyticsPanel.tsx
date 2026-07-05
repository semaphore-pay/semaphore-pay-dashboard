import { TrendingDownIcon, TrendingUpIcon } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { AnalyticsSubView, AnalyticsMode, Metric } from "@/types/dashboard";
import {
  extendedOverviewMetrics,
  revenueTrend,
  arrTrend,
  subscriberTrend,
  trialTrend,
  planBreakdown,
  retentionCohorts,
} from "@/data/analytics-mock";

interface AnalyticsPanelProps {
  activeSubView: AnalyticsSubView;
  mode: AnalyticsMode;
  onModeChange: (mode: AnalyticsMode) => void;
}

function formatMetricValue(metric: Metric) {
  const value =
    metric.value >= 1000 ? metric.value.toLocaleString() : metric.value.toString();
  return `${metric.prefix ?? ""}${value}${metric.suffix ?? ""}`;
}

function MetricCard({ metric }: { metric: Metric }) {
  const isIncrease = metric.changeType === "increase";
  const TrendIcon = isIncrease ? TrendingUpIcon : TrendingDownIcon;
  const colorClass = isIncrease 
    ? "text-emerald-600 dark:text-emerald-400" 
    : "text-red-600 dark:text-red-400";

  return (
    <Card className="@container/card data-[slot=card]" data-slot="card">
      <CardHeader>
        <CardDescription>{metric.label}</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
          {formatMetricValue(metric)}
        </CardTitle>
        <CardAction>
          <Badge variant="outline" className={colorClass}>
            <TrendIcon className="mr-1 size-3.5" />
            {isIncrease ? "+" : "-"}{Math.abs(metric.change)}%
          </Badge>
        </CardAction>
      </CardHeader>
      <CardFooter className="flex-col items-start gap-1.5 text-sm">
        <div className={`line-clamp-1 flex gap-2 font-medium ${colorClass}`}>
          {isIncrease ? "Trending up" : "Trending down"} this period <TrendIcon className="size-4" />
        </div>
        <div className="text-muted-foreground">
          Compared to last period
        </div>
      </CardFooter>
    </Card>
  );
}

const chartConfigs: ChartConfig = {
  mrr: { label: "MRR", color: "var(--chart-1)" },
  arr: { label: "ARR", color: "var(--chart-3)" },
  active: { label: "Active", color: "var(--chart-1)" },
  churned: { label: "Churned", color: "var(--chart-2)" },
  trials: { label: "Active Trials", color: "var(--chart-4)" },
  conversions: { label: "Conversions", color: "var(--chart-5)" },
};

function OverviewContent() {
  return (
    <div className="flex flex-col gap-4 @container/main">
      <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
        {extendedOverviewMetrics.map(metric => (
          <MetricCard key={metric.label} metric={metric} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="shadow-none">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-semibold">MRR Trend</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <ChartContainer config={chartConfigs} className="h-35 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart accessibilityLayer data={revenueTrend}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.5} />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} fontSize={10} />
                  <YAxis tickLine={false} axisLine={false} tickMargin={8} fontSize={10} width={40} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area type="monotone" dataKey="mrr" fill="var(--color-mrr)" fillOpacity={0.1} stroke="var(--color-mrr)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-semibold">Active Subscribers</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <ChartContainer config={chartConfigs} className="h-35 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart accessibilityLayer data={subscriberTrend}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.5} />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} fontSize={10} />
                  <YAxis tickLine={false} axisLine={false} tickMargin={8} fontSize={10} width={40} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="active" fill="var(--color-active)" radius={[2, 2, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function RevenueContent() {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="shadow-none">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-semibold">MRR Trend</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <ChartContainer config={chartConfigs} className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart accessibilityLayer data={revenueTrend}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.5} />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} fontSize={10} />
                  <YAxis tickLine={false} axisLine={false} tickMargin={8} fontSize={10} width={40} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area type="monotone" dataKey="mrr" fill="var(--color-mrr)" fillOpacity={0.1} stroke="var(--color-mrr)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-semibold">ARR Trend</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <ChartContainer config={chartConfigs} className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart accessibilityLayer data={arrTrend}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.5} />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} fontSize={10} />
                  <YAxis tickLine={false} axisLine={false} tickMargin={8} fontSize={10} width={40} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area type="monotone" dataKey="arr" fill="var(--color-arr)" fillOpacity={0.1} stroke="var(--color-arr)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-none">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-xs font-semibold">Revenue by Plan</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <ChartContainer config={chartConfigs} className="h-40 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart accessibilityLayer data={planBreakdown}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.5} />
                <XAxis dataKey="planName" tickLine={false} axisLine={false} tickMargin={8} fontSize={10} />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} fontSize={10} width={40} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="mrr" fill="var(--color-mrr)" radius={[2, 2, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}

function SubscribersContent() {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="shadow-none">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-semibold">Active vs. Churned</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <ChartContainer config={chartConfigs} className="h-45 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart accessibilityLayer data={subscriberTrend}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.5} />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} fontSize={10} />
                  <YAxis tickLine={false} axisLine={false} tickMargin={8} fontSize={10} width={40} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="active" fill="var(--color-active)" radius={[2, 2, 0, 0]} maxBarSize={40} />
                  <Bar dataKey="churned" fill="var(--color-churned)" radius={[2, 2, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-semibold">Trials & Conversions</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <ChartContainer config={chartConfigs} className="h-45 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart accessibilityLayer data={trialTrend}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.5} />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} fontSize={10} />
                  <YAxis tickLine={false} axisLine={false} tickMargin={8} fontSize={10} width={40} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="trials" fill="var(--color-trials)" radius={[2, 2, 0, 0]} maxBarSize={40} />
                  <Bar dataKey="conversions" fill="var(--color-conversions)" radius={[2, 2, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function RetentionContent() {
  return (
    <Card className="shadow-none">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-xs font-semibold">Cohort Retention</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="border-b border-border text-left font-semibold text-muted-foreground">
                <th className="py-2 px-2">Cohort</th>
                <th className="py-2 px-2">Size</th>
                <th className="py-2 px-2">Month 0</th>
                <th className="py-2 px-2">Month 1</th>
                <th className="py-2 px-2">Month 2</th>
                <th className="py-2 px-2">Month 3</th>
              </tr>
            </thead>
            <tbody>
              {retentionCohorts.map(row => (
                <tr key={row.cohort} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="py-2 px-2 font-medium text-foreground">{row.cohort}</td>
                  <td className="py-2 px-2 text-muted-foreground">{row.size ?? 0}</td>
                  <td className="py-2 px-2 text-muted-foreground">
                    <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-emerald-600 dark:text-emerald-400">{row.month0}%</span>
                  </td>
                  <td className="py-2 px-2 text-muted-foreground">{row.month1 ? `${row.month1}%` : "—"}</td>
                  <td className="py-2 px-2 text-muted-foreground">{row.month2 ? `${row.month2}%` : "—"}</td>
                  <td className="py-2 px-2 text-muted-foreground">{row.month3 ? `${row.month3}%` : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

export function AnalyticsPanel({ activeSubView, mode, onModeChange }: AnalyticsPanelProps) {
  const effectiveSubView = mode === "basic" ? "overview" : activeSubView;

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4 bg-background [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      <div className="flex items-center gap-0.5 self-start rounded-md bg-muted/60 p-0.5">
        <button
          type="button"
          onClick={() => onModeChange("basic")}
          className={`rounded-[5px] px-3 py-1 text-xs font-medium transition-colors ${
            mode === "basic"
              ? "bg-background text-foreground shadow-sm ring-1 ring-border"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Basic
        </button>
        <button
          type="button"
          onClick={() => onModeChange("full")}
          className={`rounded-[5px] px-3 py-1 text-xs font-medium transition-colors ${
            mode === "full"
              ? "bg-background text-foreground shadow-sm ring-1 ring-border"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Full
        </button>
      </div>

      {effectiveSubView === "overview" && <OverviewContent />}
      {effectiveSubView === "revenue" && <RevenueContent />}
      {effectiveSubView === "subscribers" && <SubscribersContent />}
      {effectiveSubView === "retention" && <RetentionContent />}
    </div>
  );
}