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
  - `@cloudflare/workers-types`: 4.20260111.0 → 4.20260114.0
  - `@types/node`: 25.0.6 → 25.0.8
  - `typescript-eslint`: 8.52.0 → 8.53.0
  - `wrangler`: 4.58.0 → 4.59.1

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
