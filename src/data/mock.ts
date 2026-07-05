import type {
  Task,
  Metric,
  Activity,
  Project,
  ChartDataPoint,
} from "@/types/dashboard"

export const metrics: Metric[] = [
  {
    label: "Total Tasks",
    value: 248,
    change: 12,
    changeType: "increase",
  },
  {
    label: "Completed",
    value: 186,
    change: 24,
    changeType: "increase",
  },
  {
    label: "In Progress",
    value: 42,
    change: 8,
    changeType: "decrease",
  },
  {
    label: "Overdue",
    value: 14,
    change: 3,
    changeType: "increase",
  },
]

export const projects: Project[] = [
  {
    id: "p1",
    name: "Q3 Platform Redesign",
    color: "#7E5DFC",
    taskCount: 64,
    completedCount: 48,
  },
  {
    id: "p2",
    name: "Mobile App v2",
    color: "#FC7763",
    taskCount: 52,
    completedCount: 34,
  },
  {
    id: "p3",
    name: "API Migration",
    color: "#4FD9DB",
    taskCount: 38,
    completedCount: 30,
  },
  {
    id: "p4",
    name: "Documentation",
    color: "#E23FD1",
    taskCount: 28,
    completedCount: 22,
  },
]

export const chartData: ChartDataPoint[] = [
  { name: "Jan", completed: 32, created: 45 },
  { name: "Feb", completed: 28, created: 40 },
  { name: "Mar", completed: 41, created: 52 },
  { name: "Apr", completed: 35, created: 38 },
  { name: "May", completed: 48, created: 55 },
  { name: "Jun", completed: 42, created: 50 },
  { name: "Jul", completed: 16, created: 24 },
]

export const recentActivity: Activity[] = [
  {
    id: "a1",
    user: "Alex Smith",
    userAvatar: "AS",
    action: "completed",
    target: "Payment API integration",
    timestamp: "2 minutes ago",
  },
  {
    id: "a2",
    user: "Jamie Chen",
    userAvatar: "JC",
    action: "created",
    target: "User onboarding flow",
    timestamp: "15 minutes ago",
  },
  {
    id: "a3",
    user: "Morgan Lee",
    userAvatar: "ML",
    action: "commented on",
    target: "Dashboard redesign spec",
    timestamp: "1 hour ago",
  },
  {
    id: "a4",
    user: "Taylor Reed",
    userAvatar: "TR",
    action: "moved",
    target: "Error handling module to Review",
    timestamp: "2 hours ago",
  },
  {
    id: "a5",
    user: "Alex Smith",
    userAvatar: "AS",
    action: "assigned",
    target: "Billing report export",
    timestamp: "3 hours ago",
  },
]

export const backlogTasks: Task[] = [
  {
    id: "t1",
    title: "Design onboarding flow",
    description: "Create wireframes and hi-fi mockups for the new user onboarding experience.",
    status: "backlog",
    priority: "medium",
    assignee: "Jamie Chen",
    dueDate: "Jul 18",
    tags: ["design", "ux"],
    project: "Q3 Platform Redesign",
  },
  {
    id: "t2",
    title: "Set up staging environment",
    description: "Deploy a staging environment mirroring production for QA testing.",
    status: "backlog",
    priority: "high",
    assignee: "Morgan Lee",
    dueDate: "Jul 12",
    tags: ["devops", "infra"],
    project: "API Migration",
  },
  {
    id: "t3",
    title: "Write API documentation",
    description: "Document all v2 endpoints with request/response examples.",
    status: "backlog",
    priority: "low",
    assignee: "Taylor Reed",
    dueDate: "Jul 25",
    tags: ["docs"],
    project: "Documentation",
  },
]

export const todoTasks: Task[] = [
  {
    id: "t4",
    title: "Implement payment gateway",
    description: "Integrate Stripe payment processing with webhook handling and idempotency.",
    status: "todo",
    priority: "critical",
    assignee: "Alex Smith",
    dueDate: "Jul 8",
    tags: ["backend", "payments"],
    project: "Mobile App v2",
  },
  {
    id: "t5",
    title: "Build notification service",
    description: "Create a pub/sub notification service supporting email, push, and in-app channels.",
    status: "todo",
    priority: "high",
    assignee: "Morgan Lee",
    dueDate: "Jul 10",
    tags: ["backend", "api"],
    project: "Q3 Platform Redesign",
  },
  {
    id: "t6",
    title: "Create dashboard widgets",
    description: "Develop reusable dashboard widget components with real-time data binding.",
    status: "todo",
    priority: "medium",
    assignee: "Jamie Chen",
    dueDate: "Jul 14",
    tags: ["frontend", "components"],
    project: "Q3 Platform Redesign",
  },
]

export const inProgressTasks: Task[] = [
  {
    id: "t7",
    title: "Refactor auth middleware",
    description: "Migrate auth to JWT-based session management with refresh token rotation.",
    status: "in-progress",
    priority: "high",
    assignee: "Alex Smith",
    dueDate: "Jul 6",
    tags: ["backend", "auth"],
    project: "API Migration",
  },
  {
    id: "t8",
    title: "Mobile navigation redesign",
    description: "Redesign bottom navigation with new gesture-based interactions.",
    status: "in-progress",
    priority: "medium",
    assignee: "Jamie Chen",
    dueDate: "Jul 9",
    tags: ["mobile", "design"],
    project: "Mobile App v2",
  },
  {
    id: "t9",
    title: "Performance audit",
    description: "Run Lighthouse audit and optimize Core Web Vitals across all pages.",
    status: "in-progress",
    priority: "high",
    assignee: "Taylor Reed",
    dueDate: "Jul 5",
    tags: ["performance", "frontend"],
    project: "Q3 Platform Redesign",
  },
]

export const reviewTasks: Task[] = [
  {
    id: "t10",
    title: "Database migration script",
    description: "Prepare migration scripts with rollback plans for the new schema.",
    status: "review",
    priority: "critical",
    assignee: "Morgan Lee",
    dueDate: "Jul 4",
    tags: ["database", "migration"],
    project: "API Migration",
  },
  {
    id: "t11",
    title: "Terms of service update",
    description: "Review and finalize updated TOS for the Q3 launch.",
    status: "review",
    priority: "medium",
    assignee: "Taylor Reed",
    dueDate: "Jul 7",
    tags: ["legal", "docs"],
    project: "Documentation",
  },
]

export const doneTasks: Task[] = [
  {
    id: "t12",
    title: "Fix session timeout bug",
    description: "Increased session timeout from 15min to 2hrs with sliding expiration.",
    status: "done",
    priority: "high",
    assignee: "Alex Smith",
    dueDate: "Jul 2",
    tags: ["backend", "bug"],
    project: "API Migration",
  },
  {
    id: "t13",
    title: "Update color system",
    description: "Refactored design tokens to use oklch color space for perceptual uniformity.",
    status: "done",
    priority: "medium",
    assignee: "Jamie Chen",
    dueDate: "Jul 1",
    tags: ["design", "tokens"],
    project: "Q3 Platform Redesign",
  },
  {
    id: "t14",
    title: "Add CSV export feature",
    description: "Added CSV export button to all table views with column customization.",
    status: "done",
    priority: "medium",
    assignee: "Taylor Reed",
    dueDate: "Jul 1",
    tags: ["feature", "export"],
    project: "Mobile App v2",
  },
]

export const allTasks: Task[] = [
  ...backlogTasks,
  ...todoTasks,
  ...inProgressTasks,
  ...reviewTasks,
  ...doneTasks,
]