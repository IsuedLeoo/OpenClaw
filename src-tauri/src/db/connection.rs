use rusqlite::Connection;
use std::path::PathBuf;
use std::sync::Mutex;

use crate::db::migrations;
use crate::error::AppResult;

pub struct Database {
    conn: Mutex<Connection>,
}

impl Database {
    pub fn new(data_dir: &PathBuf) -> AppResult<Self> {
        std::fs::create_dir_all(data_dir)?;
        let db_path = data_dir.join("openclaw.db");
        let conn = Connection::open(&db_path)?;

        conn.execute_batch("PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;")?;

        migrations::run_migrations(&conn)?;

        log::info!("Database initialized at {:?}", db_path);

        Ok(Self {
            conn: Mutex::new(conn),
        })
    }

    pub fn with_conn<F, T>(&self, f: F) -> AppResult<T>
    where
        F: FnOnce(&Connection) -> AppResult<T>,
    {
        let conn = self.conn.lock().map_err(|e| {
            crate::error::AppError::Internal(format!("Database lock poisoned: {}", e))
        })?;
        f(&conn)
    }
}
