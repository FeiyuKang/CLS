/// WebSocket handler for real-time simulation updates

use axum::{
    extract::ws::{Message, WebSocket, WebSocketUpgrade},
    response::Response,
};
use shared_types::{ClientMessage, Position, ServerMessage};
use simulation_engine::SimulationEngine;
use std::sync::Arc;
use tokio::sync::Mutex;
use tokio::time::{Duration, interval};

/// Shared simulation state
type SharedEngine = Arc<Mutex<SimulationEngine>>;

/// Global simulation engine (shared across all connections)
static GLOBAL_ENGINE: std::sync::OnceLock<SharedEngine> = std::sync::OnceLock::new();

/// Get or initialize the global simulation engine
fn get_global_engine() -> SharedEngine {
    GLOBAL_ENGINE
        .get_or_init(|| {
            let mut engine = SimulationEngine::new();
            // Spawn a test container traveling from Chile to China
            let chile = Position { lat: -33.0, lon: -71.0 };
            engine.spawn_container(chile, 0.0);
            Arc::new(Mutex::new(engine))
        })
        .clone()
}

/// WebSocket upgrade handler
pub async fn ws_handler(ws: WebSocketUpgrade) -> Response {
    ws.on_upgrade(handle_socket)
}

/// Handle individual WebSocket connection
async fn handle_socket(mut socket: WebSocket) {
    tracing::info!("New WebSocket connection established");

    // Get the global simulation engine
    let engine = get_global_engine();

    // Send initial state
    let state = engine.lock().await.get_state();
    let msg = ServerMessage::FullState { state };

    if let Ok(json) = serde_json::to_string(&msg) {
        if socket.send(Message::Text(json)).await.is_err() {
            tracing::error!("Failed to send initial state");
            return;
        }
    }

    // Spawn broadcast task that sends updates every 1 second
    let engine_clone = engine.clone();
    let (tx, mut rx) = tokio::sync::mpsc::channel::<String>(100);

    tokio::spawn(async move {
        let mut tick_interval = interval(Duration::from_millis(1000)); // 1Hz updates
        let mut sim_interval = interval(Duration::from_millis(100)); // 10Hz simulation ticks

        loop {
            tokio::select! {
                _ = sim_interval.tick() => {
                    // Update simulation at 10Hz
                    let mut engine = engine_clone.lock().await;
                    engine.tick(0.1); // 0.1 second delta time
                }
                _ = tick_interval.tick() => {
                    // Broadcast state at 1Hz
                    let state = engine_clone.lock().await.get_state();
                    let msg = ServerMessage::FullState { state };

                    if let Ok(json) = serde_json::to_string(&msg) {
                        if tx.send(json).await.is_err() {
                            break; // Client disconnected
                        }
                    }
                }
            }
        }
    });

    // Send broadcast messages to client and handle incoming messages
    loop {
        tokio::select! {
            // Receive broadcast from simulation
            Some(json) = rx.recv() => {
                if socket.send(Message::Text(json)).await.is_err() {
                    break;
                }
            }
            // Handle messages from client
            Some(Ok(msg)) = socket.recv() => {
                if let Message::Text(text) = msg {
                    match serde_json::from_str::<ClientMessage>(&text) {
                        Ok(ClientMessage::RequestState) => {
                            tracing::debug!("Client requested state");
                        }
                        Ok(ClientMessage::SetPaused { paused }) => {
                            tracing::info!("Pause state: {}", paused);
                            // TODO: Implement pause/resume logic
                        }
                        Err(e) => {
                            tracing::error!("Failed to parse client message: {}", e);
                        }
                    }
                }
            }
            else => break,
        }
    }

    tracing::info!("WebSocket connection closed");
}
