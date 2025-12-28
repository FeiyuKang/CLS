/// CherryChain simulation engine
/// Handles ECS-based container state management, movement, and decay physics

use shared_types::{ContainerEntity, EntityId, Position, WorldState};
use std::collections::HashMap;

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

        // TODO: Implement movement and decay systems
        // This is a placeholder for Sprint 1 MVP
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
}
