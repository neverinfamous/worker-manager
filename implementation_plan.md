# Worker Manager: Cloudflare Pages & Workers Management Platform

A full-featured, self-hosted web application for managing Cloudflare Pages projects and Workers scripts. This plan establishes feature parity with the existing manager fleet (d1-manager, do-manager, kv-manager) while addressing the unique requirements of Worker/Page lifecycle management.

## User Review Required

> [!IMPORTANT]
> **Workers vs Pages Scope Decision Required**
> 
> Cloudflare has two closely related but distinct deployment targets:
> - **Workers**: Individual script-based serverless functions
> - **Pages**: Full-stack applications with static assets + Functions
> 
> This plan covers **both** under a unified interface. Please confirm if you want:
> 1. **Combined** - Single app managing both Workers and Pages (recommended)
> 2. **Workers Only** - Focus solely on Workers scripts
> 3. **Pages Only** - Focus solely on Pages projects

> [!WARNING]
> **Cloudflare API Limitations**
> 
> Some features have API constraints that affect implementation:
> - **Worker Script Content**: Can be read via API but requires multipart handling
> - **Live Editing**: Workers cannot be hot-edited in production; requires redeployment
> - **Pages Git Integration**: Projects linked to Git cannot have direct file uploads
> - **Secrets**: Can be set but NOT read back from API (write-only)

---

## Proposed Features

### Core Management (CRUD)
| Feature | Workers | Pages | Notes |
|---------|---------|-------|-------|
| List all | ✅ | ✅ | Via REST API |
| View details | ✅ | ✅ | Metadata, bindings, routes |
| Create new | ✅ | ✅ | Via wizard with templates |
| Clone | ✅ | ✅ | Export + re-import with new name |
| Delete | ✅ | ✅ | With R2 safety backup |
| Download/Export | ✅ | ✅ | Script content + config as ZIP |

### Configuration Tabs (Edit Wizard)
| Tab | Description | API Support |
|-----|-------------|-------------|
| **General** | Name, compatibility date/flags | ✅ Full |
| **Domains & Routes** | Custom domains, route patterns, workers.dev subdomain | ✅ Full |
| **Environment** | Variables (plain text), Secrets (write-only) | ⚠️ Secrets are write-only |
| **Bindings** | View-only list of KV/D1/R2/DO/Queue bindings | ✅ Read-only (editing deferred to CloudHub) |
| **Triggers** | Cron schedules, email triggers | ✅ Full |
| **Observability** | Logpush destinations, tail workers | ✅ Full |
| **Access** | Linked Cloudflare Access policies | ⚠️ Requires Zero Trust API |

### Operational Features
| Feature | Description |
|---------|-------------|
| **Metrics Dashboard** | Request volume, CPU time, latency (P50/P90/P99) via GraphQL Analytics |
| **Deployment History** | List past deployments with rollback capability |
| **Health Monitoring** | Active alarms, error rates, quota usage |
| **Job History** | All operations tracked in D1 with timestamps |
| **Webhooks** | HTTP notifications for deployments, errors, job completions |
| **R2 Backups** | Export Worker/Page config to R2 before destructive ops |

### Additional Suggested Features
| Feature | Rationale |
|---------|-----------|
| **Tail Logs Viewer** | Real-time log streaming for debugging |
| **Preview URL Management** | Quick access to preview deployments (Pages) |
| **Version Comparison** | Diff between Worker versions |
| **Template Gallery** | Quick-start templates for common patterns |
| **Bulk Operations** | Multi-select Workers/Pages for batch actions |

---

## Proposed Changes

### Project Structure

