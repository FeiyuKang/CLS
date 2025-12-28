/// CherryChain simulation engine
/// Handles ECS-based container state management, movement, and decay physics

use shared_types::{ContainerEntity, EntityId, Position, WorldState};
use std::collections::HashMap;

/// Arrhenius decay model constants for cherry quality degradation
/// Based on food science literature for temperature-dependent decay
mod decay_constants {
    /// Pre-exponential factor (reaction frequency factor)
    /// Calibrated for cherry spoilage: ~1% decay per day at optimal temp
    pub const A: f64 = 1e8;

    /// Activation energy (J/mol) for cherry decay reaction
    /// Typical for fruit respiration/decay: 50-80 kJ/mol
    pub const EA: f64 = 60_000.0;

    /// Universal gas constant (J/(mol·K))
    pub const R: f64 = 8.314;

    /// Reference/optimal storage temperature for cherries (Celsius)
    pub const OPTIMAL_TEMP: f64 = 0.0;

    /// Base decay rate at optimal temperature (quality loss per second)
    /// ~0.5% per day = 5.787e-8 per second
    pub const BASE_DECAY_RATE: f64 = 0.5 / (24.0 * 3600.0) / 100.0;
}

/// Simulation engine managing all container entities
pub struct SimulationEngine {
    entities: HashMap<EntityId, ContainerEntity>,
    next_id: EntityId,
    sim_time: f64,
}

impl SimulationEngine {
    /// Create new simulation engine
    pub fn new() -> Self {
        Self {
            entities: HashMap::new(),
            next_id: 1,
            sim_time: 0.0,
        }
    }

    /// Spawn a new container entity
    pub fn spawn_container(&mut self, position: Position, target_temp: f64) -> EntityId {
        let id = self.next_id;
        self.next_id += 1;

        let container = ContainerEntity {
            id,
            position,
            current_temp: target_temp,
            target_temp,
            quality: 100.0,
        };

        self.entities.insert(id, container);
        id
    }

    /// Update simulation by one tick (delta_time in seconds)
    pub fn tick(&mut self, delta_time: f64) {
        self.sim_time += delta_time;

        // Calculate progress once for this tick
        let progress = Self::calculate_progress(self.sim_time);

        // Apply systems to all containers
        for container in self.entities.values_mut() {
            // Movement system: great circle interpolation
            Self::update_movement_great_circle(container, progress);

            // Temperature system: simulate temperature drift
            Self::update_temperature(container, delta_time);

            // Decay system: Arrhenius-based quality degradation
            Self::update_decay(container, delta_time);
        }
    }

    /// Calculate progress based on simulation time
    fn calculate_progress(sim_time: f64) -> f64 {
        const JOURNEY_DURATION: f64 = 30.0 * 24.0 * 3600.0; // 30 days in seconds
        (sim_time / JOURNEY_DURATION).min(1.0)
    }

    /// Great circle movement system: spherical linear interpolation from Chile to China
    /// Chile: (-33, -71), China: (31, 121)
    /// Journey time: ~30 days at normal speed
    fn update_movement_great_circle(container: &mut ContainerEntity, progress: f64) {
        const START_LAT: f64 = -33.0;
        const START_LON: f64 = -71.0;
        const END_LAT: f64 = 31.0;
        const END_LON: f64 = 121.0;

        let (lat, lon) = Self::interpolate_great_circle(
            START_LAT, START_LON,
            END_LAT, END_LON,
            progress
        );

        container.position.lat = lat;
        container.position.lon = lon;
    }

    /// Spherical linear interpolation along a great circle
    /// Uses haversine formula for angular distance and slerp for interpolation
    fn interpolate_great_circle(
        lat1: f64, lon1: f64,
        lat2: f64, lon2: f64,
        t: f64
    ) -> (f64, f64) {
        // Convert to radians
        let phi1 = lat1.to_radians();
        let lambda1 = lon1.to_radians();
        let phi2 = lat2.to_radians();
        let lambda2 = lon2.to_radians();

        // Calculate angular distance using haversine
        let d_lambda = lambda2 - lambda1;
        let cos_d = phi1.sin() * phi2.sin() + phi1.cos() * phi2.cos() * d_lambda.cos();
        let d = cos_d.clamp(-1.0, 1.0).acos();

        if d.abs() < 0.0001 {
            return (lat1, lon1);
        }

        // Spherical linear interpolation (slerp)
        let sin_d = d.sin();
        let a = ((1.0 - t) * d).sin() / sin_d;
        let b = (t * d).sin() / sin_d;

        // Cartesian coordinates of interpolated point
        let x = a * phi1.cos() * lambda1.cos() + b * phi2.cos() * lambda2.cos();
        let y = a * phi1.cos() * lambda1.sin() + b * phi2.cos() * lambda2.sin();
        let z = a * phi1.sin() + b * phi2.sin();

        // Convert back to lat/lon
        let lat = z.atan2((x * x + y * y).sqrt()).to_degrees();
        let lon = y.atan2(x).to_degrees();

        (lat, lon)
    }

    /// Temperature system: simulate temperature drift and reefer control
    /// Temperature slowly drifts toward ambient and reefer tries to correct
    fn update_temperature(container: &mut ContainerEntity, delta_time: f64) {
        // Ambient temperature varies with position (warmer near equator)
        let equator_distance = container.position.lat.abs() / 90.0;
        let ambient_temp = 25.0 - 10.0 * equator_distance; // 15-25°C range

        // Reefer cooling rate (how fast it can cool, degrees per second)
        const REEFER_COOLING_RATE: f64 = 0.01; // ~36°C per hour max

        // Heat leak rate (how fast ambient heat enters, degrees per second per degree difference)
        const HEAT_LEAK_RATE: f64 = 0.0001;

        // Calculate temperature change
        let heat_leak = HEAT_LEAK_RATE * (ambient_temp - container.current_temp);

        // Reefer tries to reach target temp
        let temp_error = container.current_temp - container.target_temp;
        let reefer_correction = if temp_error > 0.0 {
            // Need to cool: apply cooling rate
            (-REEFER_COOLING_RATE).max(-temp_error / delta_time.max(0.001))
        } else {
            // Below target: allow slow warming (reefer doesn't heat)
            0.0
        };

        // Apply temperature changes
        container.current_temp += (heat_leak + reefer_correction) * delta_time;

        // Clamp to realistic range
        container.current_temp = container.current_temp.clamp(-5.0, 40.0);
    }

