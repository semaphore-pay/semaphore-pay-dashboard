# Semaphore Pay Dashboard

A modern React dashboard for managing [Semaphore Pay](https://semaphorepay.tech) — subscription billing, entitlements, and customer management.

Built with React 19, TypeScript, Vite, Tailwind CSS v4, and shadcn/ui (base-nova).

---

## Features

### Dashboard Panels
- **Overview** — Revenue, subscriptions, churn, and key metrics at a glance
- **Analytics** — Interactive charts for revenue, subscriptions, churn, ARPU, LTV
- **Entitlements** — Manage feature flags and entitlements with drag-and-drop
- **Plans** — Create and manage subscription plans with pricing tiers
- **Products** — Product catalog with CSV export and CRUD operations
- **Customers** — Customer directory with search, filters, and detail views
- **Settings** — Team settings, API keys, webhooks, and integrations
- **Profile** — User profile, security, and notification preferences

### Authentication
- **Magic Link** authentication via email
- **Phone Number** authentication via SMS
- Powered by [Better Auth](https://www.better-auth.com/) with Semaphore Pay API

### UI & UX
- Dark/Light theme with system preference detection
- Responsive sidebar navigation with collapsible sections
- Tabbed sub-views for Analytics (Overview/Revenue/Subscriptions/Churn)
- Data tables with sorting, filtering, pagination, and row selection
- Toast notifications via Sonner
- Command palette (Cmd+K) for quick navigation
- Background ripple effect on login page

### Tech Stack
| Category | Technology |
|----------|------------|
| Framework | React 19 + TypeScript |
| Build | Vite 8 |
| Styling | Tailwind CSS v4 + tw-animate-css |
| UI Components | shadcn/ui (base-nova) + Base UI |
| State | Zustand |
| Tables | TanStack React Table v8 |
| Charts | Recharts 3 |
| Routing | React Router v7 |
| Auth | Better Auth (React client) |
| API Client | @semaphore-pay/client |
| Forms | Zod + React Hook Form (via shadcn) |
| Drag & Drop | @dnd-kit |
| Notifications | Sonner |
| Icons | Lucide React |

---

## Getting Started

### Prerequisites
- Node.js 20+
- Bun (recommended) or npm/pnpm
- Semaphore Pay API credentials

### Installation

```bash
# Clone and install
git clone https://github.com/semaphore-pay/dashboard.git
cd semaphore-pay-dashboard
bun install  # or npm install
```

### Environment Variables

Create `.env.local` in the project root:

```env
VITE_API_BASE_URL=https://api.semaphorepay.tech
VITE_AUTH_BASE_URL=https://api.semaphorepay.tech
```

### Development

```bash
bun dev  # or npm run dev
```

Starts the Vite dev server at `http://localhost:5173`.

### Build

```bash
bun run build  # or npm run build
```

Outputs to `dist/` for production deployment.

### Preview Production Build

```bash
bun run preview  # or npm run preview
```

### Lint

```bash
bun run lint  # or npm run lint
```

---

## Project Structure

```
src/
├── components/
│   ├── ui/                    # shadcn/ui primitives (button, card, table, etc.)
│   ├── dashboard/             # Dashboard-specific panels & components
│   │   ├── AnalyticsPanel.tsx
│   │   ├── CustomersPanel.tsx
│   │   ├── DashboardPanels.tsx
│   │   ├── EntitlementsPanel.tsx
│   │   ├── OverviewPanel.tsx
│   │   ├── PlansPanel.tsx
│   │   ├── ProductsPanel.tsx
│   │   ├── ProfilePanel.tsx
│   │   ├── SettingsPanel.tsx
│   │   ├── Sidebar.tsx
│   │   ├── TopBar.tsx
│   │   └── ViewTabs.tsx
│   ├── chart-area-interactive.tsx
│   ├── data-table.tsx
│   ├── login-form.tsx
│   ├── Logo.tsx
│   ├── theme-provider.tsx
│   └── theme-toggle.tsx
├── hooks/
│   └── use-mobile.ts
├── lib/
│   ├── api.ts                 # Semaphore Pay API client wrapper
│   ├── auth-client.ts         # Better Auth client config
│   └── utils.ts               # cn() utility, helpers
├── pages/
│   ├── Login.tsx
│   ├── PrivacyPolicy.tsx
│   └── TermsAndConditions.tsx
├── store/                     # Zustand stores
│   ├── analytics.ts
│   ├── auth.ts
│   ├── balance.ts
│   ├── collections.ts
│   ├── customers.ts
│   ├── dashboard.ts
│   ├── entitlements.ts
│   ├── plans.ts
│   └── products.ts
├── types/
│   └── dashboard.ts
├── App.tsx                    # Routes + ProtectedRoute + Dashboard layout
├── main.tsx                   # Entry point (ThemeProvider, Router, Toaster)
└── index.css                  # Tailwind v4 + CSS variables theme
```

---

## Key Integrations

### Semaphore Pay API Client
```typescript
// src/lib/api.ts
import { createClient } from '@semaphore-pay/client';

export const api = createClient({
  baseUrl: import.meta.env.VITE_API_BASE_URL,
  // Auth handled via Better Auth session
});
```

### Better Auth Configuration
```typescript
// src/lib/auth-client.ts
import { createAuthClient } from 'better-auth/react';
import { magicLinkClient, phoneNumberClient } from 'better-auth/client/plugins';

export const authClient = createAuthClient({
  baseURL: 'https://api.semaphorepay.tech',
  plugins: [magicLinkClient(), phoneNumberClient()],
});
```

### Protected Routes
```tsx
// src/App.tsx - ProtectedRoute wraps authenticated routes
function ProtectedRoute({ children }) {
  const { data: session } = authClient.useSession();
  // Syncs session to Zustand auth store
  // Redirects to /login if unauthenticated
}
```

---

## Theming

Tailwind CSS v4 with CSS variables for theming. Configure in `src/index.css`:

```css
@import "tailwindcss";
@plugin "tailwindcss-animate";

@theme {
  --color-background: #ffffff;
  --color-foreground: #0a0a0a;
  /* ... */
}

.dark {
  --color-background: #0a0a0a;
  --color-foreground: #fafafa;
  /* ... */
}
```

Toggle theme via `ThemeToggle` component (persists to `localStorage`).

---

## Scripts

| Command | Description |
|---------|-------------|
| `bun dev` | Start dev server |
| `bun run build` | Type-check + production build |
| `bun run lint` | ESLint |
| `bun run preview` | Preview production build |

---

## Deployment

Build output in `dist/` — deploy to any static host (Vercel, Netlify, Cloudflare Pages, etc.).

---

## Links

- [Semaphore Pay Dashboard](https://dashboard.semaphorepay.tech) (production)
- [Semaphore Pay API Docs](https://docs.semaphorepay.tech)
- [Better Auth Docs](https://www.better-auth.com/docs)
- [shadcn/ui Docs](https://ui.shadcn.com)

