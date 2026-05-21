use std::sync::Arc;

use crate::db::models::MemoryEntry;
use crate::db::Database;
use crate::error::{AppError, AppResult};

pub struct MemoryService {
    db: Arc<Database>,
}

impl MemoryService {
    pub fn new(db: Arc<Database>) -> Self {
        Self { db }
    }

    pub fn list(&self) -> AppResult<Vec<MemoryEntry>> {
        self.db.with_conn(|conn| {
            let mut stmt = conn.prepare(
                "SELECT id, content, category, source, created_at FROM memory_entries ORDER BY created_at DESC",
            )?;
            let entries = stmt
                .query_map([], |row| {
                    Ok(MemoryEntry {
                        id: row.get(0)?,
                        content: row.get(1)?,
                        category: row.get(2)?,
                        source: row.get(3)?,
                        created_at: row.get(4)?,
                    })
                })?
                .collect::<Result<Vec<_>, _>>()?;
            Ok(entries)
        })
    }

    pub fn search(&self, query: &str) -> AppResult<Vec<MemoryEntry>> {
        self.db.with_conn(|conn| {
            let pattern = format!("%{}%", query);
            let mut stmt = conn.prepare(
                "SELECT id, content, category, source, created_at FROM memory_entries WHERE content LIKE ?1 OR category LIKE ?1 ORDER BY created_at DESC",
            )?;
            let entries = stmt
                .query_map([&pattern], |row| {
                    Ok(MemoryEntry {
                        id: row.get(0)?,
                        content: row.get(1)?,
                        category: row.get(2)?,
                        source: row.get(3)?,
                        created_at: row.get(4)?,
                    })
                })?
                .collect::<Result<Vec<_>, _>>()?;
            Ok(entries)
        })
    }

    pub fn add(&self, content: &str, category: &str, source: &str) -> AppResult<String> {
        let id = uuid::Uuid::new_v4().to_string();
        self.db.with_conn(|conn| {
            conn.execute(
                "INSERT INTO memory_entries (id, content, category, source) VALUES (?1, ?2, ?3, ?4)",
                rusqlite::params![id, content, category, source],
            )?;
            Ok(id.clone())
        })
    }

    pub fn remove(&self, id: &str) -> AppResult<()> {
        self.db.with_conn(|conn| {
            let deleted = conn.execute("DELETE FROM memory_entries WHERE id = ?1", [id])?;
            if deleted == 0 {
                return Err(AppError::NotFound(format!("Memory entry '{}'", id)));
            }
            Ok(())
        })
    }

    pub fn clear(&self) -> AppResult<()> {
        self.db.with_conn(|conn| {
            conn.execute("DELETE FROM memory_entries", [])?;
            Ok(())
        })
    }
}
