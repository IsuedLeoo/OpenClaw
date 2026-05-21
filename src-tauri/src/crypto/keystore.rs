use aes_gcm::{
    aead::{Aead, KeyInit},
    Aes256Gcm, Nonce,
};
use rand::RngCore;

use crate::error::{AppError, AppResult};

pub struct Keystore {
    cipher: Aes256Gcm,
}

impl Keystore {
    pub fn new(master_key: &[u8; 32]) -> Self {
        let cipher = Aes256Gcm::new(master_key.into());
        Self { cipher }
    }

    pub fn generate_master_key() -> [u8; 32] {
        let mut key = [0u8; 32];
        rand::thread_rng().fill_bytes(&mut key);
        key
    }

    pub fn encrypt(&self, plaintext: &[u8]) -> AppResult<(Vec<u8>, Vec<u8>)> {
        let mut nonce_bytes = [0u8; 12];
        rand::thread_rng().fill_bytes(&mut nonce_bytes);
        let nonce = Nonce::from_slice(&nonce_bytes);

        let ciphertext = self
            .cipher
            .encrypt(nonce, plaintext)
            .map_err(|e| AppError::Crypto(format!("Encryption failed: {}", e)))?;

        Ok((ciphertext, nonce_bytes.to_vec()))
    }

    pub fn decrypt(&self, ciphertext: &[u8], nonce_bytes: &[u8]) -> AppResult<Vec<u8>> {
        let nonce = Nonce::from_slice(nonce_bytes);

        self.cipher
            .decrypt(nonce, ciphertext)
            .map_err(|e| AppError::Crypto(format!("Decryption failed: {}", e)))
    }
}
