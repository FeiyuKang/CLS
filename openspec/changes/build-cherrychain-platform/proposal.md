# Change: Build CherryChain Digital Twin Platform

## Why

This project addresses a critical educational gap in modern logistics understanding. Traditional logistics education focuses on physical transportation, but modern supply chains are fundamentally driven by data flow, real-time monitoring, and algorithmic optimization.

CherryChain simulates the complex cross-ocean cold chain logistics of Chilean cherries to China (20,000+ km journey), where temperature deviations of just 2°C can cause 20% cargo loss, and timing windows around Chinese New Year create extreme price volatility. This provides a high-stakes, real-world scenario to demonstrate how data-driven decision-making, IoT monitoring, and predictive analytics transform supply chain operations.

## What Changes

This is a greenfield project establishing the foundation for an educational logistics simulation platform with four core capabilities:

- **Simulation Engine (Rust backend)**: High-performance physics and decay modeling using ECS architecture (Entity-Component-System) to handle thousands of concurrent containers with real-time quality degradation calculations based on Arrhenius equations
- **3D Visualization System (Three.js)**: WebGL-based digital twin interface with dual-scale rendering (macro: global shipping routes on 3D Earth, micro: container-level thermal mapping inside ships)
- **Management Interface**: Strategic decision-making panel for procurement, shipping mode selection (ocean fast-ship vs air freight), reefer temperature control, and emergency response to equipment failures
- **Data Analytics Dashboard**: Real-time BI system with quality prediction (remaining shelf-life based on temperature integrals), financial ROI tracking, and historical trend visualization

The platform emphasizes educational value by making invisible data flows visible through:
- Color-coded container visualization (green → red representing decay state)
- Real-time shelf-life countdown based on temperature exposure
- Economic trade-off visibility (shipping cost vs arrival price vs spoilage risk)
- Scenario-based challenges (port strikes, equipment failures, weather disruptions)

## Impact

- **Affected specs**: All new capabilities (no existing specs to modify)
  - `simulation-engine`: Container state management, decay physics, pathfinding
  - `visualization-system`: 3D rendering, camera controls, real-time updates
  - `management-interface`: User controls, decision workflows, alert handling
  - `data-analytics`: Metrics calculation, charting, prediction models

- **Affected code**: Full greenfield implementation
  - Backend: Rust workspace with Axum/Actix-web server, ECS logic, WebSocket broadcaster
  - Frontend: React/Vue + Three.js (via React-Three-Fiber), UI overlays, chart libraries
  - Shared: Data models, network protocols, validation schemas

- **Development approach**: Four-sprint iterative delivery (MVP → Visualization → Simulation → Game Loop)

- **Technical constraints**:
  - Must maintain 60fps rendering for 1000+ container instances (requires InstancedMesh optimization)
  - WebSocket updates compressed to <100KB per second for scalability
  - Decay calculations must use scientifically defensible approximations (Arrhenius-based)
  - Great Circle Route pathfinding on spherical coordinates (not flat-earth simplifications)
