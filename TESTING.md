# CherryChain Testing Guide

This guide explains how to test the Sprint 1 MVP implementation.

## Prerequisites

### Install Rust (if not already installed)

#### Windows
```powershell
# Download and run rustup-init.exe from https://rustup.rs/
# Or use winget:
winget install Rustlang.Rustup
```

#### Linux/macOS
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env
```

### Verify Installation
```bash
rustc --version
cargo --version
```

## Sprint 1 MVP: Testing Instructions

### Backend Tests

#### 1. Build and Test Rust Workspace
```bash
# Build all crates
cargo build

# Run unit tests
cargo test

# Check for compilation errors
cargo check
```

#### 2. Run the API Server
```bash
# Start the backend server
cd api-server
cargo run

# Expected output:
# Starting CherryChain API server on 127.0.0.1:3000
```

The server will:
- Listen on `http://localhost:3000`
- Accept WebSocket connections at `ws://localhost:3000/ws`
- Spawn a test container at Chile coordinates (-33°, -71°)
- Update simulation at 10Hz
- Broadcast state to clients at 1Hz

### Frontend Tests

#### 1. Build Frontend
```bash
cd frontend
npm install  # If not already done
npm run build
```

#### 2. Run Development Server
```bash
# In frontend directory
npm run dev

# Expected output:
# VITE ready in XXX ms
# Local: http://localhost:5173/
```

### Integration Testing

#### Test 2.10: Container Movement (Chile to China)

1. **Start Backend**:
   ```bash
   cd api-server
   cargo run
   ```

2. **Start Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```

3. **Open Browser**: Navigate to `http://localhost:5173`

4. **Verify**:
   - ✓ Green "Connected" indicator appears in top-right
   - ✓ Container count shows "1"
   - ✓ Sim Time increases each second
   - ✓ 3D Earth sphere is visible and slowly rotating
   - ✓ Orange cube (container) appears on Earth surface
   - ✓ Container gradually moves from South America (left) to Asia (right)
   - ✓ Camera can rotate/zoom with mouse (OrbitControls)

5. **Expected Journey**:
   - Start: -33° lat, -71° lon (Chile)
   - End: 31° lat, 121° lon (China)
   - Duration: ~30 simulated days (can be sped up by adjusting time scale)

#### Test 2.11: WebSocket Reconnection

1. **With Frontend Running**:
   - Note the green "Connected" status
   - Stop the backend server (Ctrl+C)
   - Observe status changes to red "Disconnected"

2. **Restart Backend**:
   ```bash
   cargo run
   ```

3. **Verify**:
   - ✓ Frontend automatically reconnects within 2 seconds
   - ✓ Status returns to green "Connected"
   - ✓ Simulation resumes (note: sim time resets as backend restarted)
   - ✓ Container reappears at starting position

### Visual Verification Checklist

- [ ] 3D sphere renders (blue/gray color)
- [ ] Sphere rotates slowly
- [ ] Container cube visible (orange color)
- [ ] Container positioned on sphere surface (not inside or floating)
- [ ] Mouse drag rotates camera around Earth
- [ ] Mouse wheel zooms in/out (limited to 1.5-5 units)
- [ ] Connection status indicator updates correctly
- [ ] Sim time counter increments
- [ ] No console errors in browser DevTools

## Quick Start Script

Use the provided convenience scripts:

### Windows
```powershell
.\start-dev.ps1
```

### Linux/macOS
```bash
chmod +x start-dev.sh
./start-dev.sh
```

These scripts will:
1. Start the backend server in one terminal
2. Start the frontend dev server in another terminal
3. Automatically open your browser to `http://localhost:5173`

## Troubleshooting

### Backend Issues

**Error: "cargo: command not found"**
- Install Rust using instructions above
- Restart your terminal after installation

**Error: "port 3000 already in use"**
- Kill the process using port 3000:
  ```bash
  # Windows
  netstat -ano | findstr :3000
  taskkill /PID <PID> /F

  # Linux/macOS
  lsof -ti:3000 | xargs kill -9
  ```

**WebSocket Connection Fails**
- Ensure backend is running on port 3000
- Check firewall settings
- Verify CORS is enabled (already configured)

### Frontend Issues

**TypeScript Errors**
- Ensure all dependencies are installed: `npm install`
- Clear cache: `rm -rf node_modules package-lock.json && npm install`

**3D Scene Not Rendering**
- Check browser console for WebGL errors
- Ensure browser supports WebGL 2.0 (most modern browsers do)
- Try a different browser (Chrome/Firefox recommended)

**Container Not Moving**
- Verify backend is sending updates (check Network tab in DevTools)
- Check WebSocket connection status
- Ensure simulation time is incrementing

## Performance Benchmarks

### Expected Performance
- **Backend tick time**: <1ms for single container
- **Frontend FPS**: 60fps on modern hardware
- **WebSocket payload**: <1KB per update (for 1 container)
- **Network frequency**: 1 message/second from server

### Monitoring
```bash
# Backend logs show tick timing
RUST_LOG=debug cargo run

# Frontend: Open Chrome DevTools
# - Performance tab: Record and check frame rate
# - Network tab: Monitor WebSocket messages (WS filter)
```

## Next Steps After Testing

Once Sprint 1 MVP tests pass:
- Proceed to Sprint 2: Visualization Upgrade
- Add Earth textures
- Implement Great Circle routes
- Optimize for 1000+ containers with InstancedMesh
