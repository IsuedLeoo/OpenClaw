use std::path::PathBuf;

use crate::error::{AppError, AppResult};

pub struct RuntimeInstaller {
    install_dir: PathBuf,
}

impl RuntimeInstaller {
    pub fn new(data_dir: &PathBuf) -> Self {
        Self {
            install_dir: data_dir.join("runtime"),
        }
    }

    pub fn is_installed(&self) -> bool {
        self.install_dir.exists()
    }

    pub fn install_dir(&self) -> &PathBuf {
        &self.install_dir
    }

    pub async fn install(&self, _version: &str) -> AppResult<()> {
        std::fs::create_dir_all(&self.install_dir)?;
        // TODO: Download and verify the runtime binary for the current platform
        log::info!("Runtime installation directory prepared at {:?}", self.install_dir);
        Err(AppError::Runtime(
            "Runtime auto-installation not yet implemented. Please install manually.".into(),
        ))
    }
}
