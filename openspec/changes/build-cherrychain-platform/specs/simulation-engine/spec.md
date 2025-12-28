# Simulation Engine

## ADDED Requirements

### Requirement: Container Entity Management
The system SHALL maintain state for individual shipping containers using an Entity-Component-System (ECS) architecture, where each container is a unique entity with position, environmental, and cargo quality components.

#### Scenario: Container initialization
- **WHEN** a new shipment is created from a Chilean orchard
- **THEN** the system creates a container entity with initial position (Chilean port coordinates), target temperature (0-2°C), cargo quality (100%), and unique identifier

#### Scenario: Concurrent container updates
- **WHEN** the simulation tick processes 1000+ active containers
- **THEN** all position, temperature, and quality states are updated within 16ms (to support 60Hz frontend updates)

### Requirement: Quality Decay Calculation
The system SHALL compute cargo quality degradation based on temperature exposure using a simplified Arrhenius equation: `Q(t) = Q₀ × e^(-k×T×Δt)`, where T is real-time temperature and k is a decay rate constant.

#### Scenario: Optimal temperature maintenance
- **WHEN** a reefer container maintains 0-2°C for 24 simulated hours
- **THEN** quality decay is less than 1% per day

#### Scenario: Temperature deviation impact
- **WHEN** temperature rises to 10°C for 6 simulated hours
- **THEN** quality decay accelerates by at least 5× compared to optimal conditions
- **AND** the system logs a temperature violation event

### Requirement: Great Circle Route Pathfinding
The system SHALL calculate maritime routes using spherical geometry (great circle paths) between port coordinates, not flat-earth linear interpolation.

#### Scenario: Chile to China route calculation
- **WHEN** routing from Valparaíso (-33.0°S, -71.6°W) to Shanghai (31.2°N, 121.5°E)
- **THEN** the path follows the great circle arc across the Pacific
- **AND** total distance is approximately 18,000-20,000 km

#### Scenario: Route perturbations
- **WHEN** a random weather event (storm/current) occurs along the route
- **THEN** vessel speed is adjusted by ±10-30% for that segment
- **AND** arrival time prediction is recalculated

### Requirement: WebSocket State Synchronization
The system SHALL broadcast differential state updates to connected clients via WebSocket at 1Hz frequency, transmitting only changed entities to minimize bandwidth.

#### Scenario: Delta update generation
- **WHEN** 50 out of 1000 containers have position or quality changes in a tick
- **THEN** the WebSocket message contains only those 50 entities
- **AND** message payload is under 10KB compressed

#### Scenario: Client connection recovery
- **WHEN** a client reconnects after disconnection
- **THEN** the server sends a full state snapshot of all active entities
- **AND** then resumes delta updates

### Requirement: Emergency Event Simulation
The system SHALL inject random critical events (reefer malfunction, port congestion, customs delay) with configurable probability to create decision-making scenarios.

#### Scenario: Reefer malfunction trigger
- **WHEN** a container's reefer unit fails (random 2% chance per voyage)
- **THEN** internal temperature rises at 0.5°C per simulated hour
- **AND** an alert event is queued for the management interface
- **AND** quality decay accelerates according to the decay model

#### Scenario: Port congestion event
- **WHEN** a destination port experiences congestion
- **THEN** all inbound vessels are delayed by 24-72 simulated hours
- **AND** containers continue temperature-dependent decay during the delay
