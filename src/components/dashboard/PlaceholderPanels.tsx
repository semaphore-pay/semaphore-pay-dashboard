import { Calendar, Table2, FolderClosed, GanttChartSquare } from "lucide-react"

function PlaceholderPanel({ label, icon: Icon }: { label: string; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <div className="flex flex-col items-center gap-2 text-muted-foreground">
        <Icon className="h-10 w-10" />
        <span className="text-sm font-medium">{label}</span>
        <span className="text-xs">Coming soon</span>
      </div>
    </div>
  )
}

export function CalendarPanel() {
  return <PlaceholderPanel label="Calendar" icon={Calendar} />
}

export function TablePanel() {
  return <PlaceholderPanel label="Table" icon={Table2} />
}

export function FoldersPanel() {
  return <PlaceholderPanel label="Folders" icon={FolderClosed} />
}

export function TimelinePanel() {
  return <PlaceholderPanel label="Timeline" icon={GanttChartSquare} />
}