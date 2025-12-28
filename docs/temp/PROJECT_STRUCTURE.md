# CherryChain Project Structure

## Overview

CherryChain is a logistics simulation platform built with Rust (backend) and React + Three.js (frontend). This document provides an overview of the project structure after Section 1 scaffolding.

## Directory Layout

```
CLS/
├── .cargo/                    # Cargo configuration
│   └── config.toml           # Build settings and aliases
├── .github/
│   └── workflows/
│       └── ci.yml            # GitHub Actions CI/CD pipeline
├── api-server/               # Axum web server with WebSocket support
│   ├── src/
│   │   ├── main.rs          # Server entry point
│   │   └── websocket.rs     # WebSocket handler
│   └── Cargo.toml
├── simulation-engine/        # ECS-based simulation logic
│   ├── src/
│   │   └── lib.rs           # Core simulation engine
│   └── Cargo.toml
├── shared-types/             # Shared data structures
│   ├── src/
│   │   └── lib.rs           # Common types (Position, WorldState, etc.)
│   └── Cargo.toml
├── frontend/                 # React + TypeScript + Three.js UI
│   ├── src/                 # React components (Vite default structure)
│   ├── package.json
│   └── vite.config.ts       # Vite config with WebSocket proxy
├── openspec/                 # OpenSpec change proposals
│   └── changes/
│       └── build-cherrychain-platform/
│           ├── proposal.md
│           ├── design.md
│           └── tasks.md     # Implementation checklist
├── Cargo.toml               # Rust workspace root
├── dev-setup.md             # Development setup guide
└── .gitignore               # Updated with Rust and frontend paths
```

## Key Components

### Backend (Rust)

- **shared-types**: Common data structures used by both simulation and API
  - `Position`: Geographic lat/long coordinates
  - `ContainerEntity`: Container state (position, temperature, quality)
  - `WorldState`: Full simulation state
  - `ServerMessage`/`ClientMessage`: WebSocket message types

- **simulation-engine**: Core simulation logic
  - `SimulationEngine`: Main simulation manager
  - Entity spawning and state management
  - Placeholder for movement and decay systems (to be implemented in Sprint 1-3)

- **api-server**: Web server and WebSocket broadcaster
  - Axum framework with CORS support
  - WebSocket endpoint at `/ws`
  - Real-time state broadcasting to clients

### Frontend (React + TypeScript)

- Vite-based React application with TypeScript
- Three.js and React-Three-Fiber installed for 3D rendering
- WebSocket proxy configured to connect to backend (localhost:3000)
- Hot module reload enabled for fast development

### CI/CD

- GitHub Actions workflow for automated testing and building
- **Backend pipeline**:
  - Rust formatting check (`cargo fmt`)
  - Linting with Clippy
  - Run tests
  - Build release artifacts
- **Frontend pipeline**:
  - Install dependencies
  - Lint TypeScript/React code
  - Build production bundle

## Development Commands

### Backend
```bash
# Run with auto-reload
cargo watch -x 'run --bin api-server'

# Run tests
cargo test --workspace

# Build release
cargo build --workspace --release
```

### Frontend
```bash
cd frontend
npm install      # First time only
npm run dev      # Start dev server
npm run build    # Production build
npm run lint     # Check code quality
```

## Next Steps

With Section 1 complete, the project is ready for:
- **Sprint 1 (Section 2)**: MVP implementation with basic movement and WebSocket updates
- **Sprint 2 (Section 3)**: 3D visualization with Earth textures and instanced rendering
- **Sprint 3 (Section 4)**: Decay physics and Great Circle routing
- **Sprint 4 (Section 5)**: Game loop with management interface and analytics

See [tasks.md](openspec/changes/build-cherrychain-platform/tasks.md) for the full implementation roadmap.
