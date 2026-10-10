# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Modern JSON Formatter** is a Chromium browser extension (Manifest v3) that detects JSON pages and renders them with exact big numbers, keys in source order, jq queries (jaq engine plus `md5`/`sha256`/`sha512`) with per-site history, expandable/collapsible nodes, and raw/formatted/minified downloads. It's distributed on the Chrome Web Store and Microsoft Edge Add-ons.

## Commands

```bash
# Development
yarn dev              # Rebuild dist/ on every change (reload the extension to pick it up)
yarn build            # Development build
yarn build:production # Production build (minified)

# Quality
yarn lint             # ESLint
yarn lint --fix       # ESLint with auto-fix
yarn test             # Run all tests
yarn test:cover       # Run tests with coverage
yarn e2e              # Playwright end-to-end tests against dist/
yarn storybook        # Storybook for the Lit components (port 6006)

# Full release workflow (via Makefile)
make check            # lint + test
make e2e              # Build the extension, then run the end-to-end suite (Docker)
make e2e-update       # Same, regenerating the committed screenshots (Docker)
make build-worker-wasm # Build Rust/WASM core
make bench-worker-wasm # Benchmark the Rust core (time and allocations per call)
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

The build is configured in `rsbuild.config.ts` via `manifestGeneratorPlugin` (`plugins/rsbuild-v3-manifest-plugin/`):
- **Content Script** (`src/content-script/main.ts`) — injected into every page (including `file://`) at `document_start`; detects JSON, replaces the page DOM with a formatted view
- **Background** (`src/background/background.ts`) — service worker; owns the WASM module and answers `tokenize`, `format`, `jq`, downloads and query history requests
- **Options Page** (`src/options/options.ts`) — extension settings UI
- **FAQ Page** (`src/faq/faq.ts`) — in-extension jq manual; sections are Markdown in `src/faq/sections/en/` with runnable `<mjf-example-table>` examples

### WASM Core

The performance-critical JSON parsing lives in `worker-wasm/` (Rust, compiled to WASM). It produces:
- `worker-wasm/pkg/worker_wasm_bg.wasm` — the binary, bundled into `dist/` as `<hash>.module.wasm` and loaded by the background worker
- TypeScript bindings in `worker-wasm/pkg/worker_wasm.d.ts` (`tokenize`, `query`, `format`, `minify`)
- Shared type definitions in `worker-wasm/types/models.ts` — `TokenNode`, `TokenizerResponse`, `ErrorNode`, etc.

The WASM module must be pre-built (`make build-worker-wasm`) before the TypeScript build. In unit tests, it's mocked via `testing/worker-wasm.mock.ts`; `src/worker.test.ts` is the exception and runs the real build.

The Rust logic is split into two crates: `worker-wasm/` (WASM bindings via `wasm-bindgen`) and `worker-wasm/core/` (pure Rust logic — tokenize, query, format, minify, hashes). The core crate parses JSON with its own `hifijson`-based parser (`parser.rs`), which keeps numbers as written and accepts comments, trailing commas, `NaN` and `Infinity`; it uses `jaq-core`/`jaq-std`/`jaq-json` for jq queries and `md5`/`sha2` for the hash functions.

### Content Script Pipeline

1. `json-detector/` — looks for a `<pre>` among `<body>`'s children (in Edge, a `<div hidden>`) whose text starts like JSON or is a single primitive
2. If found, `extension.ts` attaches a closed shadow root to `<body>`, reads the settings, and hands the text to `document/json-document.ts` (`JsonDocument`), which tokenizes it, or formats it as plain text when it exceeds `maxFileSize`
3. `dom/build-dom.ts` walks the `TokenNode` tree and builds plain `HTMLElement`s (not Lit components); it also handles toggles and Ctrl/⌘+click on URL/email strings
4. Specialized builders: `build-object-node.ts`, `build-array-node.ts`, `build-primitive-nodes.ts`; errors are rendered by the `mjf-error-node` component

### UI Components

Built with **Lit** (web components). Components live in:
- `src/content-script/ui/` — toolbar (`toolbox/`), JQ query input with history autocomplete (`query-input/`), container (`container/`), error node (`error-node/`), info button
- `src/core/ui/` — reusable primitives (`buttons/`, `dropdown/`, `error-message/`, `floating-message/`, `sticky-panel/`, `rounded-button.ts`, `table.ts`, `logo.ts`)
- Styles use SASS; shared variables in `src/core/styles/`

