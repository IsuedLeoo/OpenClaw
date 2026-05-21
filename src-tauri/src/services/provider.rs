use std::sync::Arc;

use crate::crypto::keystore::Keystore;
use crate::db::models::Provider;
use crate::db::Database;
use crate::error::{AppError, AppResult};

pub struct ProviderService {
    db: Arc<Database>,
    keystore: Arc<Keystore>,
}

impl ProviderService {
    pub fn new(db: Arc<Database>, keystore: Arc<Keystore>) -> Self {
        Self { db, keystore }
    }

    pub fn list(&self) -> AppResult<Vec<Provider>> {
        self.db.with_conn(|conn| {
            let mut stmt = conn.prepare(
                "SELECT id, name, kind, base_url, is_enabled, models FROM providers ORDER BY name",
            )?;
            let entries = stmt
                .query_map([], |row| {
                    let models_json: String = row.get(5)?;
                    let models: Vec<String> =
                        serde_json::from_str(&models_json).unwrap_or_default();
                    Ok(Provider {
                        id: row.get(0)?,
                        name: row.get(1)?,
                        kind: row.get(2)?,
                        base_url: row.get(3)?,
                        is_enabled: row.get(4)?,
                        models,
                    })
                })?
                .collect::<Result<Vec<_>, _>>()?;
            Ok(entries)
        })
    }

    pub fn add(
        &self,
        id: &str,
        name: &str,
        kind: &str,
        base_url: Option<&str>,
    ) -> AppResult<()> {
        self.db.with_conn(|conn| {
            conn.execute(
                "INSERT INTO providers (id, name, kind, base_url) VALUES (?1, ?2, ?3, ?4)",
                rusqlite::params![id, name, kind, base_url],
            )?;
            Ok(())
        })
    }

    pub fn remove(&self, id: &str) -> AppResult<()> {
        self.db.with_conn(|conn| {
            conn.execute("DELETE FROM api_keys WHERE provider_id = ?1", [id])?;
            let deleted = conn.execute("DELETE FROM providers WHERE id = ?1", [id])?;
            if deleted == 0 {
                return Err(AppError::NotFound(format!("Provider '{}'", id)));
            }
            Ok(())
        })
    }

    pub fn toggle(&self, id: &str, enabled: bool) -> AppResult<()> {
        self.db.with_conn(|conn| {
            conn.execute(
                "UPDATE providers SET is_enabled = ?1 WHERE id = ?2",
                rusqlite::params![enabled, id],
            )?;
            Ok(())
        })
    }

    pub fn store_api_key(&self, provider_id: &str, label: &str, plaintext: &str) -> AppResult<String> {
        let (ciphertext, nonce) = self.keystore.encrypt(plaintext.as_bytes())?;
        let id = uuid::Uuid::new_v4().to_string();

        self.db.with_conn(|conn| {
            conn.execute(
                "INSERT INTO api_keys (id, provider_id, label, encrypted_value, nonce) VALUES (?1, ?2, ?3, ?4, ?5)",
                rusqlite::params![id, provider_id, label, ciphertext, nonce],
            )?;
            Ok(id.clone())
        })
    }

    pub fn get_api_key(&self, provider_id: &str) -> AppResult<String> {
        self.db.with_conn(|conn| {
            let (ciphertext, nonce): (Vec<u8>, Vec<u8>) = conn
                .query_row(
                    "SELECT encrypted_value, nonce FROM api_keys WHERE provider_id = ?1 ORDER BY created_at DESC LIMIT 1",
                    [provider_id],
                    |row| Ok((row.get(0)?, row.get(1)?)),
                )
                .map_err(|_| AppError::NotFound(format!("API key for provider '{}'", provider_id)))?;

            let plaintext = self.keystore.decrypt(&ciphertext, &nonce)?;
            String::from_utf8(plaintext)
                .map_err(|e| AppError::Crypto(format!("Invalid UTF-8 in decrypted key: {}", e)))
        })
    }

    pub fn delete_api_key(&self, key_id: &str) -> AppResult<()> {
        self.db.with_conn(|conn| {
            let deleted = conn.execute("DELETE FROM api_keys WHERE id = ?1", [key_id])?;
            if deleted == 0 {
                return Err(AppError::NotFound(format!("API key '{}'", key_id)));
            }
            Ok(())
        })
    }

    pub fn has_api_key(&self, provider_id: &str) -> AppResult<bool> {
        self.db.with_conn(|conn| {
            let count: i64 = conn.query_row(
                "SELECT COUNT(*) FROM api_keys WHERE provider_id = ?1",
                [provider_id],
                |row| row.get(0),
            )?;
            Ok(count > 0)
        })
    }

    pub fn get_masked_key(&self, provider_id: &str) -> AppResult<String> {
        let key = self.get_api_key(provider_id)?;
        let len = key.len();
        if len <= 8 {
            Ok("••••••••".to_string())
        } else {
            Ok(format!("{}••••••••{}", &key[..4], &key[len - 4..]))
        }
    }
}
