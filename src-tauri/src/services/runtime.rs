use std::path::PathBuf;
use std::sync::Mutex;
use std::time::Instant;

use tauri::Emitter;

use crate::db::models::{RuntimeInfo, RuntimeMetrics};
use crate::error::{AppError, AppResult};
use crate::runtime::process::AgentProcess;
use crate::runtime::transport::{JsonRpcRequest, SocketTransport};

#[derive(Debug, Clone, PartialEq)]
pub enum RuntimeStatus {
    Stopped,
    Starting,
    Running,
    Stopping,
    Error,
    Installing,
}

impl RuntimeStatus {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Stopped => "stopped",
            Self::Starting => "starting",
            Self::Running => "running",
            Self::Stopping => "stopping",
            Self::Error => "error",
            Self::Installing => "installing",
        }
    }
}

struct RuntimeState {
    status: RuntimeStatus,
    started_at: Option<Instant>,
    error: Option<String>,
    version: Option<String>,
}

pub struct RuntimeService {
    state: Mutex<RuntimeState>,
    process: Mutex<AgentProcess>,
    transport: Mutex<Option<SocketTransport>>,
    data_dir: PathBuf,
}

impl RuntimeService {
    pub fn new(data_dir: PathBuf) -> Self {
        Self {
            state: Mutex::new(RuntimeState {
                status: RuntimeStatus::Stopped,
                started_at: None,
                error: None,
                version: Some("0.1.0".to_string()),
            }),
            process: Mutex::new(AgentProcess::new()),
            transport: Mutex::new(None),
            data_dir,
        }
    }

    pub fn get_info(&self) -> AppResult<RuntimeInfo> {
        let state = self
            .state
            .lock()
            .map_err(|e| AppError::Internal(format!("Lock poisoned: {}", e)))?;

        let process = self
            .process
            .lock()
            .map_err(|e| AppError::Internal(format!("Lock poisoned: {}", e)))?;

        let uptime = state.started_at.map(|t| t.elapsed().as_secs());

        Ok(RuntimeInfo {
            status: state.status.as_str().to_string(),
            version: state.version.clone(),
            uptime,
            pid: process.pid(),
            error: state.error.clone(),
        })
    }

    pub fn get_metrics(&self) -> AppResult<RuntimeMetrics> {
        let state = self
            .state
            .lock()
            .map_err(|e| AppError::Internal(format!("Lock poisoned: {}", e)))?;

        if state.status != RuntimeStatus::Running {
            return Err(AppError::Runtime("Agent is not running".into()));
        }

        let process = self
            .process
            .lock()
            .map_err(|e| AppError::Internal(format!("Lock poisoned: {}", e)))?;

        let pid = process.pid().unwrap_or(0);

        let mut sys = sysinfo::System::new();
        sys.refresh_processes(
            sysinfo::ProcessesToUpdate::Some(&[sysinfo::Pid::from_u32(pid)]),
            true,
        );

        let (cpu, mem) = sys
            .process(sysinfo::Pid::from_u32(pid))
            .map(|p| (p.cpu_usage() as f64, p.memory() as f64 / 1024.0 / 1024.0))
            .unwrap_or((0.0, 0.0));

        Ok(RuntimeMetrics {
            cpu_percent: cpu,
            memory_mb: mem,
            active_connections: 0,
            requests_per_minute: 0,
        })
    }

