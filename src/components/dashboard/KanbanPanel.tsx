import { MoreHorizontal, Plus, Paperclip, MessageSquare } from "lucide-react"
import { backlogTasks, todoTasks, inProgressTasks, reviewTasks, doneTasks } from "@/data/mock"
import type { Task } from "@/types/dashboard"

const statusColors: Record<string, string> = {
  backlog: "bg-status-backlog",
  todo: "bg-status-todo",
  "in-progress": "bg-status-in-progress",
  review: "bg-status-review",
  done: "bg-status-done",
}

const statusHeaders: Record<string, { label: string; color: string }> = {
  backlog: { label: "Backlog", color: "border-status-backlog" },
  todo: { label: "To Do", color: "border-status-todo" },
  "in-progress": { label: "In Progress", color: "border-status-in-progress" },
  review: { label: "Review", color: "border-status-review" },
  done: { label: "Done", color: "border-status-done" },
}

const priorityBadge: Record<string, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400",
  high: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  critical: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
}

function TaskCard({ task }: { task: Task }) {
  // Deterministic pseudo-random based on task ID
  const attachmentCount = task.id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % 3
  const commentCount = task.id.split("").reduce((acc, c) => acc + c.charCodeAt(0) * 2, 0) % 5
  return (
    <div className="rounded-lg border border-border bg-card p-2.5 flex flex-col gap-2 cursor-pointer hover:border-muted-foreground/30 transition-colors">
      <div className="flex items-start justify-between">
        <span className="text-xs font-medium text-foreground leading-snug">{task.title}</span>
        <button type="button" className="rounded p-0.5 text-muted-foreground hover:text-foreground">
          <MoreHorizontal className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-1">
        <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${priorityBadge[task.priority]}`}>
          {task.priority}
        </span>
        {task.tags.map((tag) => (
          <span key={tag} className="rounded border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground">
            {tag}
          </span>
        ))}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-0.5">
            <Paperclip className="h-3 w-3" />
            {attachmentCount}
          </span>
          <span className="flex items-center gap-0.5">
            <MessageSquare className="h-3 w-3" />
            {commentCount}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-muted-foreground">{task.dueDate}</span>
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#7E5DFC] text-[10px] font-medium text-white">
            {task.assignee.split(" ").map((n) => n[0]).join("").slice(0, 2)}
          </span>
        </div>
      </div>
    </div>
  )
}

function KanbanColumn({ status, tasks }: { status: string; tasks: Task[] }) {
  const header = statusHeaders[status]
  return (
    <div className="flex w-56 shrink-0 flex-col rounded-lg border-t-2 bg-muted/30 p-2 gap-2" style={{ borderTopColor: header.color.replace("border-", "") }}>
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5">
          <span className={`h-2 w-2 rounded-full ${statusColors[status]}`} />
          <span className="text-xs font-medium text-foreground">{header.label}</span>
          <span className="rounded-full bg-muted px-1.5 text-[10px] text-muted-foreground">{tasks.length}</span>
        </div>
        <button type="button" className="rounded p-0.5 text-muted-foreground hover:text-foreground">
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="flex flex-col gap-2 overflow-auto">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    </div>
  )
}

export function KanbanPanel() {
  const columns: [string, Task[]][] = [
    ["backlog", backlogTasks],
    ["todo", todoTasks],
    ["in-progress", inProgressTasks],
    ["review", reviewTasks],
    ["done", doneTasks],
  ]

  return (
    <div className="flex flex-1 gap-3 overflow-auto p-4">
      {columns.map(([status, tasks]) => (
        <KanbanColumn key={status} status={status} tasks={tasks} />
      ))}
    </div>
  )
}