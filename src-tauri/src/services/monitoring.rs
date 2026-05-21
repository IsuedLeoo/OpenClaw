use crate::db::models::AuditEntry;
use crate::db::Database;
use crate::error::AppResult;
use std::sync::Arc;

pub struct MonitoringService {
    db: Arc<Database>,
}

impl MonitoringService {
    pub fn new(db: Arc<Database>) -> Self {
        Self { db }
    }

    pub fn get_audit_log(&self, limit: u32) -> AppResult<Vec<AuditEntry>> {
        self.db.with_conn(|conn| {
            let mut stmt = conn.prepare(
                "SELECT id, action, resource, result, details, created_at FROM audit_log ORDER BY created_at DESC LIMIT ?1",
            )?;
            let entries = stmt
                .query_map([limit], |row| {
                    Ok(AuditEntry {
                        id: row.get(0)?,
                        action: row.get(1)?,
                        resource: row.get(2)?,
                        result: row.get(3)?,
                        details: row.get(4)?,
                        created_at: row.get(5)?,
                    })
                })?
                .collect::<Result<Vec<_>, _>>()?;
            Ok(entries)
        })
    }
}
