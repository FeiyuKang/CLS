# Data Analytics

## ADDED Requirements

### Requirement: Real-Time Quality Prediction
The system SHALL calculate and display remaining shelf-life for each container based on accumulated temperature exposure using temperature-integral models.

#### Scenario: Shelf-life calculation
- **WHEN** a container has been in transit for 10 days with average temperature 1°C
- **THEN** the system displays remaining shelf-life in days until quality drops below market-acceptable threshold (80%)
- **AND** prediction updates every simulation tick as temperature fluctuates

#### Scenario: Prediction confidence intervals
- **WHEN** temperature data is volatile (±2°C swings)
- **THEN** shelf-life prediction shows a range (e.g., "12-15 days remaining") rather than a single number
- **AND** confidence level is displayed as a percentage

### Requirement: Financial ROI Dashboard
The system SHALL compute and visualize real-time return on investment (ROI) for each shipment, accounting for transport costs, spoilage, and projected sale price.

#### Scenario: ROI calculation
- **WHEN** viewing a shipment's financial metrics
- **THEN** the dashboard displays:
  - Total transport cost (freight + reefer operation)
  - Current projected sale price (based on quality and arrival date relative to Chinese New Year peak)
  - Estimated spoilage loss (degraded quality units)
  - Net profit/loss projection
- **AND** values update in real-time as quality and ETA change

#### Scenario: Market price volatility modeling
- **WHEN** a shipment arrives before Chinese New Year (peak season)
- **THEN** sale price multiplier is 2-3× baseline
- **WHEN** arrival is after the holiday
- **THEN** price multiplier drops to 0.5-0.7× baseline
- **AND** the price curve is visualized on a timeline chart

### Requirement: Temperature History Visualization
The system SHALL display historical temperature curves for individual containers with violation markers and statistical summaries.

#### Scenario: Temperature timeline chart
- **WHEN** user selects a container to analyze
- **THEN** a line chart shows temperature over time with:
  - Target temperature range (green band: 0-2°C)
  - Actual temperature trace (color-coded: green in-range, red out-of-range)
  - Violation markers at timestamp points where threshold was exceeded
- **AND** chart supports zoom and pan for detailed inspection

#### Scenario: Statistical summary
- **WHEN** viewing temperature history
- **THEN** summary panel shows:
  - Mean temperature
  - Standard deviation
  - Percentage of time in optimal range
  - Number and duration of violations

### Requirement: Port Congestion Index
The system SHALL aggregate and display port congestion metrics (queue length, average delay) to inform routing decisions.

#### Scenario: Port status heatmap
- **WHEN** viewing the global logistics overview
- **THEN** destination ports are color-coded by congestion level:
  - Green: <1 day delay
  - Yellow: 1-3 days delay
  - Red: >3 days delay
- **AND** clicking a port shows queue details (number of waiting vessels, estimated clearance time)

#### Scenario: Congestion trend analysis
- **WHEN** a port experiences increasing congestion over 7 days
- **THEN** a trend indicator (upward arrow) appears
- **AND** a notification suggests considering alternative ports

### Requirement: Scenario Performance Metrics
The system SHALL calculate and display aggregate performance scores at the end of a scenario (voyage or seasonal cycle).

#### Scenario: End-of-season scorecard
- **WHEN** the simulated season ends (e.g., all shipments have arrived or spoiled)
- **THEN** a scorecard displays:
  - Total profit/loss
  - Average cargo quality across all shipments
  - On-time delivery rate
  - Number of emergency interventions
  - Comparative ranking against baseline AI strategy
- **AND** performance is categorized (S/A/B/C/D grade)

#### Scenario: Decision impact breakdown
- **WHEN** viewing the scorecard
- **THEN** a breakdown shows impact of each decision type:
  - "Temperature optimization saved $X in spoilage"
  - "Port diversion cost $Y but saved $Z in quality retention"
- **AND** suggestions for improvement are generated (e.g., "Consider air freight for late-season shipments")
