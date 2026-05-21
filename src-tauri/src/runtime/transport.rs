use std::io::{BufRead, BufReader, Write};
use std::os::unix::net::UnixStream;
use std::path::PathBuf;
use std::sync::Mutex;
use std::time::Duration;

use serde::{Deserialize, Serialize};

use crate::error::{AppError, AppResult};

#[derive(Debug, Serialize, Deserialize)]
pub struct JsonRpcRequest {
    pub jsonrpc: String,
    pub method: String,
    pub params: serde_json::Value,
    pub id: u64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct JsonRpcResponse {
    pub jsonrpc: String,
    pub result: Option<serde_json::Value>,
    pub error: Option<JsonRpcError>,
    pub id: u64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct JsonRpcError {
    pub code: i32,
    pub message: String,
    pub data: Option<serde_json::Value>,
}

static REQUEST_COUNTER: std::sync::atomic::AtomicU64 = std::sync::atomic::AtomicU64::new(1);

impl JsonRpcRequest {
    pub fn new(method: &str, params: serde_json::Value) -> Self {
        Self {
            jsonrpc: "2.0".to_string(),
            method: method.to_string(),
            params,
            id: REQUEST_COUNTER.fetch_add(1, std::sync::atomic::Ordering::Relaxed),
        }
    }
}

pub struct SocketTransport {
    socket_path: PathBuf,
    stream: Mutex<Option<UnixStream>>,
}

impl SocketTransport {
    pub fn new(socket_path: PathBuf) -> Self {
        Self {
            socket_path,
            stream: Mutex::new(None),
        }
    }

    pub fn connect(&self) -> AppResult<()> {
        let stream = UnixStream::connect(&self.socket_path).map_err(|e| {
            AppError::Runtime(format!(
                "Failed to connect to runtime socket {:?}: {}",
                self.socket_path, e
            ))
        })?;
        stream
            .set_read_timeout(Some(Duration::from_secs(30)))
            .ok();
        stream
            .set_write_timeout(Some(Duration::from_secs(10)))
            .ok();

        let mut guard = self
            .stream
            .lock()
            .map_err(|e| AppError::Internal(format!("Lock poisoned: {}", e)))?;
        *guard = Some(stream);
        Ok(())
    }

    pub fn send(&self, request: &JsonRpcRequest) -> AppResult<JsonRpcResponse> {
        let mut guard = self
            .stream
            .lock()
            .map_err(|e| AppError::Internal(format!("Lock poisoned: {}", e)))?;

        let stream = guard
            .as_mut()
            .ok_or_else(|| AppError::Runtime("Not connected to runtime".into()))?;

        let mut payload = serde_json::to_vec(request)
            .map_err(|e| AppError::Internal(format!("Serialize error: {}", e)))?;
        payload.push(b'\n');

        stream.write_all(&payload).map_err(|e| {
            AppError::Runtime(format!("Failed to send to runtime: {}", e))
        })?;
        stream.flush().map_err(|e| {
            AppError::Runtime(format!("Failed to flush: {}", e))
        })?;

        let mut reader = BufReader::new(stream);
        let mut response_line = String::new();
        reader.read_line(&mut response_line).map_err(|e| {
            AppError::Runtime(format!("Failed to read response: {}", e))
        })?;

        serde_json::from_str(&response_line)
            .map_err(|e| AppError::Runtime(format!("Invalid JSON-RPC response: {}", e)))
    }

    pub fn is_connected(&self) -> bool {
        self.stream
            .lock()
            .ok()
            .map(|guard| guard.is_some())
            .unwrap_or(false)
    }

    pub fn disconnect(&self) {
        if let Ok(mut guard) = self.stream.lock() {
            *guard = None;
        }
    }

    pub fn socket_path(&self) -> &PathBuf {
        &self.socket_path
    }
}