```
worker-manager/
├── src/                          # Frontend (React 19 + TypeScript 5.9)
│   ├── components/
│   │   ├── ui/                   # shadcn/ui components
│   │   ├── layout/               # Header, Navigation, Sidebar
│   │   ├── workers/              # Worker-specific components
│   │   │   ├── WorkerCard.tsx
│   │   │   ├── WorkerListView.tsx
│   │   │   ├── WorkerDetailView.tsx
│   │   │   ├── CreateWorkerWizard.tsx
│   │   │   ├── EditWorkerWizard.tsx
│   │   │   └── CloneWorkerDialog.tsx
│   │   ├── pages/                # Pages-specific components
│   │   │   ├── PageCard.tsx
│   │   │   ├── PageListView.tsx
│   │   │   ├── PageDetailView.tsx
│   │   │   ├── CreatePageWizard.tsx
│   │   │   ├── EditPageWizard.tsx
│   │   │   └── ClonePageDialog.tsx
│   │   ├── shared/               # Shared components
│   │   │   ├── DomainsTab.tsx
│   │   │   ├── EnvironmentTab.tsx
│   │   │   ├── TriggersTab.tsx
│   │   │   ├── BindingsTab.tsx
│   │   │   └── ObservabilityTab.tsx
│   │   ├── metrics/              # Metrics dashboard
│   │   │   ├── MetricsDashboard.tsx
│   │   │   └── MetricsChart.tsx
│   │   ├── jobs/                 # Job history
│   │   │   ├── JobHistory.tsx
│   │   │   └── JobHistoryDialog.tsx
│   │   └── webhooks/             # Webhook management
│   │       └── WebhookManager.tsx
│   ├── contexts/                 # React contexts
│   │   └── ThemeContext.tsx
│   ├── hooks/                    # Custom hooks
│   │   ├── useCache.ts
│   │   └── useWorkers.ts
│   ├── services/                 # API clients
│   │   ├── api.ts                # Main API service
│   │   ├── auth.ts               # Auth utilities
│   │   ├── workersApi.ts         # Workers-specific API
│   │   ├── pagesApi.ts           # Pages-specific API
│   │   └── webhookApi.ts         # Webhook API
│   ├── lib/                      # Utilities
│   │   ├── utils.ts              # shadcn utils
│   │   ├── cache.ts              # Client-side caching
│   │   └── logger.ts             # Frontend logger
│   ├── types/                    # TypeScript types
│   │   ├── worker.ts
│   │   ├── page.ts
│   │   └── common.ts
│   ├── App.tsx                   # Main application
│   ├── main.tsx                  # Entry point
│   └── index.css                 # Tailwind styles
├── worker/                       # Backend (Cloudflare Worker)
│   ├── routes/
│   │   ├── workers.ts            # Worker CRUD endpoints
│   │   ├── pages.ts              # Pages CRUD endpoints
│   │   ├── domains.ts            # Custom domain management
│   │   ├── routes.ts             # Route configuration
│   │   ├── secrets.ts            # Secrets management
│   │   ├── triggers.ts           # Cron trigger management
│   │   ├── deployments.ts        # Deployment history
│   │   ├── metrics.ts            # GraphQL analytics proxy
│   │   ├── jobs.ts               # Job history
│   │   ├── webhooks.ts           # Webhook management
│   │   ├── r2-backup.ts          # R2 backup/restore
│   │   └── health.ts             # Health endpoints
│   ├── utils/
│   │   ├── cors.ts               # CORS headers
│   │   ├── auth.ts               # Cloudflare Access validation
│   │   ├── error-logger.ts       # Centralized error logging
│   │   ├── job-tracking.ts       # Job tracking utilities
│   │   └── webhook-trigger.ts    # Webhook dispatch
│   ├── types/
│   │   └── index.ts              # Worker environment types
│   ├── schema.sql                # D1 database schema
│   ├── migrations/               # Schema migrations
│   └── index.ts                  # Worker entry point
├── .github/
│   └── workflows/                # CI/CD workflows
├── components.json               # shadcn/ui config
├── tailwind.config.js            # Tailwind CSS 4 config
├── vite.config.ts                # Vite configuration
├── tsconfig.json                 # TypeScript config
├── eslint.config.js              # ESLint strict config
├── wrangler.toml                 # Production config
├── wrangler.dev.toml             # Development config
├── wrangler.toml.example         # Example config
├── package.json                  # Dependencies
└── README.md                     # Documentation
```

---

### D1 Database Schema

