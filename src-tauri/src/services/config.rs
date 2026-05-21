use std::collections::HashMap;
use std::sync::Arc;

use crate::db::Database;
use crate::error::{AppError, AppResult};

pub struct ConfigService {
    db: Arc<Database>,
}

impl ConfigService {
    pub fn new(db: Arc<Database>) -> Self {
        Self { db }
    }

    pub fn get(&self, key: &str) -> AppResult<String> {
        self.db.with_conn(|conn| {
            conn.query_row(
                "SELECT value FROM config WHERE key = ?1",
                [key],
                |row| row.get(0),
            )
            .map_err(|_| AppError::NotFound(format!("Config key '{}'", key)))
        })
    }

    pub fn get_all(&self) -> AppResult<HashMap<String, String>> {
        self.db.with_conn(|conn| {
            let mut stmt = conn.prepare("SELECT key, value FROM config")?;
            let entries = stmt
                .query_map([], |row| {
                    Ok((row.get::<_, String>(0)?, row.get::<_, String>(1)?))
                })?
                .collect::<Result<HashMap<_, _>, _>>()?;
            Ok(entries)
        })
    }

    pub fn set(&self, key: &str, value: &str) -> AppResult<()> {
        self.db.with_conn(|conn| {
            conn.execute(
                "INSERT OR REPLACE INTO config (key, value, updated_at) VALUES (?1, ?2, datetime('now'))",
                rusqlite::params![key, value],
            )?;
            Ok(())
        })
    }
}