    pub fn start(&self, app_handle: Option<&tauri::AppHandle>) -> AppResult<()> {
        {
            let state = self
                .state
                .lock()
                .map_err(|e| AppError::Internal(format!("Lock poisoned: {}", e)))?;

            if state.status == RuntimeStatus::Running {
                return Err(AppError::Runtime("Agent is already running".into()));
            }
        }

        {
            let mut state = self
                .state
                .lock()
                .map_err(|e| AppError::Internal(format!("Lock poisoned: {}", e)))?;
            state.status = RuntimeStatus::Starting;
            state.error = None;
        }

        self.emit_status(app_handle);

        let socket_path = self.data_dir.join("openclaw.sock");
        let runtime_dir = self.data_dir.join("runtime");

        // Check if a runtime binary exists
        let runtime_bin = runtime_dir.join("openclaw-runtime");
        if !runtime_bin.exists() {
            // No runtime binary — run in "demo mode" with a simple echo server
            // In production, this would download and install the runtime
            log::warn!(
                "Runtime binary not found at {:?}. Running in standalone mode.",
                runtime_bin
            );

            let mut state = self
                .state
                .lock()
                .map_err(|e| AppError::Internal(format!("Lock poisoned: {}", e)))?;
            state.status = RuntimeStatus::Running;
            state.started_at = Some(Instant::now());

            self.emit_status(app_handle);
            log::info!("Agent runtime started in standalone mode");
            return Ok(());
        }

        // Spawn the runtime process
        let mut process = self
            .process
            .lock()
            .map_err(|e| AppError::Internal(format!("Lock poisoned: {}", e)))?;

        let env_vars = vec![
            ("OPENCLAW_SOCKET".to_string(), socket_path.to_string_lossy().to_string()),
            ("OPENCLAW_DATA_DIR".to_string(), self.data_dir.to_string_lossy().to_string()),
        ];

        match process.spawn(
            runtime_bin.to_str().unwrap_or("openclaw-runtime"),
            &[],
            env_vars,
        ) {
            Ok((_pid, _log_rx)) => {
                // Set up the transport
                std::thread::sleep(std::time::Duration::from_millis(500));
                let transport = SocketTransport::new(socket_path);
                if let Err(e) = transport.connect() {
                    log::warn!("Could not connect to runtime socket yet: {}", e);
                }

                let mut transport_guard = self
                    .transport
                    .lock()
                    .map_err(|e| AppError::Internal(format!("Lock poisoned: {}", e)))?;
                *transport_guard = Some(transport);

                let mut state = self
                    .state
                    .lock()
                    .map_err(|e| AppError::Internal(format!("Lock poisoned: {}", e)))?;
                state.status = RuntimeStatus::Running;
                state.started_at = Some(Instant::now());

                self.emit_status(app_handle);
                log::info!("Agent runtime started");
                Ok(())
            }
            Err(e) => {
                let mut state = self
                    .state
                    .lock()
                    .map_err(|e| AppError::Internal(format!("Lock poisoned: {}", e)))?;
                state.status = RuntimeStatus::Error;
                state.error = Some(e.to_string());
                self.emit_status(app_handle);
                Err(e)
            }
        }
    }

    pub fn stop(&self, app_handle: Option<&tauri::AppHandle>) -> AppResult<()> {
        {
            let state = self
                .state
                .lock()
                .map_err(|e| AppError::Internal(format!("Lock poisoned: {}", e)))?;

            if state.status != RuntimeStatus::Running {
                return Err(AppError::Runtime("Agent is not running".into()));
            }
        }

        {
            let mut state = self
                .state
                .lock()
                .map_err(|e| AppError::Internal(format!("Lock poisoned: {}", e)))?;
            state.status = RuntimeStatus::Stopping;
        }

        self.emit_status(app_handle);

        // Disconnect transport
        if let Ok(mut transport) = self.transport.lock() {
            if let Some(t) = transport.as_ref() {
                t.disconnect();
            }
            *transport = None;
        }

        // Kill process
        if let Ok(mut process) = self.process.lock() {
            let _ = process.kill();
        }

        // Clean up socket
        let socket_path = self.data_dir.join("openclaw.sock");
        let _ = std::fs::remove_file(&socket_path);

        let mut state = self
            .state
            .lock()
            .map_err(|e| AppError::Internal(format!("Lock poisoned: {}", e)))?;
        state.status = RuntimeStatus::Stopped;
        state.started_at = None;

        self.emit_status(app_handle);
        log::info!("Agent runtime stopped");
        Ok(())
    }

    pub fn restart(&self, app_handle: Option<&tauri::AppHandle>) -> AppResult<()> {
        let status = {
            let state = self
                .state
                .lock()
                .map_err(|e| AppError::Internal(format!("Lock poisoned: {}", e)))?;
            state.status.clone()
        };

        if status == RuntimeStatus::Running {
            self.stop(app_handle)?;
        }
        self.start(app_handle)
    }

    pub fn send_message(&self, message: &str) -> AppResult<String> {
        let state = self
            .state
            .lock()
            .map_err(|e| AppError::Internal(format!("Lock poisoned: {}", e)))?;

        if state.status != RuntimeStatus::Running {
            return Err(AppError::Runtime("Agent is not running".into()));
        }
        drop(state);

        let transport = self
            .transport
            .lock()
            .map_err(|e| AppError::Internal(format!("Lock poisoned: {}", e)))?;

        if let Some(ref t) = *transport {
            if t.is_connected() {
                let request = JsonRpcRequest::new(
                    "chat.message",
                    serde_json::json!({ "message": message }),
                );
                let response = t.send(&request)?;
                if let Some(result) = response.result {
                    return Ok(result
                        .get("response")
                        .and_then(|v| v.as_str())
                        .unwrap_or("No response")
                        .to_string());
                }
                if let Some(err) = response.error {
                    return Err(AppError::Runtime(err.message));
                }
            }
        }

        // Standalone mode — provide a placeholder response
        Ok(format!(
            "I received your message: \"{}\". The agent runtime is running in standalone mode — connect a runtime binary for full AI capabilities.",
            message
        ))
    }

    fn emit_status(&self, app_handle: Option<&tauri::AppHandle>) {
        if let Some(handle) = app_handle {
            if let Ok(info) = self.get_info() {
                let _ = handle.emit("runtime-status-changed", &info);
            }
        }
    }
}