The main container (`mjf-container`) uses a **closed** shadow root and exposes `type: TabType` (`'formatted' | 'raw' | 'query'`) as a Lit `@property` to switch between views.

### Core Shared Module

`src/core/` contains abstractions shared across entry points:
- `browser/` — typed wrappers around Chrome extension APIs
- `background/` — the content ↔ background message protocol: `protocol.ts` maps each action to its payload and reply and builds the client and handler from that map; `binding.ts` is the typed client the UI calls
- `settings/` — `ExtensionSettings` (toolbar buttons, download mode, max file size) stored in `chrome.storage.sync`
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
- Unit tests cover `src/`; the Rust core has its own `cargo test` suite
- Snapshots live in `__snapshots__/` directories

**Available mocks in `testing/`:**
- `browser.mock.ts` — `@core/browser` (`resource`, `sendMessage`)
- `background.mock.ts` — the typed background client `@core/background` (`download`, `format`, `jq`, `tokenize`, `getHistory`, `clearHistory`, `getDomains`)
- `worker-wasm.mock.ts` — WASM exports (`initialize`, `jq`, `query`, `tokenize`, `format`, `minify`)
- `settings.mock.ts` — `@core/settings` (`getSettings`, `saveSettings`, `DEFAULT_SETTINGS`)
- `helpers.ts` — `wrapMock<T>()` utility for typing mocked functions
- `lit.ts` — `renderLitElement()` and `defaultLitAsserts()` for component tests
- `json.ts` — `TokenNode` test fixtures (`tObject`, `tArray`, `tString`, `tNull`, etc.)

Import side-effect mocks at the top of test files: `import '@testing/browser.mock'`.

### End-to-End Tests

`e2e/` runs the packed extension in a real Chromium via **Playwright**, against a
production build in `dist/`.

- `e2e/support/fixtures.ts` — loads `dist/` as an unpacked extension, exposes the
  extension id and service worker, and serves page bodies by fulfilling the request
  (`open(body, { contentType, url })`); `configure` seeds settings through the service
  worker, `query` runs a jq expression, `downloads` records what `chrome.downloads` was
  asked to save, and `copyAll`/`copySelection` return the copied text
- `e2e/support/downloads.ts` — wraps `chrome.downloads.download` in the service
  worker and waits for in-flight downloads before the context closes, since an
  unfinished download stalls the teardown
- `e2e/support/shadow.ts` — resolves selectors through **closed** shadow roots over
  CDP, since Playwright locators stop at them; segments are separated by `>>>`
- `e2e/support/selection.ts` — selects and copies through CDP editing commands
- `e2e/support/samples.ts` — sample documents (`e2e/support/samples/`) and generators
- `e2e/support/ui.ts` — the known element paths, kept out of the specs

Screenshots live under `e2e/__screenshots__/`, one per theme. Tests tagged
`@screenshot` run in both the `dark` and `light` projects, which is where the
suffix on each image comes from; everything else runs in `dark` only. Every
font the UI renders is bundled (`assets/font.css`: JetBrains Mono for code,
Roboto for everything else), so every platform renders the same glyphs and
`yarn e2e` on the host matches CI within the `threshold` and `maxDiffPixels` in
`playwright.config.ts`, which absorb antialiasing differences between
platforms; `-webkit-font-smoothing: antialiased` keeps macOS from thickening
light-on-dark text. Never fall back to a system font (`local()`, a bare
`monospace`/`sans-serif`, or a form control's default font). Regenerate the
images with `make e2e-update` after an intentional UI change.

### Build System

`rsbuild.config.ts` configures:
- Plugins: SASS, TypeScript type-checking, Node.js polyfills, Lit markdown support
- `splitChunks: false` — all output bundled into single files per entry point (required for extension architecture)
- `manifestGeneratorPlugin` generates `dist/manifest.json` from the `baseManifest` in `rsbuild.config.ts` (permissions `downloads` and `storage`, all-URL host permissions), the entry points, and the version in `package.json`

Assets are copied from `assets/` (shared), `assets/production/` (production only), and `assets/debug/` (development only).
