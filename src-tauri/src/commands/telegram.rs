use tauri::State;

use crate::error::AppError;
use crate::services::telegram::TelegramStatus;
use crate::state::AppState;

#[tauri::command]
pub fn telegram_status(state: State<'_, AppState>) -> Result<TelegramStatus, AppError> {
    state.telegram.get_status()
}

#[tauri::command]
pub async fn telegram_connect(
    state: State<'_, AppState>,
    bot_token: String,
    user_id: Option<String>,
) -> Result<String, AppError> {
    state
        .telegram
        .connect(&bot_token, user_id.as_deref())
        .await
}

#[tauri::command]
pub fn telegram_disconnect(state: State<'_, AppState>) -> Result<(), AppError> {
    state.telegram.disconnect()
}
