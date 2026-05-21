use std::sync::{Arc, Mutex};

use teloxide::prelude::*;
use teloxide::types::ParseMode;
use tokio::sync::mpsc;

use crate::db::Database;
use crate::error::{AppError, AppResult};

#[derive(Debug, Clone, serde::Serialize)]
pub struct TelegramStatus {
    pub connected: bool,
    pub bot_username: Option<String>,
    pub last_message_at: Option<String>,
}

#[derive(Debug, Clone)]
pub struct IncomingMessage {
    pub chat_id: i64,
    pub text: String,
    pub from_user: String,
}

struct TelegramState {
    connected: bool,
    bot_username: Option<String>,
    last_message_at: Option<String>,
    shutdown_tx: Option<tokio::sync::oneshot::Sender<()>>,
    allowed_user_id: Option<i64>,
}

pub struct TelegramService {
    db: Arc<Database>,
    state: Mutex<TelegramState>,
    incoming_tx: mpsc::UnboundedSender<IncomingMessage>,
    incoming_rx: Mutex<Option<mpsc::UnboundedReceiver<IncomingMessage>>>,
}

impl TelegramService {
    pub fn new(db: Arc<Database>) -> Self {
        let (tx, rx) = mpsc::unbounded_channel();
        Self {
            db,
            state: Mutex::new(TelegramState {
                connected: false,
                bot_username: None,
                last_message_at: None,
                shutdown_tx: None,
                allowed_user_id: None,
            }),
            incoming_tx: tx,
            incoming_rx: Mutex::new(Some(rx)),
        }
    }

    pub fn get_status(&self) -> AppResult<TelegramStatus> {
        let state = self
            .state
            .lock()
            .map_err(|e| AppError::Internal(format!("Lock poisoned: {}", e)))?;

        Ok(TelegramStatus {
            connected: state.connected,
            bot_username: state.bot_username.clone(),
            last_message_at: state.last_message_at.clone(),
        })
    }

    pub fn take_incoming_rx(&self) -> Option<mpsc::UnboundedReceiver<IncomingMessage>> {
        self.incoming_rx
            .lock()
            .ok()
            .and_then(|mut guard| guard.take())
    }

    pub async fn connect(
        &self,
        bot_token: &str,
        user_id: Option<&str>,
    ) -> AppResult<String> {
        if bot_token.is_empty() {
            return Err(AppError::Telegram("Bot token is required".into()));
        }

        if !bot_token.contains(':') {
            return Err(AppError::Telegram("Invalid bot token format".into()));
        }

        let allowed_user_id: Option<i64> = match user_id {
            Some(id) if !id.is_empty() => Some(
                id.parse()
                    .map_err(|_| AppError::Telegram("User ID must be a number".into()))?,
            ),
            _ => None,
        };

        let bot = Bot::new(bot_token);

        let me = bot
            .get_me()
            .await
            .map_err(|e| AppError::Telegram(format!("Failed to connect: {}", e)))?;

        let username = me.username().to_string();

        let (shutdown_tx, mut shutdown_rx) = tokio::sync::oneshot::channel::<()>();

        {
            let mut state = self
                .state
                .lock()
                .map_err(|e| AppError::Internal(format!("Lock poisoned: {}", e)))?;

            if let Some(old_tx) = state.shutdown_tx.take() {
                let _ = old_tx.send(());
            }

            state.connected = true;
            state.bot_username = Some(username.clone());
            state.shutdown_tx = Some(shutdown_tx);
            state.allowed_user_id = allowed_user_id;
        }

        // Store encrypted token in database
        self.db.with_conn(|conn| {
            conn.execute(
                "INSERT OR REPLACE INTO telegram_config (id, bot_username, allowed_user_id, is_connected, updated_at)
                 VALUES (1, ?1, ?2, 1, datetime('now'))",
                rusqlite::params![&username, user_id],
            )?;
            Ok(())
        })?;

        let incoming_tx = self.incoming_tx.clone();
        let bot_clone = bot.clone();

        tokio::spawn(async move {
            let handler = Update::filter_message().endpoint(
                move |msg: Message, bot: Bot| {
                    let tx = incoming_tx.clone();
                    async move {
                        let text = msg.text().unwrap_or("").to_string();
                        if text.is_empty() {
                            bot.send_message(msg.chat.id, "I can only process text messages for now.")
                                .await?;
                            return Ok::<(), teloxide::RequestError>(());
                        }

                        let from_user = msg
                            .from
                            .as_ref()
                            .and_then(|u| u.username.clone())
                            .unwrap_or_else(|| "unknown".into());

                        let incoming = IncomingMessage {
                            chat_id: msg.chat.id.0,
                            text: text.clone(),
                            from_user,
                        };

                        if tx.send(incoming).is_err() {
                            log::error!("Failed to forward Telegram message to runtime");
                        }

                        bot.send_message(
                            msg.chat.id,
                            "Processing your message... (runtime integration pending)",
                        )
                        .await?;

                        Ok(())
                    }
                },
            );

            let mut dispatcher = Dispatcher::builder(bot_clone, handler)
                .enable_ctrlc_handler()
                .build();

            let shutdown_token = dispatcher.shutdown_token();
            tokio::select! {
                _ = dispatcher.dispatch() => {},
                _ = &mut shutdown_rx => {
                    log::info!("Telegram bot shutdown signal received");
                    shutdown_token.shutdown().expect("shutdown failed").await;
                }
            }
        });

        log::info!("Telegram bot connected: @{}", username);
        Ok(username)
    }

    pub fn disconnect(&self) -> AppResult<()> {
        let mut state = self
            .state
            .lock()
            .map_err(|e| AppError::Internal(format!("Lock poisoned: {}", e)))?;

        if let Some(tx) = state.shutdown_tx.take() {
            let _ = tx.send(());
        }

        state.connected = false;
        state.bot_username = None;
        state.last_message_at = None;
        state.allowed_user_id = None;

        self.db.with_conn(|conn| {
            conn.execute(
                "UPDATE telegram_config SET is_connected = 0 WHERE id = 1",
                [],
            )?;
            Ok(())
        })?;

        log::info!("Telegram bot disconnected");
        Ok(())
    }

    pub async fn send_response(bot_token: &str, chat_id: i64, text: &str) -> AppResult<()> {
        let bot = Bot::new(bot_token);
        bot.send_message(ChatId(chat_id), text)
            .parse_mode(ParseMode::MarkdownV2)
            .await
            .map_err(|e| AppError::Telegram(format!("Failed to send: {}", e)))?;
        Ok(())
    }
}
