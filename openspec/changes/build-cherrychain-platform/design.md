# CherryChain Platform Architecture Design

## Context

CherryChain is an educational logistics simulation platform that models the cross-ocean cold chain journey of Chilean cherries to China. The platform must balance realism (scientifically defensible decay models, accurate geography) with performance (1000+ concurrent containers at 60fps) while remaining approachable for educational use.

**Key constraints:**
- Must run in web browsers (no native app installation)
- Target audience includes students and logistics professionals without gaming-grade hardware
- Simulation must be deterministic for educational replay and analysis
- Real-time visualization is critical for understanding data flow concepts

## Goals / Non-Goals

**Goals:**
- Demonstrate how data monitoring drives modern logistics (temperature sensors → decay prediction → routing decisions)
- Achieve 60fps rendering with 1000+ containers on mid-range hardware
- Provide scientifically defensible decay modeling (Arrhenius-based) that produces realistic quality loss
- Enable scenario-based learning with repeatable challenges
- Minimize network bandwidth (<100KB/s) for WebSocket updates

**Non-Goals:**
- Not a multiplayer competitive game (single-player educational focus)
- Not a full ERP system (simplified to core logistics concepts)
- Not pursuing photorealistic graphics (stylized tech aesthetic acceptable)
- Not mobile-first (desktop browser experience prioritized)

## Decisions

### Decision 1: Rust Backend with ECS Architecture

**What:** Use Rust with Entity-Component-System (ECS) pattern for simulation engine.

**Why:**
- **Performance:** Rust's zero-cost abstractions and SIMD support enable processing 1000+ containers per tick at <16ms
- **Correctness:** Ownership system prevents data races in concurrent updates
- **ECS fit:** Each container is an entity; position/temperature/quality are components; movement/decay are systems. This naturally parallelizes updates.

**Alternatives considered:**
- Node.js backend: Simpler for web developers but 3-5× slower for heavy numerical computation; GC pauses could cause frame drops
- Python + NumPy: Good for scientific computing but harder to deploy as web service; still slower than native Rust
- Unity/Godot as server: Overkill for simulation-only; poor WebSocket performance; licensing complexity

**Trade-offs:**
- Steeper learning curve for contributors unfamiliar with Rust
- Longer compile times during development
- **Mitigation:** Provide clear onboarding docs; use `cargo watch` for auto-rebuild; keep business logic in smaller crates

### Decision 2: Three.js with InstancedMesh for Rendering

**What:** Use Three.js (via React-Three-Fiber) with InstancedMesh for bulk container rendering.

**Why:**
- **Performance:** InstancedMesh allows 1000+ containers in a single draw call (vs 1000 draw calls with individual meshes)
- **Ecosystem:** React-Three-Fiber enables component-based 3D scene management; mature Three.js community
- **WebGL compatibility:** Broad browser support without plugin installation

**Alternatives considered:**
- Babylon.js: Similar performance but smaller community; fewer React integrations
- Raw WebGL: Maximum control but 10× development cost; no higher-level scene graph
- Unity WebGL export: Large bundle size (30+ MB); black-box compilation; poor debuggability

**Trade-offs:**
- Instance attributes require manual management (color updates need buffer manipulation)
- React-Three-Fiber adds abstraction layer overhead
- **Mitigation:** Use `useFrame` hook for per-frame updates; batch attribute changes; profile with Chrome DevTools

### Decision 3: WebSocket with Delta Updates at 1Hz

**What:** Backend broadcasts differential state updates (only changed entities) via WebSocket at 1Hz; frontend interpolates for smooth 60fps animation.

**Why:**
- **Bandwidth:** Sending only deltas reduces payload from ~500KB (full state) to <10KB per update
- **Latency:** WebSocket provides <50ms round-trip vs HTTP polling at ~200ms
- **Smoothness:** Frontend interpolation decouples network cadence from render rate

**Alternatives considered:**
- HTTP long-polling: Higher latency; more complex reconnection logic; no server push
- 10Hz updates: 10× bandwidth with marginal smoothness gain; server CPU waste
- Server-sent events (SSE): Unidirectional only; no client commands; less mature tooling

**Trade-offs:**
- Interpolation can cause brief visual lag on rapid state changes (e.g., emergency port diversion)
- WebSocket connection management adds complexity (reconnection, buffering)
- **Mitigation:** Exponential backoff for reconnects; freeze visualization on disconnect; extrapolate position along known routes

### Decision 4: Simplified Arrhenius Decay Model

**What:** Use exponential decay formula `Q(t+Δt) = Q(t) × e^(-k×T×Δt)` where k is tuned to match real-world cherry spoilage data.

**Why:**
- **Educational clarity:** Exponential curves are intuitive ("temperature doubles decay rate every X degrees")
- **Performance:** Single multiplication and exp() call per container per tick
- **Scientific basis:** Arrhenius equation is standard in food science; our simplification removes activation energy term but preserves temperature sensitivity

