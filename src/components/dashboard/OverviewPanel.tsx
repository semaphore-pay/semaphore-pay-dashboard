import { ArrowDown, ArrowUp, Clock, CheckCircle2, Circle, BarChart4 } from "lucide-react"
import { metrics, chartData, recentActivity, projects } from "@/data/mock"

function StatCard({ label, value, change, changeType, prefix }: {
  label: string
  value: number
  change: number
  changeType: "increase" | "decrease"
  prefix?: string
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="mt-1 flex items-baseline gap-1.5">
        <span className="text-xl font-semibold text-foreground">
          {prefix}{value}
        </span>
        <span className={`inline-flex items-center gap-0.5 text-xs ${changeType === "increase" ? "text-emerald-500" : "text-red-500"}`}>
          {changeType === "increase" ? (
            <ArrowUp className="h-3 w-3" />
          ) : (
            <ArrowDown className="h-3 w-3" />
          )}
          {change}
        </span>
      </div>
    </div>
  )
}

function BarChart() {
  const maxValue = Math.max(...chartData.map((d) => d.created + d.completed))
  const chartHeight = 96

  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-foreground">Task Activity</span>
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-brand" />
            Created
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Completed
          </span>
        </div>
      </div>
      <div className="flex items-end justify-between gap-1" style={{ height: `${chartHeight}px` }}>
        {chartData.map((point) => {
          const completedHeight = (point.completed / maxValue) * chartHeight
          const createdHeight = (point.created / maxValue) * chartHeight
          return (
            <div key={point.name} className="flex flex-1 flex-col items-center gap-1 justify-end">
              <div className="flex w-full items-end justify-center gap-[2px]">
                <div
                  className="w-2.5 rounded-t-sm bg-emerald-400"
                  style={{ height: `${completedHeight}px` }}
                />
                <div
                  className="w-2.5 rounded-t-sm bg-brand"
                  style={{ height: `${createdHeight}px` }}
                />
              </div>
              <span className="text-[10px] text-muted-foreground">{point.name}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ActivityFeed() {
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <div className="flex items-center gap-1.5 mb-2">
        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-xs font-medium text-foreground">Recent Activity</span>
      </div>
      <div className="flex flex-col gap-2">
        {recentActivity.map((a) => (
          <div key={a.id} className="flex items-start gap-2">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand text-[10px] font-medium text-brand-foreground">
              {a.userAvatar}
            </span>
            <div className="min-w-0 flex-1">
              <span className="text-xs">
                <span className="font-medium text-foreground">{a.user}</span>{" "}
                <span className="text-muted-foreground">{a.action}</span>{" "}
                <span className="font-medium text-foreground">{a.target}</span>
              </span>
              <span className="block text-[10px] text-muted-foreground">{a.timestamp}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ProjectList() {
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <div className="flex items-center gap-1.5 mb-2">
        <BarChart4 className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-xs font-medium text-foreground">Active Projects</span>
      </div>
      <div className="flex flex-col gap-2">
        {projects.map((p) => {
          const pct = p.taskCount > 0 ? Math.round((p.completedCount / p.taskCount) * 100) : 0
          return (
            <div key={p.id} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-foreground">{p.name}</span>
                <span className="text-[10px] text-muted-foreground">{pct}%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted">
                <div
                  className="h-1.5 rounded-full"
                  style={{ width: `${pct}%`, backgroundColor: p.color }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function OverviewPanel() {
  return (
    <div className="flex flex-1 gap-4 overflow-auto p-4">
      {/* Left column: stats + chart + details */}
      <div className="flex flex-1 flex-col gap-4">
        <div className="grid grid-cols-4 gap-3">
          {metrics.map((m) => (
            <StatCard key={m.label} {...m} />
          ))}
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <BarChart />
          </div>
          <ActivityFeed />
        </div>
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "Avg. Completion", value: "3.2d", icon: CheckCircle2 },
            { label: "Backlog Items", value: "12", icon: Circle },
            { label: "Team Velocity", value: "18/wk", icon: BarChart4 },
            { label: "Open PRs", value: "8", icon: Circle },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="flex items-center gap-2 rounded-lg border border-border bg-card p-3">
              <Icon className="h-4 w-4 text-muted-foreground" />
              <div>
                <span className="text-xs text-muted-foreground">{label}</span>
                <span className="ml-1 text-xs font-medium text-foreground">{value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Right sidebar: projects */}
      <div className="w-60 shrink-0">
        <ProjectList />
      </div>
    </div>
  )
}