use std::sync::Arc;

use crate::db::models::Profile;
use crate::db::Database;
use crate::error::{AppError, AppResult};

pub struct ProfileService {
    db: Arc<Database>,
}

impl ProfileService {
    pub fn new(db: Arc<Database>) -> Self {
        Self { db }
    }

    pub fn list(&self) -> AppResult<Vec<Profile>> {
        self.db.with_conn(|conn| {
            let mut stmt = conn.prepare(
                "SELECT id, name, description, personality, model, is_active, color FROM profiles ORDER BY name",
            )?;
            let entries = stmt
                .query_map([], |row| {
                    Ok(Profile {
                        id: row.get(0)?,
                        name: row.get(1)?,
                        description: row.get(2)?,
                        personality: row.get(3)?,
                        model: row.get(4)?,
                        is_active: row.get(5)?,
                        color: row.get(6)?,
                    })
                })?
                .collect::<Result<Vec<_>, _>>()?;
            Ok(entries)
        })
    }

    pub fn set_active(&self, profile_id: &str) -> AppResult<()> {
        self.db.with_conn(|conn| {
            conn.execute("UPDATE profiles SET is_active = 0", [])?;
            let updated = conn.execute(
                "UPDATE profiles SET is_active = 1 WHERE id = ?1",
                [profile_id],
            )?;
            if updated == 0 {
                return Err(AppError::NotFound(format!("Profile '{}'", profile_id)));
            }
            Ok(())
        })
    }

    pub fn create(
        &self,
        name: &str,
        description: &str,
        personality: &str,
        model: &str,
    ) -> AppResult<String> {
        let id = uuid::Uuid::new_v4().to_string();
        self.db.with_conn(|conn| {
            conn.execute(
                "INSERT INTO profiles (id, name, description, personality, model, color) VALUES (?1, ?2, ?3, ?4, ?5, 'bg-brand-600')",
                rusqlite::params![id, name, description, personality, model],
            )?;
            Ok(id.clone())
        })
    }

    pub fn delete(&self, id: &str) -> AppResult<()> {
        if id == "default" {
            return Err(AppError::PermissionDenied(
                "Cannot delete the default profile".into(),
            ));
        }
        self.db.with_conn(|conn| {
            let deleted = conn.execute("DELETE FROM profiles WHERE id = ?1", [id])?;
            if deleted == 0 {
                return Err(AppError::NotFound(format!("Profile '{}'", id)));
            }
            Ok(())
        })
    }
}
