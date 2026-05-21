use tauri::State;

use crate::error::AppError;
use crate::state::AppState;

#[tauri::command]
pub fn chat_send(state: State<'_, AppState>, message: String) -> Result<String, AppError> {
    state.runtime.send_message(&message)
}
