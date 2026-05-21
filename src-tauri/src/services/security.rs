use std::sync::Arc;

use crate::db::models::PermissionEntry;
use crate::db::Database;
use crate::error::{AppError, AppResult};

pub struct SecurityService {
    db: Arc<Database>,
}

impl SecurityService {
    pub fn new(db: Arc<Database>) -> Self {
        Self { db }
    }

    pub fn check_permission(&self, permission_id: &str) -> AppResult<bool> {
        self.db.with_conn(|conn| {
            let granted: bool = conn
                .query_row(
                    "SELECT granted FROM permissions WHERE id = ?1",
                    [permission_id],
                    |row| row.get(0),
                )
                .unwrap_or(false);
            Ok(granted)
        })
    }

    pub fn list_permissions(&self) -> AppResult<Vec<PermissionEntry>> {
        self.db.with_conn(|conn| {
            let mut stmt = conn.prepare(
                "SELECT id, group_id, label, description, granted, level FROM permissions ORDER BY group_id, id",
            )?;
            let entries = stmt
                .query_map([], |row| {
                    Ok(PermissionEntry {
                        id: row.get(0)?,
                        group_id: row.get(1)?,
                        label: row.get(2)?,
                        description: row.get(3)?,
                        granted: row.get(4)?,
                        level: row.get(5)?,
                    })
                })?
                .collect::<Result<Vec<_>, _>>()?;
            Ok(entries)
        })
    }

    pub fn grant_permission(&self, permission_id: &str) -> AppResult<()> {
        self.db.with_conn(|conn| {
            let updated = conn.execute(
                "UPDATE permissions SET granted = 1, updated_at = datetime('now') WHERE id = ?1",
                [permission_id],
            )?;
            if updated == 0 {
                return Err(AppError::NotFound(format!(
                    "Permission '{}'",
                    permission_id
                )));
            }
            log::info!("Permission granted: {}", permission_id);
            Ok(())
        })
    }

    pub fn revoke_permission(&self, permission_id: &str) -> AppResult<()> {
        self.db.with_conn(|conn| {
            let updated = conn.execute(
                "UPDATE permissions SET granted = 0, updated_at = datetime('now') WHERE id = ?1",
                [permission_id],
            )?;
            if updated == 0 {
                return Err(AppError::NotFound(format!(
                    "Permission '{}'",
                    permission_id
                )));
            }
            log::info!("Permission revoked: {}", permission_id);
            Ok(())
        })
    }

    pub fn log_audit(
        &self,
        action: &str,
        resource: Option<&str>,
        result: &str,
        details: Option<&str>,
    ) -> AppResult<()> {
        self.db.with_conn(|conn| {
            conn.execute(
                "INSERT INTO audit_log (action, resource, result, details) VALUES (?1, ?2, ?3, ?4)",
                rusqlite::params![action, resource, result, details],
            )?;
            Ok(())
        })
    }
}
