# CherryChain Development Setup

## Prerequisites

- **Rust** (1.70+): Install from [rustup.rs](https://rustup.rs/)
- **Node.js** (18+): Install from [nodejs.org](https://nodejs.org/)
- **cargo-watch** (optional but recommended): `cargo install cargo-watch`

## Quick Start

### Backend (Rust API Server)

```bash
# From project root
cargo run --bin api-server

# Or with auto-reload (recommended)
cargo watch -x 'run --bin api-server'
```

The backend will start on `http://localhost:3000`

### Frontend (React + Vite)

```bash
# In a new terminal
cd frontend
npm install  # First time only
npm run dev
```

The frontend will start on `http://localhost:5173` with hot module reload enabled.

## Development Workflow

1. **Start backend**: `cargo watch -x 'run --bin api-server'`
2. **Start frontend**: `cd frontend && npm run dev`
3. **Open browser**: Navigate to `http://localhost:5173`
4. **Make changes**: Both backend and frontend will auto-reload

## Running Tests

```bash
# Run all Rust tests
cargo test --workspace

# Run with output
cargo test --workspace -- --nocapture

# Frontend tests (when implemented)
cd frontend && npm test
```

## Building for Production

```bash
# Backend
cargo build --release

# Frontend
cd frontend && npm run build
```

## Troubleshooting

- **WebSocket connection fails**: Ensure the backend is running on port 3000
- **Port already in use**: Change ports in `api-server/src/main.rs` and `frontend/vite.config.ts`
- **Slow Rust compilation**: Use `cargo watch` for incremental builds
