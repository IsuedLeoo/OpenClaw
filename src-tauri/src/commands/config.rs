use std::collections::HashMap;
use tauri::State;

use crate::error::AppError;
use crate::state::AppState;

#[tauri::command]
pub fn config_get_all(state: State<'_, AppState>) -> Result<HashMap<String, String>, AppError> {
    state.config.get_all()
}

#[tauri::command]
pub fn config_get(state: State<'_, AppState>, key: String) -> Result<String, AppError> {
    state.config.get(&key)
}

#[tauri::command]
pub fn config_set(state: State<'_, AppState>, key: String, value: String) -> Result<(), AppError> {
    state.config.set(&key, &value)
}
