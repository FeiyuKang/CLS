# Visualization System

## ADDED Requirements

### Requirement: 3D Globe Rendering
The system SHALL render an interactive 3D Earth using Three.js with accurate geographic projection, texture mapping, and smooth camera controls.

#### Scenario: Initial globe view
- **WHEN** the application loads
- **THEN** a textured 3D sphere representing Earth is displayed
- **AND** the camera is positioned to show the Pacific Ocean route between South America and Asia
- **AND** frame rate is maintained at 60fps

#### Scenario: Camera orbit and zoom
- **WHEN** user drags mouse to rotate the globe
- **THEN** the globe rotates smoothly following mouse movement
- **WHEN** user scrolls to zoom
- **THEN** camera distance adjusts between 1.5× and 10× Earth radius without clipping

### Requirement: Shipping Route Visualization
The system SHALL display active shipping routes as glowing curved lines following great circle paths on the globe surface.

#### Scenario: Route rendering
- **WHEN** multiple active routes exist between ports
- **THEN** each route is rendered as a smooth Bézier curve elevated slightly above the globe surface
- **AND** routes use emissive materials with color intensity indicating traffic volume

#### Scenario: Route animation
- **WHEN** a vessel moves along a route
- **THEN** a moving particle or glow pulse travels along the curve to visualize progress

### Requirement: Container Instance Rendering
The system SHALL efficiently render 1000+ container entities using Three.js InstancedMesh to maintain 60fps performance.

#### Scenario: Bulk container rendering
- **WHEN** 1000 containers are active across multiple vessels
- **THEN** all containers are rendered using a single InstancedMesh draw call
- **AND** frame rate remains at or above 60fps on mid-range hardware

#### Scenario: Quality-based color coding
- **WHEN** container quality data is received from the backend
- **THEN** container color interpolates from green (100% quality) to yellow (50%) to red (0%)
- **AND** color updates are applied to instance attributes without recreating geometry

### Requirement: Vessel Detail View
The system SHALL provide a "zoom-in" micro-view showing internal container stacking and temperature distribution when a vessel is selected.

#### Scenario: Vessel selection
- **WHEN** user clicks on a vessel marker on the globe
- **THEN** the view transitions to a cutaway 3D model of the ship's cargo hold
- **AND** containers are displayed in a grid layout matching actual stowage

#### Scenario: Thermal heatmap overlay
- **WHEN** in vessel detail view
- **THEN** each container displays a temperature-based heatmap texture
- **AND** containers with temperature violations are highlighted with warning icons

### Requirement: Real-Time WebSocket Updates
The system SHALL receive and apply backend state updates via WebSocket at 1Hz without blocking the rendering loop.

#### Scenario: Delta update processing
- **WHEN** a WebSocket message with 50 entity updates arrives
- **THEN** entity positions and properties are updated in the next animation frame
- **AND** interpolation is applied to create smooth motion between 1Hz server updates

#### Scenario: Connection loss handling
- **WHEN** WebSocket connection is lost
- **THEN** a "connection lost" indicator appears
- **AND** the visualization freezes at last known state
- **WHEN** connection is restored
- **THEN** the indicator disappears and updates resume

### Requirement: Performance Monitoring Overlay
The system SHALL display real-time rendering statistics (FPS, draw calls, entity count) in a developer overlay when enabled.

#### Scenario: Performance metrics display
- **WHEN** debug mode is enabled via URL parameter
- **THEN** an overlay shows current FPS, number of active entities, and WebSocket latency
- **AND** the overlay updates every 500ms without impacting frame rate
