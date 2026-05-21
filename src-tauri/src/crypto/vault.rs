use base64::{engine::general_purpose::STANDARD, Engine as _};

use crate::error::{AppError, AppResult};

pub struct Vault;

impl Vault {
    pub fn get_or_create_master_key() -> AppResult<[u8; 32]> {
        let entry = keyring::Entry::new("openclaw", "master-key")
            .map_err(|e| AppError::Crypto(format!("Keyring error: {}", e)))?;

        match entry.get_password() {
            Ok(encoded) => {
                let decoded = STANDARD
                    .decode(&encoded)
                    .map_err(|e| AppError::Crypto(format!("Base64 decode error: {}", e)))?;

                let mut key = [0u8; 32];
                if decoded.len() != 32 {
                    return Err(AppError::Crypto("Invalid master key length".into()));
                }
                key.copy_from_slice(&decoded);
                Ok(key)
            }
            Err(_) => {
                let key = super::keystore::Keystore::generate_master_key();
                let encoded = STANDARD.encode(key);
                entry
                    .set_password(&encoded)
                    .map_err(|e| AppError::Crypto(format!("Failed to store key: {}", e)))?;
                log::info!("Generated and stored new master key in OS keychain");
                Ok(key)
            }
        }
    }
}