    /// Decay system: Arrhenius-based quality degradation
    /// Q(t) = Q(t-1) × e^(-k × dt) where k = A × e^(-Ea/RT)
    fn update_decay(container: &mut ContainerEntity, delta_time: f64) {
        use decay_constants::*;

        // Convert temperature to Kelvin
        let temp_kelvin = container.current_temp + 273.15;

        // Calculate Arrhenius rate constant
        // k = A × exp(-Ea / (R × T))
        let k = A * (-EA / (R * temp_kelvin)).exp();

        // Normalize to base decay rate at optimal temperature
        let optimal_kelvin = OPTIMAL_TEMP + 273.15;
        let k_optimal = A * (-EA / (R * optimal_kelvin)).exp();

        // Acceleration factor compared to optimal storage
        let acceleration = k / k_optimal;

        // Calculate decay for this time step
        // Using exponential decay: Q(t+dt) = Q(t) × e^(-rate × acceleration × dt)
        let decay_factor = (-BASE_DECAY_RATE * acceleration * delta_time).exp();

        container.quality *= decay_factor;

        // Clamp quality to valid range
        container.quality = container.quality.clamp(0.0, 100.0);
    }

    /// Get current world state
    pub fn get_state(&self) -> WorldState {
        WorldState {
            containers: self.entities.values().cloned().collect(),
            sim_time: self.sim_time,
        }
    }
}

impl Default for SimulationEngine {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_spawn_container() {
        let mut engine = SimulationEngine::new();
        let pos = Position { lat: -33.0, lon: -71.0 }; // Chile
        let id = engine.spawn_container(pos, 0.0);

        assert_eq!(id, 1);
        let state = engine.get_state();
        assert_eq!(state.containers.len(), 1);
        assert_eq!(state.containers[0].quality, 100.0);
    }

    #[test]
    fn test_great_circle_interpolation() {
        // Test midpoint of Chile to China route
        let (lat, lon) = SimulationEngine::interpolate_great_circle(
            -33.0, -71.0,  // Chile
            31.0, 121.0,   // China
            0.5
        );

        // Midpoint should be somewhere in the Pacific
        assert!(lat > -20.0 && lat < 20.0, "Midpoint latitude should be near equator");
        assert!(lon > -180.0 && lon < 180.0, "Longitude should be valid");
    }

    #[test]
    fn test_great_circle_endpoints() {
        // t=0 should return start point
        let (lat, lon) = SimulationEngine::interpolate_great_circle(
            -33.0, -71.0,
            31.0, 121.0,
            0.0
        );
        assert!((lat - (-33.0)).abs() < 0.01);
        assert!((lon - (-71.0)).abs() < 0.01);

        // t=1 should return end point
        let (lat, lon) = SimulationEngine::interpolate_great_circle(
            -33.0, -71.0,
            31.0, 121.0,
            1.0
        );
        assert!((lat - 31.0).abs() < 0.01);
        assert!((lon - 121.0).abs() < 0.01);
    }

    #[test]
    fn test_arrhenius_decay_rate() {
        let mut engine = SimulationEngine::new();
        let pos = Position { lat: -33.0, lon: -71.0 };
        engine.spawn_container(pos, 0.0); // Target temp 0°C

        // Get initial quality
        let initial_quality = engine.get_state().containers[0].quality;
        assert_eq!(initial_quality, 100.0);

        // Simulate one day at optimal temperature
        let one_day_seconds = 24.0 * 3600.0;
        let steps = 1000;
        let dt = one_day_seconds / steps as f64;

        for _ in 0..steps {
            engine.tick(dt);
        }

        let final_quality = engine.get_state().containers[0].quality;

        // At optimal temp (0°C), expect ~0.5% decay per day
        // So quality should be around 99.5%
        assert!(final_quality > 99.0 && final_quality < 100.0,
            "Quality after 1 day at optimal temp: {}", final_quality);
    }

    #[test]
    fn test_temperature_increases_decay() {
        // Container at high temperature should decay faster
        let mut container = ContainerEntity {
            id: 1,
            position: Position { lat: 0.0, lon: 0.0 },
            current_temp: 20.0, // High temp
            target_temp: 0.0,
            quality: 100.0,
        };

        let dt = 3600.0; // 1 hour
        SimulationEngine::update_decay(&mut container, dt);

        // High temp should cause significant decay
        assert!(container.quality < 100.0,
            "Quality should decrease at high temp: {}", container.quality);
        assert!(container.quality > 90.0,
            "But not too extreme: {}", container.quality);
    }

    #[test]
    fn test_temperature_control() {
        let mut container = ContainerEntity {
            id: 1,
            position: Position { lat: 0.0, lon: 0.0 },
            current_temp: 10.0, // Starting high
            target_temp: 0.0,   // Target optimal
            quality: 100.0,
        };

        // Simulate cooling
        for _ in 0..1000 {
            SimulationEngine::update_temperature(&mut container, 1.0);
        }

        // Temperature should approach target
        assert!(container.current_temp < 5.0,
            "Temperature should cool toward target: {}", container.current_temp);
    }
}
