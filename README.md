# Worker Manager

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![CodeQL](https://github.com/neverinfamous/worker-manager/actions/workflows/codeql.yml/badge.svg)](https://github.com/neverinfamous/worker-manager/actions/workflows/codeql.yml)

A full-featured, self-hosted web application for managing Cloudflare Pages projects and Workers scripts.

## Features

- **Workers Management**: Create, edit, clone, and delete Cloudflare Workers
- **Pages Management**: Manage Cloudflare Pages projects and deployments
- **Configuration Wizard**: Domains, routes, secrets, triggers, bindings
- **Metrics Dashboard**: Request volume, CPU time, latency analytics
- **Deployment History**: View past deployments with rollback capability
- **Job Tracking**: All operations tracked with timestamps
- **Webhooks**: HTTP notifications for deployments and errors
- **R2 Backups**: Export configs to R2 before destructive operations

## Quick Start

```bash
# Clone the repository
git clone https://github.com/neverinfamous/worker-manager.git
cd worker-manager

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your Cloudflare credentials

# Run development server
npm run dev
```

## Documentation

See [implementation_plan.md](./implementation_plan.md) for detailed architecture and API documentation.

## Tech Stack

- **Frontend**: React 19, TypeScript 5.9, Tailwind CSS 4, shadcn/ui
- **Backend**: Cloudflare Workers
- **Database**: Cloudflare D1 (SQLite)
- **Storage**: Cloudflare R2 (backups)

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run test` | Run tests |
| `npm run check` | Run lint + typecheck |

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for contribution guidelines.

## Security

See [SECURITY.md](./SECURITY.md) for security policy and reporting vulnerabilities.

## License

[MIT](./LICENSE) © 2025 Adamic.tech
