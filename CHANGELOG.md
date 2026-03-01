# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- **ESLint 10 Migration**: Upgraded from ESLint 9 to ESLint 10
  - `eslint`: 9.39.2 → 10.0.2
  - `@eslint/js`: 9.39.2 → 10.0.1
  - `eslint-plugin-react-hooks`: 7.0.1 → 7.1.0-canary (ESLint 10 peer dependency support)
  - `eslint-plugin-react-refresh`: 0.5.0 → 0.5.2
  - Removed `brace-expansion` override (v2 ESM export breaks ESLint 10's CJS `minimatch`)
- **Branch Migration**: Renamed default branch from `master` to `main`
- **Dependency Updates**: Updated npm dependencies to latest versions
  - `@cloudflare/workers-types`: 4.20260210.0 → 4.20260305.0
  - `@tailwindcss/vite`: 4.1.18 → 4.2.1
  - `@types/node`: 25.2.3 → 25.3.3
  - `@types/react`: 19.2.13 → 19.2.14
  - `globals`: 17.3.0 → 17.4.0
  - `jsdom`: 28.0.0 → 28.1.0
  - `lucide-react`: 0.563.0 → 0.575.0
  - `tailwind-merge`: 3.4.0 → 3.5.0
  - `tailwindcss`: 4.1.18 → 4.2.1
  - `typescript-eslint`: 8.55.0 → 8.56.0
  - `wrangler`: 4.64.0 → 4.69.0

### Fixed

- **Recharts v3.7.0 Compatibility**: Replaced deprecated `Cell` component with `shape` prop pattern in `LatencyChart` for individual bar coloring (SR-TS-01 compliant)
- **React 19 FormEvent Deprecation**: Replaced deprecated `React.FormEvent` with structural typing fallback `{ preventDefault(): void }` in `CreateWorkerDialog` and `CloneWorkerDialog` components
- **Security**: Resolved `minimatch` ReDoS vulnerability (GHSA-7r86-cg39-jmmj, GHSA-23c5-xmqv-rm74) via `npm audit fix`

### Added

- Initial project scaffolding
- Community standards (LICENSE, README, CONTRIBUTING, etc.)
- GitHub workflows (CodeQL, Dependabot)
- TypeScript strict configuration
- ESLint strict configuration

## [0.1.0] - 2025-12-29

### Added

- Initial repository setup
- Project documentation and implementation plan
