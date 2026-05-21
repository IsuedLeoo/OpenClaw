use rusqlite::Connection;

use crate::error::AppResult;

pub fn run_migrations(conn: &Connection) -> AppResult<()> {
    conn.execute_batch(
        "CREATE TABLE IF NOT EXISTS schema_version (
            version INTEGER PRIMARY KEY
        );",
    )?;

    let current_version: i64 = conn
        .query_row(
            "SELECT COALESCE(MAX(version), 0) FROM schema_version",
            [],
            |row| row.get(0),
        )
        .unwrap_or(0);

    let migrations: Vec<(i64, &str)> = vec![(1, include_str!("V001__initial.sql"))];

    for (version, sql) in &migrations {
        if *version > current_version {
            conn.execute_batch(sql)?;
            conn.execute(
                "INSERT INTO schema_version (version) VALUES (?1)",
                [version],
            )?;
            log::info!("Applied migration V{:03}", version);
        }
    }

    Ok(())
}
