import { MoreHorizontal, ArrowUpDown } from "lucide-react"
import { allTasks } from "@/data/mock"
import type { Task } from "@/types/dashboard"

const priorityBadge: Record<string, string> = {
  low: "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400",
  medium: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400",
  high: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  critical: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
}

const statusLabel: Record<string, string> = {
  backlog: "Backlog",
  todo: "To Do",
  "in-progress": "In Progress",
  review: "Review",
  done: "Done",
}

function TaskRow({ task }: { task: Task }) {
  return (
    <tr className="border-b border-border hover:bg-muted/50 transition-colors">
      <td className="py-2 px-3">
        <span className="text-xs font-medium text-foreground">{task.title}</span>
      </td>
      <td className="py-2 px-3">
        <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${priorityBadge[task.priority]}`}>
          {task.priority}
        </span>
      </td>
      <td className="py-2 px-3">
        <span className="text-xs text-muted-foreground">{statusLabel[task.status]}</span>
      </td>
      <td className="py-2 px-3">
        <div className="flex items-center gap-1.5">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#7E5DFC] text-[10px] font-medium text-white">
            {task.assignee.split(" ").map((n) => n[0]).join("").slice(0, 2)}
          </span>
          <span className="text-xs text-muted-foreground">{task.assignee}</span>
        </div>
      </td>
      <td className="py-2 px-3">
        <span className="text-xs text-muted-foreground">{task.project}</span>
      </td>
      <td className="py-2 px-3">
        <span className="text-xs text-muted-foreground">{task.dueDate}</span>
      </td>
      <td className="py-2 px-3">
        <button type="button" className="rounded p-0.5 text-muted-foreground hover:text-foreground">
          <MoreHorizontal className="h-3.5 w-3.5" />
        </button>
      </td>
    </tr>
  )
}

export function ListPanel() {
  return (
    <div className="flex flex-1 flex-col overflow-auto p-4">
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              {["Task", "Priority", "Status", "Assignee", "Project", "Due Date", ""].map((h) => (
                <th key={h} className="py-2 px-3 text-left text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                  {h ? (
                    <div className="flex items-center gap-1">
                      {h}
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  ) : null}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {allTasks.map((task) => (
              <TaskRow key={task.id} task={task} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}