# Management Interface

## ADDED Requirements

### Requirement: Shipment Creation Workflow
The system SHALL provide a form-based interface for users to create new shipments with configurable transport mode, temperature settings, and quantity.

#### Scenario: Standard shipment creation
- **WHEN** user fills in origin port (Chile), destination (China), transport mode (ocean fast-ship), reefer temperature (0°C), and quantity (100 tons)
- **THEN** the system validates inputs and creates a new shipment entity
- **AND** the shipment appears in the active shipments list
- **AND** the backend simulation begins tracking the new containers

#### Scenario: Cost estimation preview
- **WHEN** user selects transport mode (ocean vs air freight) before submitting
- **THEN** the form displays estimated cost, transit time, and baseline spoilage risk
- **AND** cost difference between modes is clearly shown (e.g., "Air: $5000/ton, 2 days" vs "Ocean: $800/ton, 18 days")

### Requirement: Temperature Control Configuration
The system SHALL allow users to set and adjust reefer container target temperatures with visual feedback on quality impact.

#### Scenario: Temperature adjustment
- **WHEN** user adjusts target temperature slider for an active shipment (range -2°C to +10°C)
- **THEN** the new target is sent to the backend
- **AND** a tooltip shows predicted quality retention percentage based on the temperature choice

#### Scenario: Controlled atmosphere settings
- **WHEN** user enables modified atmosphere packaging (MAP) option
- **THEN** decay rate is reduced by 20% in the simulation
- **AND** cost per container increases by $50

### Requirement: Alert and Notification System
The system SHALL display real-time alerts for critical events (reefer failure, delays, quality thresholds) with actionable response options.

#### Scenario: Reefer malfunction alert
- **WHEN** a container's reefer unit fails (event from backend)
- **THEN** a notification toast appears with details (container ID, current quality, time to critical loss)
- **AND** user is presented with action buttons: "Emergency Port Diversion" or "Discount Pre-sale"
- **WHEN** user selects an action
- **THEN** the decision is sent to backend to modify simulation state

#### Scenario: Quality threshold warning
- **WHEN** a container's quality drops below 70%
- **THEN** a warning indicator appears on the shipment card
- **AND** user can click to view detailed temperature history and quality projection

### Requirement: Active Shipments Dashboard
The system SHALL display a real-time list of all active shipments with key metrics (location, ETA, quality, ROI).

#### Scenario: Shipment card display
- **WHEN** viewing the dashboard with 10 active shipments
- **THEN** each shipment shows: route map thumbnail, current position percentage, estimated arrival date, average quality, and projected profit/loss
- **AND** shipments are sorted by urgency (closest to quality threshold first)

#### Scenario: Shipment filtering
- **WHEN** user applies filter "Show only at-risk shipments"
- **THEN** only shipments with quality <80% or temperature violations are displayed
- **AND** filter state persists across page refreshes

### Requirement: Decision History Log
The system SHALL record all user decisions (shipment creation, temperature changes, emergency actions) in a timestamped audit trail.

#### Scenario: Action logging
- **WHEN** user creates a shipment or responds to an alert
- **THEN** the action is logged with timestamp, decision type, and parameters
- **AND** the log is visible in a dedicated history panel

#### Scenario: Scenario replay analysis
- **WHEN** user completes a scenario (voyage ends)
- **THEN** a summary report shows all decisions made, their outcomes, and alternative paths (e.g., "If you had diverted to port, quality would have been 85% vs actual 65%")
