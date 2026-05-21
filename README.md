# OpenClaw

OpenClaw is a desktop application built with React, Vite, and Tauri. It combines a modern front-end UI with a Rust-backed native shell to deliver a cross-platform desktop user experience.

## How it works

- Frontend: React + Vite in `src/`
- Desktop wrapper: Tauri in `src-tauri/`
- Backend: Rust commands, services, and native integration through Tauri
- Bundled output: native installers and app packages built from `src-tauri/target/release/bundle`

## Requirements

- Node.js 18+ or newer
- pnpm package manager
- Rust toolchain (`rustup`, `cargo`)
- Tauri CLI installed or available through `pnpm`

## Setup

1. Install dependencies:

```bash
pnpm install
```

2. Verify the Rust toolchain:

```bash
rustup toolchain install stable
rustup target add x86_64-apple-darwin x86_64-pc-windows-msvc x86_64-unknown-linux-gnu
```

3. If you need the Tauri CLI globally:

```bash
pnpm exec tauri --version
```

## Local development

Run the front-end and Tauri dev server together:

```bash
pnpm tauri dev
```

This starts the Vite development server and opens the Tauri desktop app.

## Build for production

1. Build the web assets:

```bash
pnpm build
```

2. Create native bundles:

```bash
pnpm exec tauri build
```

Or use the shortcut script:

```bash
pnpm package
```

## Build artifacts

After a successful production build, the generated installers and bundles are located in:

```bash
src-tauri/target/release/bundle
```

Depending on your platform, you may see:

- macOS: `.dmg`, `.pkg`, `.app`, `.zip`
- Windows: `.msi`, `.exe`, `.zip`
- Linux: `.AppImage`, `.deb`, `.rpm`, `.tar.gz`

## Install and use

Install the produced package for your platform using the generated native installer. Once installed, run the app as a normal desktop application.

## Download website

A simple user-facing download page is available at `download.html`. It provides direct buttons for macOS and Windows installers so users can download OpenClaw like any other app.

## Production readiness checklist

- `package.json` includes build and packaging scripts
- `src-tauri/tauri.conf.json` is configured to bundle native installers
- `src-tauri/bundle` targets are active for cross-platform packaging
- The app uses a modern React + Tauri architecture for desktop deployment

## Troubleshooting

- If `pnpm tauri dev` fails, make sure `pnpm install` finished successfully.
- If the build fails, inspect the Vite output and Rust build logs for missing dependencies.
- For Tauri bundle issues, run:

```bash
pnpm exec tauri info
```

## Notes

- This repository is already configured for Tauri bundling.
- For distribution, upload generated installers from `src-tauri/target/release/bundle` to your release host.
