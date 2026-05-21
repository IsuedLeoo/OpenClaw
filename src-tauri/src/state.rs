use std::path::PathBuf;
use std::sync::Arc;

use crate::crypto::keystore::Keystore;
use crate::db::Database;
use crate::error::AppResult;
use crate::services::{
    config::ConfigService,
    memory::MemoryService,
    monitoring::MonitoringService,
    plugin::PluginService,
    profile::ProfileService,
    provider::ProviderService,
    runtime::RuntimeService,
    security::SecurityService,
    telegram::TelegramService,
    update::UpdateService,
};

pub struct AppState {
    pub config: ConfigService,
    pub runtime: RuntimeService,
    pub security: SecurityService,
    pub telegram: TelegramService,
    pub provider: ProviderService,
    pub plugin: PluginService,
    pub profile: ProfileService,
    pub memory: MemoryService,
    pub monitoring: MonitoringService,
    pub update: UpdateService,
}

impl AppState {
    pub fn new(data_dir: PathBuf) -> AppResult<Self> {
        let db = Arc::new(Database::new(&data_dir)?);

        // Initialize the master key from OS keychain and create keystore
        let master_key = crate::crypto::vault::Vault::get_or_create_master_key()
            .unwrap_or_else(|e| {
                log::warn!("Failed to access OS keychain ({}), using ephemeral key", e);
                Keystore::generate_master_key()
            });
        let keystore = Arc::new(Keystore::new(&master_key));

        Ok(Self {
            config: ConfigService::new(Arc::clone(&db)),
            runtime: RuntimeService::new(data_dir.clone()),
            security: SecurityService::new(Arc::clone(&db)),
            telegram: TelegramService::new(Arc::clone(&db)),
            provider: ProviderService::new(Arc::clone(&db), Arc::clone(&keystore)),
            plugin: PluginService::new(Arc::clone(&db)),
            profile: ProfileService::new(Arc::clone(&db)),
            memory: MemoryService::new(Arc::clone(&db)),
            monitoring: MonitoringService::new(Arc::clone(&db)),
            update: UpdateService::new(),
        })
    }
}