```sql
-- Metadata for Workers (shadow registry)
CREATE TABLE IF NOT EXISTS workers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    script_name TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    color TEXT,
    notes TEXT
);

-- Metadata for Pages projects (shadow registry)
CREATE TABLE IF NOT EXISTS pages_projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    subdomain TEXT,
    production_branch TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    color TEXT,
    notes TEXT
);

-- Job history tracking
CREATE TABLE IF NOT EXISTS jobs (
    id TEXT PRIMARY KEY,
    operation_type TEXT NOT NULL,
    entity_type TEXT NOT NULL, -- 'worker' or 'page'
    entity_id TEXT,
    entity_name TEXT,
    status TEXT NOT NULL DEFAULT 'running',
    progress INTEGER DEFAULT 0,
    item_count INTEGER DEFAULT 0,
    started_at TEXT DEFAULT (datetime('now')),
    completed_at TEXT,
    error_message TEXT,
    user_email TEXT
);

-- Job events for detailed tracking
CREATE TABLE IF NOT EXISTS job_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    job_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    message TEXT,
    timestamp TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (job_id) REFERENCES jobs(id)
);

-- Webhook configurations
CREATE TABLE IF NOT EXISTS webhooks (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    events TEXT NOT NULL, -- JSON array of event types
    secret TEXT,
    enabled INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- R2 backup records
CREATE TABLE IF NOT EXISTS backups (
    id TEXT PRIMARY KEY,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    entity_name TEXT NOT NULL,
    r2_key TEXT NOT NULL,
    backup_type TEXT NOT NULL, -- 'manual', 'pre_delete', 'scheduled'
    size_bytes INTEGER,
    created_at TEXT DEFAULT (datetime('now')),
    created_by TEXT
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_workers_name ON workers(name);
CREATE INDEX IF NOT EXISTS idx_pages_projects_name ON pages_projects(name);
CREATE INDEX IF NOT EXISTS idx_jobs_entity ON jobs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_backups_entity ON backups(entity_type, entity_id);
```

---

### Key API Endpoints

#### Workers
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/workers` | GET | List all Workers |
| `/api/workers` | POST | Create new Worker |
| `/api/workers/:name` | GET | Get Worker details |
| `/api/workers/:name` | PUT | Update Worker |
| `/api/workers/:name` | DELETE | Delete Worker |
| `/api/workers/:name/clone` | POST | Clone Worker |
| `/api/workers/:name/export` | GET | Export Worker as ZIP |
| `/api/workers/:name/domains` | GET/POST/DELETE | Manage custom domains |
| `/api/workers/:name/routes` | GET/POST/DELETE | Manage routes |
| `/api/workers/:name/secrets` | POST/DELETE | Manage secrets |
| `/api/workers/:name/triggers` | GET/POST/DELETE | Manage cron triggers |
| `/api/workers/:name/deployments` | GET | List deployments |
| `/api/workers/:name/rollback` | POST | Rollback to version |

#### Pages
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/pages` | GET | List all Pages projects |
| `/api/pages` | POST | Create new project |
| `/api/pages/:name` | GET | Get project details |
| `/api/pages/:name` | PUT | Update project |
| `/api/pages/:name` | DELETE | Delete project |
| `/api/pages/:name/clone` | POST | Clone project |
| `/api/pages/:name/domains` | GET/POST/DELETE | Manage custom domains |
| `/api/pages/:name/deployments` | GET | List deployments |
| `/api/pages/:name/rollback` | POST | Rollback to deployment |

#### Shared
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/metrics` | GET | GraphQL analytics proxy |
| `/api/jobs` | GET | List job history |
| `/api/webhooks` | GET/POST/PUT/DELETE | Manage webhooks |
| `/api/backups` | GET | List R2 backups |
| `/api/backups/:id/restore` | POST | Restore from backup |
| `/api/health` | GET | Health check |

---

### Wrangler Configuration (wrangler.toml.example)

```toml
name = "worker-manager"
main = "worker/index.ts"
compatibility_date = "2024-12-01"

# D1 Database for metadata
[[d1_databases]]
binding = "METADATA"
database_name = "worker-manager-metadata"
database_id = "your-database-id"

# R2 Bucket for backups
[[r2_buckets]]
binding = "BACKUP_BUCKET"
bucket_name = "worker-manager-backups"

# KV Namespace for caching (optional)
[[kv_namespaces]]
binding = "CACHE"
id = "your-kv-namespace-id"

# Static assets
[assets]
directory = "./dist"

# Rate limiting (optional, requires paid plan)
[[ratelimits]]
name = "RATE_LIMITER"
namespace_id = "1001"
simple = { limit = 100, period = 60 }

