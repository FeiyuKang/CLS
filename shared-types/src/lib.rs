/// Shared data types for CherryChain platform
/// Used by both simulation-engine and api-server for type safety

use serde::{Deserialize, Serialize};

/// Geographic position in latitude/longitude
#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub struct Position {
    pub lat: f64,
    pub lon: f64,
}

/// Unique identifier for container entities
pub type EntityId = u64;

/// Container entity with position, temperature, and quality state
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ContainerEntity {
    pub id: EntityId,
    pub position: Position,
    pub current_temp: f64,  // Celsius
    pub target_temp: f64,   // Reefer setpoint
    pub quality: f64,       // 0-100%
}

/// Complete simulation world state
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorldState {
    pub containers: Vec<ContainerEntity>,
    pub sim_time: f64,  // Simulated seconds elapsed
}

/// WebSocket message types sent from server to client
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum ServerMessage {
    /// Full state update (sent on connect)
    FullState { state: WorldState },
    /// Delta update (only changed entities)
    DeltaUpdate { changes: Vec<ContainerEntity> },
    /// Alert notification
    Alert { message: String },
}

/// WebSocket message types sent from client to server
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum ClientMessage {
    /// Request full state sync
    RequestState,
    /// Pause/resume simulation
    SetPaused { paused: bool },
}
