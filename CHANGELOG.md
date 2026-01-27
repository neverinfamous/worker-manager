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
  - `@cloudflare/workers-types`: 4.20260114.0 → 4.20260127.0
  - `@testing-library/react`: 16.3.1 → 16.3.2
  - `@types/node`: 25.0.8 → 25.0.10
  - `@types/react`: 19.2.8 → 19.2.10
  - `@vitest/coverage-v8`: 4.0.16 → 4.0.18
  - `globals`: 17.0.0 → 17.1.0
  - `lucide-react`: 0.562.0 → 0.563.0
  - `react`: 19.2.3 → 19.2.4
  - `react-dom`: 19.2.3 → 19.2.4
  - `recharts`: 3.6.0 → 3.7.0
  - `typescript-eslint`: 8.53.0 → 8.54.0
  - `vitest`: 4.0.16 → 4.0.18
  - `wrangler`: 4.59.1 → 4.61.0

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