# Secrets (set via wrangler secret put)
# ACCOUNT_ID - Cloudflare account ID
# API_KEY - Cloudflare API token
# TEAM_DOMAIN - Cloudflare Access team domain
# POLICY_AUD - Cloudflare Access policy AUD
```

---

### Coding Standards Implementation

#### Error Logging (worker/utils/error-logger.ts)
```typescript
type Severity = 'error' | 'warning' | 'info';

interface LogContext {
  module: string;
  operation: string;
  entityId?: string;
  entityName?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
}

export function logError(
  env: Env, 
  error: Error | string, 
  context: LogContext, 
  isLocalDev: boolean
): void {
  const code = `${context.module.toUpperCase()}_${context.operation.toUpperCase()}_FAILED`;
  const message = error instanceof Error ? error.message : error;
  const stack = error instanceof Error ? error.stack : undefined;
  
  console.error(`[ERROR] [${context.module}] [${code}] ${message}`, {
    ...context,
    stack,
    timestamp: new Date().toISOString()
  });
  
  // Trigger webhook for critical errors
  if (!isLocalDev) {
    void triggerWebhook(env, 'job_failed', { code, message, context });
  }
}
```

#### Client-Side Caching (src/lib/cache.ts)
```typescript
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheEntry<unknown>>();
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
const METRICS_TTL = 2 * 60 * 1000; // 2 minutes

export function getCached<T>(key: string, ttl = DEFAULT_TTL): T | null {
  const entry = cache.get(key) as CacheEntry<T> | undefined;
  if (!entry) return null;
  if (Date.now() - entry.timestamp > ttl) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

export function setCache<T>(key: string, data: T): void {
  cache.set(key, { data, timestamp: Date.now() });
}

export function invalidateCache(pattern: string): void {
  for (const key of cache.keys()) {
    if (key.includes(pattern)) cache.delete(key);
  }
}
```

---

## Verification Plan

### Automated Tests

Since this is a new project, no existing tests exist. We will verify through:

1. **TypeScript Strict Checking**
   ```bash
   cd C:\Users\chris\Desktop\worker-manager
   npm run typecheck
   ```
   - Must pass with zero errors

2. **ESLint Strict Mode**
   ```bash
   npm run lint
   ```
   - Must pass with zero errors/warnings

3. **Build Verification**
   ```bash
   npm run build
   ```
   - Must complete successfully

### Manual Verification

1. **Local Development**
   ```bash
   # Terminal 1: Frontend
   npm run dev
   
   # Terminal 2: Worker
   npx wrangler dev --config wrangler.dev.toml --local
   ```
   - Open http://localhost:5173
   - Verify mock data displays for Workers/Pages list
   - Verify navigation between views works
   - Verify dark/light theme toggle

2. **UI Component Testing**
   - Verify all shadcn/ui components render correctly
   - Test keyboard navigation (accessibility)
   - Test responsive layout at mobile/tablet/desktop breakpoints

3. **API Integration Testing** (requires Cloudflare credentials)
   - Deploy to staging environment
   - Test listing Workers and Pages projects
   - Test create/edit/delete operations
   - Test metrics dashboard data loading
   - Test webhook configuration

### User Acceptance Testing

After implementation, the user should:
1. Deploy to their Cloudflare account
2. Verify Workers appear in the list
3. Test creating a new Worker via the wizard
4. Test cloning an existing Worker
5. Test deleting a Worker (with R2 backup verification)
6. Verify metrics dashboard shows real data

---

## Implementation Phases

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| **1. Scaffolding** | 1-2 sessions | Project setup, Tailwind/shadcn, basic routing |
| **2. Core CRUD** | 2-3 sessions | Workers/Pages listing, detail views, create/delete |
| **3. Configuration** | 2-3 sessions | Domains, secrets, triggers, environment tabs |
| **4. Operations** | 2 sessions | Metrics, job history, webhooks |
| **5. Polish** | 1-2 sessions | Error handling, caching, accessibility, testing |

---

## Questions for User

1. Should the app manage **both Workers and Pages**, or focus on one?
2. Are there specific Worker/Page management patterns you use frequently that should be prioritized?
3. Do you want this deployed to a specific subdomain (e.g., `worker.adamic.tech`)?
4. Should we include template galleries for quick Worker creation?
