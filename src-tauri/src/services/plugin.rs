use std::sync::Arc;

use crate::db::Database;
use crate::error::{AppError, AppResult};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PluginInfo {
    pub id: String,
    pub name: String,
    pub version: String,
    pub description: String,
    pub author: String,
    pub category: String,
    pub is_enabled: bool,
    pub is_installed: bool,
    pub required_permissions: Vec<String>,
}

pub struct PluginService {
    db: Arc<Database>,
}

impl PluginService {
    pub fn new(db: Arc<Database>) -> Self {
        Self { db }
    }

    pub fn list(&self) -> AppResult<Vec<PluginInfo>> {
        self.db.with_conn(|conn| {
            let mut stmt = conn.prepare(
                "SELECT id, name, version, description, author, category, is_enabled, is_installed, required_permissions FROM plugins ORDER BY name",
            )?;
            let entries = stmt
                .query_map([], |row| {
                    let perms_json: String = row.get(8)?;
                    let perms: Vec<String> =
                        serde_json::from_str(&perms_json).unwrap_or_default();
                    Ok(PluginInfo {
                        id: row.get(0)?,
                        name: row.get(1)?,
                        version: row.get(2)?,
                        description: row.get(3)?,
                        author: row.get(4)?,
                        category: row.get(5)?,
                        is_enabled: row.get(6)?,
                        is_installed: row.get(7)?,
                        required_permissions: perms,
                    })
                })?
                .collect::<Result<Vec<_>, _>>()?;
            Ok(entries)
        })
    }

    pub fn toggle(&self, id: &str, enabled: bool) -> AppResult<()> {
        self.db.with_conn(|conn| {
            let updated = conn.execute(
                "UPDATE plugins SET is_enabled = ?1 WHERE id = ?2",
                rusqlite::params![enabled, id],
            )?;
            if updated == 0 {
                return Err(AppError::NotFound(format!("Plugin '{}'", id)));
            }
            Ok(())
        })
    }

    pub fn uninstall(&self, id: &str) -> AppResult<()> {
        self.db.with_conn(|conn| {
            let deleted = conn.execute("DELETE FROM plugins WHERE id = ?1", [id])?;
            if deleted == 0 {
                return Err(AppError::NotFound(format!("Plugin '{}'", id)));
            }
            Ok(())
        })
    }
}
