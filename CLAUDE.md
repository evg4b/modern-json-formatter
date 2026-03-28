# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Modern JSON Formatter** is a Chromium browser extension (Manifest v3) that intercepts JSON responses and renders them with features like big number support, guaranteed key ordering, JQ expression queries, and expandable/collapsible nodes. It's distributed on the Chrome Web Store and Microsoft Edge Store.

## Commands

```bash
# Development
yarn dev              # Start dev server with hot reload
yarn build            # Development build
yarn build:production # Production build (minified)

# Quality
yarn lint             # ESLint
yarn lint --fix       # ESLint with auto-fix
yarn test             # Run all tests
yarn test:cover       # Run tests with coverage

# Full release workflow (via Makefile)
make check            # lint + test
make build-worker-wasm # Build Rust/WASM core
make build-extension  # Production build
make pack-extension   # Generate per-file checksums and zip for Chrome + Edge stores
make release TYPE=patch|minor|major  # Bump version, tag, and push
```

## Mandatory End-of-Implementation Checklist

After every implementation — no exceptions — run the following sequence before considering the task done:

```bash
yarn lint --fix && yarn test && yarn build:production
```

- `yarn lint --fix` — auto-fixes code style issues (quote style, import order, etc.) and reports any remaining errors that require manual attention
- `yarn test` — runs the full test suite; all tests must pass
- `yarn build:production` — full production build with TypeScript type-checking; catches type errors that the test runner does not

If any step fails, fix the issue and re-run the full sequence from the beginning.

To run a single test file:
```bash
yarn test src/path/to/file.test.ts
```

To run Rust unit tests in the WASM core:
```bash
cargo test --manifest-path worker-wasm/core/Cargo.toml
```

## Architecture

### Extension Entry Points

The build is configured in `rsbuild.config.ts` via `manifestGeneratorPlugin`:
- **Content Script** (`src/content-script/main.ts`) — injected into every page at `document_start`; detects JSON, replaces the page DOM with a formatted view
- **Background** (`src/background/background.ts`) — service worker; handles message passing for downloads and query history
- **Options Page** (`src/options/options.ts`) — extension settings UI
- **FAQ Page** (`src/faq/faq.ts`) — in-extension help page

### WASM Core

The performance-critical JSON parsing lives in `worker-wasm/` (Rust, compiled to WASM). It produces:
- `worker-core.wasm` — the binary loaded at runtime
- TypeScript bindings in `worker-wasm/pkg/worker_wasm.d.ts`
- Shared type definitions in `worker-wasm/types/models.ts` — `TokenNode`, `TokenizerResponse`, `ErrorNode`, etc.

The WASM module must be pre-built (`make build-worker-wasm`) before the TypeScript build. In tests, it's mocked via `testing/worker-wasm.mock.ts`.

The Rust logic is split into two crates: `worker-wasm/` (WASM bindings via `wasm-bindgen`) and `worker-wasm/core/` (pure Rust logic — tokenize, query, format, minify). The core crate uses `serde_json`, `jaq-*` for JQ queries, and `json-event-parser` for streaming.

### Content Script Pipeline

1. `json-detector/` — scans the page DOM for a `<pre>` or `<code>` node containing raw JSON
2. If found, `extension.ts` initializes the formatter
3. `dom/build-dom.ts` walks the `TokenNode` tree and builds Lit web components
4. Specialized builders: `build-object-node.ts`, `build-array-node.ts`, `build-primitive-nodes.ts`, `build-error-node.ts`

### UI Components

Built with **Lit** (web components). Components live in:
- `src/content-script/ui/` — toolbar (`toolbox/`), JQ query input (`query-input/`), container (`container/`), info button
- `src/core/ui/` — reusable primitives (`buttons/`, `floating-message/`, `sticky-panel/`, `rounded-button.ts`, `table.ts`, `logo.ts`)
- Styles use SASS; shared variables in `src/core/styles/`

The main container (`mjf-container`) uses a **closed** shadow root and exposes `type: TabType` (`'formatted' | 'raw' | 'query'`) as a Lit `@property` to switch between views.

### Core Shared Module

`src/core/` contains abstractions shared across entry points:
- `browser/` — typed wrappers around Chrome extension APIs
- `background/` — message binding models (`binding.ts`, `models.ts`)
- `helpers/` — utility functions
- `constants/` — extension-wide constants

### TypeScript Path Aliases

Defined in `tsconfig.json`:
- `@core/*` → `src/core/*`
- `@testing/*` → `testing/*`
- `@wasm` → `worker-wasm/pkg` (compiled WASM bindings)
- `@wasm/types` → `worker-wasm/types` (shared WASM type definitions)

### Testing

Tests use **Rstest** (Rsbuild's test runner, Vitest-compatible) with **happy-dom** for DOM APIs.

- Test files are co-located with source (`file.ts` → `file.test.ts`)
- Tests cover both `src/` and `worker-core/`
- Snapshots live in `__snapshots__/` directories

**Available mocks in `testing/`:**
- `browser.mock.ts` — Chrome extension APIs (`resource`, `sendMessage`)
- `background.mock.ts` — Background script message handlers (`download`, `format`, `jq`, `tokenize`, `pushHistory`)
- `worker-wasm.mock.ts` — WASM exports (`initialize`, `jq`, `tokenize`, `format`, `minify`)
- `helpers.ts` — `wrapMock<T>()` utility for typing mocked functions
- `json.ts` — `TokenNode` test fixtures (`tObject`, `tArray`, `tString`, `tNull`, etc.)

Import side-effect mocks at the top of test files: `import '@testing/browser.mock'`.

### Build System

`rsbuild.config.ts` configures:
- Plugins: SASS, TypeScript type-checking, Node.js polyfills, Lit markdown support
- `splitChunks: false` — all output bundled into single files per entry point (required for extension architecture)
- `manifestGeneratorPlugin` dynamically generates `dist/manifest.json` from `src/manifest.json`

Assets are copied from `assets/` (shared), `assets/production/` (production only), and `assets/debug/` (development only).
