# Implementation Tasks

## 1. Project Scaffolding and Setup

- [x] 1.1 Initialize Rust workspace with Cargo.toml (workspace members: `simulation-engine`, `api-server`, `shared-types`)
- [x] 1.2 Set up Axum web server skeleton with WebSocket endpoint
- [x] 1.3 Initialize React + TypeScript frontend project with Vite
- [x] 1.4 Install Three.js and React-Three-Fiber dependencies
- [x] 1.5 Configure development environment (cargo watch, hot module reload)
- [x] 1.6 Set up basic CI/CD pipeline (GitHub Actions: lint, test, build)

## 2. Sprint 1 - MVP: Connected World

### Backend
- [x] 2.1 Define core data structures (Position, ContainerEntity, WorldState) in `shared-types`
- [x] 2.2 Implement simple MovementSystem that updates container position along straight line
- [x] 2.3 Create WebSocket broadcaster that sends full world state every 1 second
- [x] 2.4 Add basic logging and error handling

### Frontend
- [x] 2.5 Render basic 3D sphere (Earth) using Three.js
- [x] 2.6 Add OrbitControls for camera rotation and zoom
- [x] 2.7 Implement WebSocket client that receives backend state
- [x] 2.8 Display a single moving cube representing a container (position updated from backend)
- [x] 2.9 Add connection status indicator (green=connected, red=disconnected)

### Validation
- [x] 2.10 Manual test: Start backend, open frontend, verify cube moves from Chile to China coordinates
- [x] 2.11 Test reconnection: kill backend, restart, verify frontend reconnects

## 3. Sprint 2 - Visualization Upgrade: Data Beauty

### 3D Assets and Styling
- [ ] 3.1 Apply Earth texture map (NASA Blue Marble or equivalent CC0 image)
- [ ] 3.2 Create custom GLSL shader for glowing shipping routes (emissive material)
- [ ] 3.3 Implement Great Circle curve generation (convert lat/long pairs to 3D arc)
- [ ] 3.4 Source or model simple ship 3D asset (low-poly tanker/cargo ship)
- [ ] 3.5 Add starfield background and atmospheric glow around Earth

### Rendering Optimization
- [ ] 3.6 Replace individual container cubes with InstancedMesh (prepare for 1000+ containers)
- [ ] 3.7 Implement instance attribute updates for position and color
- [ ] 3.8 Add route animation (particle/pulse traveling along route curve)

### UI Polish
- [ ] 3.9 Create HTML overlay for logo and basic stats (container count, sim time)
- [ ] 3.10 Add loading screen with progress indicator

### Validation
- [ ] 3.11 Visual review: Earth textures render correctly, routes are smooth arcs
- [ ] 3.12 Performance test: Render 1000 dummy containers, measure FPS (target: 60fps)

## 4. Sprint 3 - Core Simulation: Time and Decay

### Decay Physics
- [ ] 4.1 Implement Arrhenius decay algorithm in Rust (`DecaySystem`)
- [ ] 4.2 Add temperature component to ContainerEntity (current_temp, target_temp)
- [ ] 4.3 Calibrate k constant for realistic cherry spoilage (e.g., 0-2°C = 1% daily decay)
- [ ] 4.4 Add quality component (0-100%) that decreases per tick based on temperature

### Pathfinding
- [ ] 4.5 Refactor MovementSystem to use Great Circle Route calculation
- [ ] 4.6 Implement random perturbation (weather events) that adjust vessel speed ±20%
- [ ] 4.7 Add arrival detection (container reaches destination port)

### Backend State Management
- [ ] 4.8 Implement delta-update logic (only send changed entities in WebSocket messages)
- [ ] 4.9 Add event queue for alerts (reefer malfunction, quality threshold)
- [ ] 4.10 Compress WebSocket payloads (evaluate MessagePack vs JSON)

### Frontend Data Integration
- [ ] 4.11 Color-code containers by quality (green 100% → yellow 50% → red 0%)
- [ ] 4.12 Display quality percentage on hover tooltip
- [ ] 4.13 Create temperature history chart component (recharts or similar library)
- [ ] 4.14 Implement vessel detail view (click ship → show internal container grid)

