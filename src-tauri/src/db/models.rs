use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ConfigEntry {
    pub key: String,
    pub value: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Provider {
    pub id: String,
    pub name: String,
    pub kind: String,
    pub base_url: Option<String>,
    pub is_enabled: bool,
    pub models: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Profile {
    pub id: String,
    pub name: String,
    pub description: String,
    pub personality: String,
    pub model: String,
    pub is_active: bool,
    pub color: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PermissionEntry {
    pub id: String,
    pub group_id: String,
    pub label: String,
    pub description: String,
    pub granted: bool,
    pub level: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct MemoryEntry {
    pub id: String,
    pub content: String,
    pub category: String,
    pub source: String,
    pub created_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AuditEntry {
    pub id: i64,
    pub action: String,
    pub resource: Option<String>,
    pub result: String,
    pub details: Option<String>,
    pub created_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct RuntimeInfo {
    pub status: String,
    pub version: Option<String>,
    pub uptime: Option<u64>,
    pub pid: Option<u32>,
    pub error: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct RuntimeMetrics {
    pub cpu_percent: f64,
    pub memory_mb: f64,
    pub active_connections: u32,
    pub requests_per_minute: u32,
}
