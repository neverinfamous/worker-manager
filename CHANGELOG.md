# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- **Node.js 24 LTS Baseline**: Updated from Node 18 to Node 24 LTS as the project baseline
  - `package.json` now requires Node.js >=24.0.0 in `engines` field
  - README prerequisites updated to specify Node.js 24+ (LTS)
- **Dependency Updates**: Updated npm dependencies to latest versions
  - `@cloudflare/workers-types`: 4.20260127.0 → 4.20260205.0
  - `@types/node`: 25.0.10 → 25.2.0
  - `@types/react`: 19.2.10 → 19.2.11
  - `@vitejs/plugin-react`: 5.1.2 → 5.1.3
  - `eslint-plugin-react-refresh`: 0.4.26 → 0.5.0
  - `globals`: 17.1.0 → 17.3.0
  - `jsdom`: 27.4.0 → 28.0.0
  - `wrangler`: 4.61.0 → 4.62.0

### Fixed

- **Recharts v3.7.0 Compatibility**: Replaced deprecated `Cell` component with `shape` prop pattern in `LatencyChart` for individual bar coloring (SR-TS-01 compliant)
- **React 19 FormEvent Deprecation**: Replaced deprecated `React.FormEvent` with structural typing fallback `{ preventDefault(): void }` in `CreateWorkerDialog` and `CloneWorkerDialog` components

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
