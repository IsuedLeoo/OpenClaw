use tauri::{AppHandle, State};

use crate::db::models::{RuntimeInfo, RuntimeMetrics};
use crate::error::AppError;
use crate::state::AppState;

#[tauri::command]
pub fn runtime_status(state: State<'_, AppState>) -> Result<RuntimeInfo, AppError> {
    state.runtime.get_info()
}

#[tauri::command]
pub fn runtime_metrics(state: State<'_, AppState>) -> Result<RuntimeMetrics, AppError> {
    state.runtime.get_metrics()
}

#[tauri::command]
pub fn runtime_start(app: AppHandle, state: State<'_, AppState>) -> Result<(), AppError> {
    state.runtime.start(Some(&app))
}

#[tauri::command]
pub fn runtime_stop(app: AppHandle, state: State<'_, AppState>) -> Result<(), AppError> {
    state.runtime.stop(Some(&app))
}

#[tauri::command]
pub fn runtime_restart(app: AppHandle, state: State<'_, AppState>) -> Result<(), AppError> {
    state.runtime.restart(Some(&app))
}
