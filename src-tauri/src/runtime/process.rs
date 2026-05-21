use std::io::{BufRead, BufReader};
use std::process::{Child, Command, Stdio};
use tokio::sync::mpsc;

use crate::error::{AppError, AppResult};

pub struct AgentProcess {
    child: Option<Child>,
    log_tx: Option<mpsc::UnboundedSender<String>>,
}

impl AgentProcess {
    pub fn new() -> Self {
        Self {
            child: None,
            log_tx: None,
        }
    }

    pub fn spawn(
        &mut self,
        executable: &str,
        args: &[&str],
        env_vars: Vec<(String, String)>,
    ) -> AppResult<(u32, mpsc::UnboundedReceiver<String>)> {
        if self.child.is_some() {
            return Err(AppError::Runtime("Process already running".into()));
        }

        let mut cmd = Command::new(executable);
        cmd.args(args)
            .stdout(Stdio::piped())
            .stderr(Stdio::piped());

        for (key, value) in &env_vars {
            cmd.env(key, value);
        }

        let mut child = cmd.spawn().map_err(|e| {
            AppError::Runtime(format!("Failed to spawn '{}': {}", executable, e))
        })?;

        let pid = child.id();
        let (tx, rx) = mpsc::unbounded_channel::<String>();

        // Stream stdout
        if let Some(stdout) = child.stdout.take() {
            let tx_clone = tx.clone();
            std::thread::spawn(move || {
                let reader = BufReader::new(stdout);
                for line in reader.lines() {
                    if let Ok(line) = line {
                        if tx_clone.send(format!("[stdout] {}", line)).is_err() {
                            break;
                        }
                    }
                }
            });
        }

        // Stream stderr
        if let Some(stderr) = child.stderr.take() {
            let tx_clone = tx.clone();
            std::thread::spawn(move || {
                let reader = BufReader::new(stderr);
                for line in reader.lines() {
                    if let Ok(line) = line {
                        if tx_clone.send(format!("[stderr] {}", line)).is_err() {
                            break;
                        }
                    }
                }
            });
        }

        self.child = Some(child);
        self.log_tx = Some(tx);

        Ok((pid, rx))
    }

    pub fn kill(&mut self) -> AppResult<()> {
        if let Some(ref mut child) = self.child {
            child.kill().map_err(|e| {
                AppError::Runtime(format!("Failed to kill process: {}", e))
            })?;
            child.wait().map_err(|e| {
                AppError::Runtime(format!("Failed to wait for process: {}", e))
            })?;
            self.child = None;
            self.log_tx = None;
            Ok(())
        } else {
            Err(AppError::Runtime("No process to kill".into()))
        }
    }

    pub fn try_wait(&mut self) -> Option<i32> {
        if let Some(ref mut child) = self.child {
            match child.try_wait() {
                Ok(Some(status)) => {
                    let code = status.code().unwrap_or(-1);
                    self.child = None;
                    self.log_tx = None;
                    Some(code)
                }
                Ok(None) => None,
                Err(_) => {
                    self.child = None;
                    self.log_tx = None;
                    Some(-1)
                }
            }
        } else {
            Some(-1)
        }
    }

    pub fn is_running(&mut self) -> bool {
        self.try_wait().is_none()
    }

    pub fn pid(&self) -> Option<u32> {
        self.child.as_ref().map(|c| c.id())
    }
}

impl Drop for AgentProcess {
    fn drop(&mut self) {
        if self.child.is_some() {
            let _ = self.kill();
        }
    }
}
