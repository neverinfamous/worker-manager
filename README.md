# Worker Manager for Cloudflare

**Last Updated: February 4, 2026**

[![GitHub](https://img.shields.io/badge/GitHub-neverinfamous/worker--manager-blue?logo=github)](https://github.com/neverinfamous/worker-manager)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
![Version](https://img.shields.io/badge/version-v0.1.0-yellow)
![Status](https://img.shields.io/badge/status-Under%20Development-orange)
[![Type Safety](https://img.shields.io/badge/TypeScript-Strict-blue.svg)](https://github.com/neverinfamous/worker-manager)

Worker Manager for Cloudflare — Full-featured, self-hosted web app for managing Cloudflare Workers and Pages projects. View worker details, routes, secrets, and cron triggers. Monitor Pages deployments with rollback capability. Track performance metrics with visual charts. Manage webhooks for event notifications. All protected by GitHub SSO via Cloudflare Zero Trust.

**[Live Demo](https://worker.adamic.tech/)** • **[Changelog](CHANGELOG.md)**

**Tech Stack:** React 19.2.3 | Vite 7.3.1 | TypeScript 5.9.3 | Tailwind CSS 4.1.17 | Cloudflare Workers + Zero Trust

> ⚠️ **Development Status:** This project is under active development. Features may change and some functionality may be incomplete.

---

## ✨ Features

### Workers Management

- 🔧 **List View** - Grid/list toggle with search and filtering
- 📋 **Detail View** - Routes, secrets, cron triggers, bindings, and settings tabs
- 🔗 **Routes Management** - Add and delete custom routes with zone selection
- 🔐 **Secrets Management** - Add and delete worker secrets
- ⏰ **Cron Triggers** - Add and delete scheduled triggers with validation
- 🌐 **Subdomain Toggle** - Enable/disable workers.dev subdomain
- 📊 **Bindings Display** - View R2, D1, KV, Queue, and DO bindings
- ⚙️ **Operations** - Create, clone, and delete workers with R2 backup

### Worker Settings

- 📝 **Workers Logs** - Enable/disable console logging
- 🔍 **Workers Traces** - Enable/disable request tracing
- 📤 **Logpush** - Toggle log export with link to Cloudflare Dashboard configuration
- 🚀 **Smart Placement** - Enable/disable automatic placement optimization
- 📅 **Compatibility Date** - Edit Worker compatibility date
- 🏷️ **Compatibility Flags** - Add/remove from predefined list of common flags
- 🔗 **Tail Workers** - Connect/disconnect Tail Worker consumers

### Pages Management

- 📄 **Project Listing** - Deployment status badges and branch info
- 🚀 **Deployment History** - View and rollback to previous deployments
- 🌐 **Domain Management** - Add, view, and delete custom domains
- 🛠️ **Build Configuration** - Build settings and source repository info

### Metrics Dashboard

- 📊 **Visual Charts** - Request volume, latency percentiles, error rates (powered by Recharts)
- ⏱️ **Time Range Selector** - 1H, 6H, 24H, 7D, 30D views
- 📈 **Performance Metrics** - CPU time distribution, response duration percentiles
- 🎯 **Quick Stats** - Real-time success rate, error count, and status indicators

### Job History

- 📋 **Operation Tracking** - Deploy, backup, delete, clone operations
- 🔍 **Status Filtering** - Running, success, failed filters
- 📊 **Progress Indicators** - Real-time progress for running jobs

### Webhooks

- ✏️ **CRUD Operations** - Create, edit, delete webhooks
- 🎯 **Event Configuration** - 8 event types (worker.deployed, worker.deleted, worker.error, page.deployed, page.deleted, page.failed, backup.created, backup.restored)
- 🔄 **Enable/Disable Toggle** - Quick activation control
- 🧪 **Test Functionality** - Send test payloads with visual feedback

---

## 🚀 Quick Start

### Prerequisites

- [Cloudflare account](https://dash.cloudflare.com/sign-up) (Free tier works!)
- [Node.js](https://nodejs.org/) 24+ (LTS) and npm
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) 4.0+
- Domain managed by Cloudflare (optional - can use Workers.dev subdomain)

### Installation

1. **Clone and install:**

   ```bash
   git clone https://github.com/neverinfamous/worker-manager.git
   cd worker-manager
   npm install
   ```

2. **Configure environment:**

   ```bash
   cp .env.example .env
   cp wrangler.toml.example wrangler.toml
   ```

   Edit both files with your settings.

3. **Create D1 database and R2 bucket:**

   ```bash
   npx wrangler login
   npx wrangler d1 create worker-manager-metadata
   npx wrangler r2 bucket create worker-manager-backups
   ```

4. **Configure Cloudflare Access:**
   - Set up GitHub OAuth in [Zero Trust](https://one.dash.cloudflare.com/)
   - Create an Access application for your domain
   - Copy the Application Audience (AUD) Tag

5. **Set Worker secrets:**

   ```bash
   npx wrangler secret put ACCOUNT_ID
   npx wrangler secret put API_KEY
   npx wrangler secret put TEAM_DOMAIN
   npx wrangler secret put POLICY_AUD
   ```

6. **Deploy:**
   ```bash
   npm run deploy
   ```

---

## 🛠️ Local Development

### Quick Start (Two Terminal Windows Required)

**Terminal 1: Frontend dev server (Vite)**

```bash
npm run dev
```

- Runs on: `http://localhost:5173`
- Hot Module Replacement (HMR) enabled
- Watches for file changes automatically

**Terminal 2: Worker dev server (Wrangler)**

```bash
npx wrangler dev --config wrangler.dev.toml --local
```

- Runs on: `http://localhost:8787`
- Uses local bindings with mock data (no secrets required)
- Automatically reloads on code changes

### Access the Application

Open your browser to `http://localhost:5173` - the frontend will automatically communicate with the Worker API on port 8787.

**Note:** Authentication is disabled on localhost for easier development. No Cloudflare Access configuration needed for local dev.

### What's Different in Local Development

- **Authentication:** Automatically disabled for localhost requests
- **CORS:** Configured to allow `http://localhost:5173` with credentials
- **Mock Data:** Returns simulated responses (no real Cloudflare API calls)
- **No Secrets Required:** Works without `ACCOUNT_ID` or `API_KEY`

---

## 📋 Configuration

### Environment Variables

| Variable      | Description                                                           |
| ------------- | --------------------------------------------------------------------- |
| `ACCOUNT_ID`  | Your Cloudflare Account ID                                            |
| `API_KEY`     | Cloudflare API Token with Workers/Pages permissions                   |
| `TEAM_DOMAIN` | Cloudflare Access team domain (e.g., `yourteam.cloudflareaccess.com`) |
| `POLICY_AUD`  | Cloudflare Access Application AUD tag                                 |

### Wrangler Configuration

Edit `wrangler.toml` with your bindings:

```toml
name = "worker-manager"
main = "worker/index.ts"
compatibility_date = "2024-12-01"

[assets]
directory = "./dist"

[[d1_databases]]
binding = "METADATA"
database_name = "worker-manager-metadata"
database_id = "your-d1-database-id"

[[r2_buckets]]
binding = "BACKUP_BUCKET"
bucket_name = "worker-manager-backups"
```

### Database Setup

Initialize the D1 database:

```bash
# Create database
npx wrangler d1 create worker-manager-metadata

# Run migrations
npx wrangler d1 execute worker-manager-metadata --remote --file=worker/schema.sql
```

---

## 🙈 Hiding Workers/Pages from the UI

You can configure Worker Manager to hide specific workers or pages from the UI (e.g., the manager itself, internal workers, or workers managed by other applications).

### How to Hide Workers

1. **Edit `worker/routes/workers.ts`:**
   - Locate the `hiddenWorkers` array at the top of the file
   - Add your worker name(s) to the array

```typescript
const hiddenWorkers = ["worker-manager", "internal-api", "my-hidden-worker"];
```

### How to Hide Pages

1. **Edit `worker/routes/pages.ts`:**
   - Locate the `hiddenPages` array at the top of the file
   - Add your project name(s) to the array

```typescript
const hiddenPages = ["internal-docs", "staging-site"];
```

2. **Deploy the changes:**
   ```bash
   npm run deploy
   ```

**Note:** Hidden items are completely filtered from the API response and won't appear in the list or be accessible through the UI.

---

## 📋 Architecture

### Technology Stack

| Component     | Technology         | Version       |
| ------------- | ------------------ | ------------- |
| Frontend      | React              | 19            |
| Build Tool    | Vite               | 7.3.0         |
| Language      | TypeScript         | 5.6           |
| Styling       | Tailwind CSS       | 4.0           |
| UI Components | shadcn/ui          | Latest        |
| Charts        | Recharts           | 2.x           |
| Backend       | Cloudflare Workers | Runtime API   |
| Database      | Cloudflare D1      | SQLite        |
| Storage       | Cloudflare R2      | S3-compatible |
| Auth          | Cloudflare Access  | Zero Trust    |

### File Organization

```
worker-manager/
├── src/                      # Frontend source code
│   ├── components/
│   │   ├── jobs/            # Job history view
│   │   ├── metrics/         # Metrics dashboard & charts
│   │   ├── pages/           # Pages management
│   │   ├── ui/              # shadcn/ui components
│   │   ├── webhooks/        # Webhook management
│   │   └── workers/         # Workers management
│   ├── contexts/            # Theme context
│   ├── hooks/               # Custom hooks
│   ├── lib/                 # API service, cache, utilities
│   └── App.tsx              # Main application component
├── worker/
│   ├── routes/              # API route handlers
│   ├── types/               # Worker types
│   ├── utils/               # Auth, CORS utilities
│   └── index.ts             # Worker entry point
└── dist/                    # Production build
```

### API Endpoints

#### Workers

| Method | Endpoint                           | Description                                             |
| ------ | ---------------------------------- | ------------------------------------------------------- |
| GET    | `/api/workers`                     | List all workers                                        |
| GET    | `/api/workers/:name`               | Get worker details                                      |
| POST   | `/api/workers`                     | Create new worker                                       |
| DELETE | `/api/workers/:name`               | Delete worker                                           |
| POST   | `/api/workers/:name/clone`         | Clone worker                                            |
| GET    | `/api/workers/:name/routes`        | Get worker routes (aggregated from all zones)           |
| POST   | `/api/workers/:name/routes`        | Create route (requires pattern and zone_id)             |
| DELETE | `/api/workers/:name/routes/:id`    | Delete route (requires zone_id query param)             |
| GET    | `/api/workers/:name/secrets`       | Get worker secrets                                      |
| POST   | `/api/workers/:name/secrets`       | Add worker secret                                       |
| DELETE | `/api/workers/:name/secrets/:name` | Delete worker secret                                    |
| GET    | `/api/workers/:name/settings`      | Get worker settings and bindings                        |
| PATCH  | `/api/workers/:name/settings`      | Update worker settings (observability, placement, etc.) |
| GET    | `/api/workers/:name/schedules`     | Get cron schedules                                      |
| PUT    | `/api/workers/:name/schedules`     | Update cron schedules                                   |
| GET    | `/api/workers/:name/subdomain`     | Get subdomain status                                    |
| PUT    | `/api/workers/:name/subdomain`     | Toggle subdomain                                        |
| GET    | `/api/workers-subdomain`           | Get account workers.dev subdomain                       |
| GET    | `/api/zones`                       | List available zones for route creation                 |

#### Pages

| Method | Endpoint                           | Description             |
| ------ | ---------------------------------- | ----------------------- |
| GET    | `/api/pages`                       | List all pages projects |
| GET    | `/api/pages/:name`                 | Get project details     |
| DELETE | `/api/pages/:name`                 | Delete project          |
| GET    | `/api/pages/:name/deployments`     | Get deployments         |
| GET    | `/api/pages/:name/domains`         | Get custom domains      |
| POST   | `/api/pages/:name/domains`         | Add custom domain       |
| DELETE | `/api/pages/:name/domains/:domain` | Delete custom domain    |
| POST   | `/api/pages/:name/rollback`        | Rollback deployment     |

#### Metrics & Jobs

| Method | Endpoint                 | Description           |
| ------ | ------------------------ | --------------------- |
| GET    | `/api/metrics?range=24h` | Get analytics metrics |
| GET    | `/api/jobs`              | List job history      |

#### Webhooks

| Method | Endpoint            | Description    |
| ------ | ------------------- | -------------- |
| GET    | `/api/webhooks`     | List webhooks  |
| POST   | `/api/webhooks`     | Create webhook |
| PUT    | `/api/webhooks/:id` | Update webhook |
| DELETE | `/api/webhooks/:id` | Delete webhook |

---

## 🔐 Security

- ✅ **Zero Trust Architecture** - All requests authenticated by Cloudflare Access
- ✅ **JWT Validation** - Tokens verified on every API call
- ✅ **HTTPS Only** - All traffic encrypted via Cloudflare's edge network
- ✅ **No Stored Credentials** - No user passwords stored anywhere

---

## 🐛 Troubleshooting

Common issues and solutions:

- **Authentication errors:** Verify `TEAM_DOMAIN` and `POLICY_AUD` secrets
- **Workers not showing:** Check `hiddenWorkers` array in `worker/routes/workers.ts`
- **Build failures:** Ensure `npm run build` completes before deploy
- **GitHub deploy fails:** Set Build command to `npm run build` in Cloudflare Dashboard

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Run linting and type checks (`npm run lint && npm run typecheck`)
4. Commit your changes (`git commit -m 'Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📞 Support

- 🐛 **Bug Reports:** [GitHub Issues](https://github.com/neverinfamous/worker-manager/issues)
- 💡 **Feature Requests:** [GitHub Discussions](https://github.com/neverinfamous/worker-manager/discussions)

---

## 📚 Additional Resources

- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Cloudflare Access (Zero Trust) Documentation](https://developers.cloudflare.com/cloudflare-one/policies/access/)
- [React 19 Documentation](https://react.dev/)
- [Vite Documentation](https://vite.dev/)

---

**Made with ❤️ for the Cloudflare community**