**Alternatives considered:**
- Full Arrhenius with activation energy: More accurate but requires calibration data we don't have; harder to explain to students
- Lookup tables: Faster but loses continuous temperature dependence; discontinuities at table boundaries
- Linear decay: Too unrealistic; doesn't capture exponential spoilage acceleration

**Trade-offs:**
- k constant must be empirically tuned (no first-principles derivation)
- Ignores humidity, gas composition (CO2/O2 levels in controlled atmosphere)
- **Mitigation:** Provide k calibration guide; add "modified atmosphere" multiplier as separate parameter; document assumptions in educational materials

### Decision 5: Four-Sprint Delivery Roadmap

**What:** Deliver in four iterative sprints with increasing complexity.

**Sprint sequence:**
1. **MVP (Week 1-2):** Rust backend with basic WebSocket, Three.js globe with moving point
2. **Visualization (Week 3-4):** Earth textures, glowing routes, ship models, camera controls
3. **Simulation (Week 5-6):** Decay algorithm, temperature control, quality visualization, reefer failures
4. **Game Loop (Week 7-8):** Money system, ROI dashboard, scoring, scenario challenges

**Why:**
- **Risk reduction:** Each sprint delivers a working end-to-end vertical slice
- **Early validation:** Can test Rust ↔ WebSocket ↔ Three.js pipeline in Sprint 1
- **Incremental learning:** Team builds domain knowledge progressively (geography → physics → economics)

**Alternatives considered:**
- Waterfall (backend first, then frontend): Integration risks deferred to end; no early visual feedback
- Feature-based (all simulation, then all UI): Harder to demo progress; integration hell
- Parallel tracks (backend/frontend teams): Requires tight coordination; merge conflicts; communication overhead

**Trade-offs:**
- Some rework expected (e.g., refactoring data structures as complexity grows)
- May need to stub out features temporarily (mock decay in Sprint 2)
- **Mitigation:** Use feature flags; keep clear API contracts; allocate 20% sprint time for refactoring

## Risks / Trade-offs

### Risk: Performance degradation at scale
**Scenario:** 1000 containers with complex shaders drops below 60fps on target hardware.

**Mitigation:**
- Profile early with `chrome://tracing` and Three.js stats
- Use Level-of-Detail (LOD): simplified geometry when zoomed out
- Cull containers outside camera frustum
- Fallback: reduce max containers to 500 if hardware can't sustain 1000

### Risk: Network instability in educational settings
**Scenario:** School/corporate networks block WebSocket or have high latency.

**Mitigation:**
- Detect connection quality and display warning
- Implement aggressive reconnection with exponential backoff
- Fallback mode: reduce update frequency to 0.5Hz if latency >500ms
- Offline mode (future): pre-baked scenarios with local simulation

### Risk: Decay model too simplistic for domain experts
**Scenario:** Food science experts criticize lack of humidity/gas modeling.

**Mitigation:**
- Clearly document as "educational approximation, not research tool" in docs
- Provide references to full Arrhenius models for advanced users
- Modular design: allow k constant tuning or pluggable decay functions

### Risk: Rust expertise barrier for contributors
**Scenario:** Few contributors comfortable with Rust ownership/borrow checker.

**Mitigation:**
- Provide clear "Rust for JS developers" onboarding guide
- Keep ECS logic isolated in small, well-documented modules
- Use high-level frameworks (Axum) that hide async complexity
- Frontend (Three.js) can be contributed to independently

## Migration Plan

N/A - This is a greenfield project with no existing system to migrate from.

**Deployment plan:**
1. Sprint 1: Deploy MVP to staging environment (e.g., Vercel for frontend, Fly.io for Rust backend)
2. Sprint 2-3: Continuous deployment with feature flags (enable new capabilities incrementally)
3. Sprint 4: Public beta release to educational pilot users
4. Post-launch: Gather feedback and iterate on decay parameters and UI flow

## Open Questions

1. **Q: Should we support multiple simultaneous scenarios (e.g., different seasons)?**
   - **A (Decision pending):** Start with single active scenario; add multi-scenario in Phase 2 if users request it.

2. **Q: How to handle time acceleration (1 real second = X simulation hours)?**
   - **A (Decision pending):** Configurable speed multiplier (1× to 60×); default 10× for reasonable session length (~10 minutes for full voyage).

3. **Q: Should decay model account for cherry variety (e.g., Bing vs Rainier)?**
   - **A (Decision pending):** Start with generic "cherry" entity; add varieties if educational value is clear (different k constants).

4. **Q: Localization for Chinese educational market?**
   - **A (Decision pending):** UI strings in JSON files for i18n; Chinese translation in Phase 2 if pilot schools request it.

5. **Q: Licensing for Earth textures and ship 3D models?**
   - **A (Decision pending):** Use NASA Blue Marble (public domain) for Earth; source CC0 or MIT-licensed ship models from Sketchfab/TurboSquid; budget for commissioned models if needed.