### Validation
- [ ] 4.15 Test decay: Create container at 10°C, verify quality drops faster than 0°C
- [ ] 4.16 Test delta updates: Monitor network tab, confirm <10KB payloads at 1Hz
- [ ] 4.17 Visual test: Watch container colors change from green to red over simulated days

## 5. Sprint 4 - Game Loop: Operations and Challenge

### Management Interface
- [ ] 5.1 Build shipment creation form (origin, destination, mode, quantity, temperature)
- [ ] 5.2 Implement cost estimation logic (ocean vs air freight pricing)
- [ ] 5.3 Add active shipments dashboard (list view with key metrics)
- [ ] 5.4 Create alert notification component (toast or sidebar panel)
- [ ] 5.5 Implement emergency action handlers (port diversion, discount pre-sale)

### Data Analytics
- [ ] 5.6 Calculate real-time ROI (transport cost, spoilage loss, sale price)
- [ ] 5.7 Implement shelf-life prediction based on temperature integral
- [ ] 5.8 Create financial dashboard component (profit/loss, price timeline)
- [ ] 5.9 Add port congestion heatmap (color-code ports by delay)
- [ ] 5.10 Build end-of-scenario scorecard (total profit, quality %, grade)

### Event System
- [ ] 5.11 Implement reefer malfunction event (2% random chance, temp rises 0.5°C/hour)
- [ ] 5.12 Add port congestion event (24-72 hour random delays)
- [ ] 5.13 Create decision history log (record all user actions with timestamps)

### Simulation Enhancements
- [ ] 5.14 Add time acceleration control (1× to 60× speed slider)
- [ ] 5.15 Implement pause/resume functionality
- [ ] 5.16 Add scenario reset button (clear world state, start fresh)

### Polish and UX
- [ ] 5.17 Add tutorial overlay explaining core concepts (first-time user flow)
- [ ] 5.18 Implement keyboard shortcuts (space=pause, +/- for speed)
- [ ] 5.19 Create settings panel (toggle debug overlay, adjust audio)

### Validation
- [ ] 5.20 End-to-end scenario test: Create shipment, encounter reefer failure, make decision, complete voyage, verify scorecard
- [ ] 5.21 Load test: Run 10 simultaneous shipments (100+ containers), verify 60fps and <100KB/s network
- [ ] 5.22 User testing: Observe 3-5 test users completing a scenario, gather feedback

## 6. Documentation and Deployment

- [ ] 6.1 Write README with quickstart guide (how to run locally)
- [ ] 6.2 Document API contract (WebSocket message formats)
- [ ] 6.3 Create "Rust for JS developers" onboarding guide
- [ ] 6.4 Add inline code comments for complex algorithms (decay, pathfinding)
- [ ] 6.5 Set up staging deployment (Vercel frontend + Fly.io backend)
- [ ] 6.6 Create production deployment pipeline with environment configs
- [ ] 6.7 Write educational materials explaining decay model assumptions

## 7. Testing and Quality Assurance

- [ ] 7.1 Write unit tests for decay algorithm (verify exponential behavior)
- [ ] 7.2 Add integration tests for WebSocket message flow
- [ ] 7.3 Create visual regression tests for 3D rendering (screenshot comparison)
- [ ] 7.4 Performance benchmarks: measure tick time for 1000 containers (target <16ms)
- [ ] 7.5 Browser compatibility testing (Chrome, Firefox, Safari, Edge)
- [ ] 7.6 Accessibility audit (keyboard navigation, screen reader labels for dashboards)

## Notes

- Tasks are ordered for sequential delivery but some can be parallelized (e.g., 3.1-3.5 and 3.6-3.8)
- Validation tasks should be performed immediately after their sprint section
- If performance targets aren't met, revisit optimization (LOD, culling, reduce max containers)
- Each sprint should end with a working demo that can be shown to stakeholders
