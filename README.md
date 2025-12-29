# Worker Manager

A premium management interface for Cloudflare Workers and Pages, built with React 19, TypeScript, and Tailwind CSS 4.

![License](https://img.shields.io/badge/license-MIT-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)
![React](https://img.shields.io/badge/React-19-blue)

## Features

### Workers Management
- **List View** - Grid/list toggle, search, and filtering
- **Detail View** - Routes, secrets, cron triggers, and settings tabs
- **Operations** - Create, clone, and delete workers with R2 backup

### Pages Management
- **Project Listing** - Deployment status badges and branch info
- **Deployment History** - View and rollback deployments
- **Domain Management** - Custom domain display
- **Build Configuration** - Build settings and source info

### Metrics Dashboard
- **Time Range Selector** - 1H, 6H, 24H, 7D, 30D views
- **Visual Charts** - Request volume, latency percentiles, error rates
- **Performance Metrics** - CPU time distribution, response duration

### Job History
- **Operation Tracking** - Deploy, backup, delete, clone operations
- **Status Filtering** - Running, success, failed filters
- **Progress Indicators** - Real-time progress for running jobs

### Webhooks
- **CRUD Operations** - Create, edit, delete webhooks
- **Event Configuration** - 8 event types (deploy, error, backup, etc.)
- **Enable/Disable Toggle** - Quick activation control
- **Test Functionality** - Send test payloads

## Tech Stack

| Category | Technology |
|----------|------------|
| Frontend | React 19, TypeScript 5.6, Vite 7 |
| Styling | Tailwind CSS 4, shadcn/ui |
| Charts | Recharts |
| Backend | Cloudflare Workers |
| Database | Cloudflare D1 (metadata) |
| Storage | Cloudflare R2 (backups) |
| Auth | Cloudflare Access |

## Quick Start

### Prerequisites
- Node.js 20+
- npm or pnpm
- Cloudflare account with Workers, D1, and R2 enabled

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/worker-manager.git
cd worker-manager

# Install dependencies
npm install

# Copy environment files
cp .env.example .env
cp wrangler.toml.example wrangler.toml
```

### Development

```bash
# Terminal 1: Start frontend
npm run dev

# Terminal 2: Start worker backend (local)
npx wrangler dev --config wrangler.dev.toml --local
```

The app will be available at `http://localhost:5173`

### Building

```bash
# Lint and typecheck
npm run lint
npm run typecheck

# Build for production
npm run build
```

## Configuration

### Environment Variables

| Variable | Description |
|----------|-------------|
| `ACCOUNT_ID` | Your Cloudflare Account ID |
| `API_KEY` | Cloudflare API Token with Workers/Pages permissions |
| `TEAM_DOMAIN` | Cloudflare Access team domain (e.g., `yourteam.cloudflareaccess.com`) |
| `POLICY_AUD` | Cloudflare Access Application AUD tag |

### Wrangler Configuration

Edit `wrangler.toml` with your bindings:

```toml
name = "worker-manager"
main = "worker/index.ts"
compatibility_date = "2024-12-01"

[[d1_databases]]
binding = "METADATA"
database_name = "worker-manager-db"
database_id = "your-d1-database-id"

[[r2_buckets]]
binding = "BACKUP_BUCKET"
bucket_name = "worker-manager-backups"
```

### Database Setup

Initialize the D1 database:

```bash
# Create database
npx wrangler d1 create worker-manager-db

# Run migrations
npx wrangler d1 execute worker-manager-db --file=worker/schema.sql
```

## Deployment

### Deploy Backend

```bash
# Deploy worker
npx wrangler deploy
```

### Deploy Frontend

Build the frontend and upload to Cloudflare Pages or your preferred host:

```bash
npm run build
# dist/ folder contains the production build
```

### Cloudflare Access Setup

1. Create an Access Application for your worker URL
2. Configure identity providers (GitHub, Google, etc.)
3. Copy the AUD tag to `POLICY_AUD` environment variable
4. Set `TEAM_DOMAIN` to your Access subdomain

## API Endpoints

### Workers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/workers` | List all workers |
| GET | `/api/workers/:name` | Get worker details |
| DELETE | `/api/workers/:name` | Delete worker |
| POST | `/api/workers/:name/clone` | Clone worker |
| GET | `/api/workers/:name/routes` | Get worker routes |
| GET | `/api/workers/:name/secrets` | Get worker secrets |

### Pages
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/pages` | List all pages projects |
| GET | `/api/pages/:name` | Get project details |
| DELETE | `/api/pages/:name` | Delete project |
| GET | `/api/pages/:name/deployments` | Get deployments |
| GET | `/api/pages/:name/domains` | Get custom domains |
| POST | `/api/pages/:name/rollback` | Rollback deployment |

### Other
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/metrics?range=24h` | Get analytics metrics |
| GET | `/api/jobs` | List job history |
| GET/POST/PUT/DELETE | `/api/webhooks` | Webhook CRUD |
| GET/POST | `/api/backups` | Backup operations |

## Project Structure

```
worker-manager/
├── src/
│   ├── components/
│   │   ├── jobs/          # Job history view
│   │   ├── metrics/       # Metrics dashboard & charts
│   │   ├── pages/         # Pages management
│   │   ├── ui/            # shadcn/ui components
│   │   ├── webhooks/      # Webhook management
│   │   └── workers/       # Workers management
│   ├── contexts/          # Theme context
│   ├── hooks/             # Custom hooks
│   ├── lib/               # API service, cache, utilities
│   └── types/             # TypeScript types
├── worker/
│   ├── routes/            # API route handlers
│   ├── types/             # Worker types
│   ├── utils/             # Auth, CORS utilities
│   └── index.ts           # Worker entry point
└── dist/                  # Production build
```

## Development Notes

### Local Development
The backend returns mock data when running locally (detected via `localhost`/`127.0.0.1`), allowing full UI development without Cloudflare API credentials.

### Caching
- Default TTL: 5 minutes for most endpoints
- Metrics TTL: 2 minutes
- Automatic invalidation on mutations

### Authentication
Cloudflare Access JWT validation is enforced for all API routes in production. Local development bypasses authentication.

## License

MIT License - see [LICENSE](LICENSE) for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run `npm run lint && npm run typecheck`
5. Submit a pull request
