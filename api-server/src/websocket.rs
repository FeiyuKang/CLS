/// WebSocket handler for real-time simulation updates

use axum::{
    extract::ws::{Message, WebSocket, WebSocketUpgrade},
    response::Response,
};
use shared_types::{ClientMessage, ServerMessage, WorldState};
use simulation_engine::SimulationEngine;
use std::sync::Arc;
use tokio::sync::Mutex;

/// Shared simulation state
type SharedEngine = Arc<Mutex<SimulationEngine>>;

/// WebSocket upgrade handler
pub async fn ws_handler(ws: WebSocketUpgrade) -> Response {
    ws.on_upgrade(handle_socket)
}

/// Handle individual WebSocket connection
async fn handle_socket(mut socket: WebSocket) {
    tracing::info!("New WebSocket connection established");

    // Create simulation engine for this connection
    // TODO: In production, this should be a shared global state
    let engine = Arc::new(Mutex::new(SimulationEngine::new()));

    // Send initial state
    let state = engine.lock().await.get_state();
    let msg = ServerMessage::FullState { state };

    if let Ok(json) = serde_json::to_string(&msg) {
        if socket.send(Message::Text(json)).await.is_err() {
            tracing::error!("Failed to send initial state");
            return;
        }
    }

    // Handle incoming messages
    while let Some(Ok(msg)) = socket.recv().await {
        if let Message::Text(text) = msg {
            match serde_json::from_str::<ClientMessage>(&text) {
                Ok(ClientMessage::RequestState) => {
                    let state = engine.lock().await.get_state();
                    let response = ServerMessage::FullState { state };

                    if let Ok(json) = serde_json::to_string(&response) {
                        if socket.send(Message::Text(json)).await.is_err() {
                            break;
                        }
                    }
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

    tracing::info!("WebSocket connection closed");
}
