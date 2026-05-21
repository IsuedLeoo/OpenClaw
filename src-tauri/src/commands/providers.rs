use tauri::State;

use crate::db::models::Provider;
use crate::error::AppError;
use crate::state::AppState;

#[tauri::command]
pub fn provider_list(state: State<'_, AppState>) -> Result<Vec<Provider>, AppError> {
    state.provider.list()
}

#[tauri::command]
pub fn provider_add(
    state: State<'_, AppState>,
    id: String,
    name: String,
    kind: String,
    base_url: Option<String>,
) -> Result<(), AppError> {
    state.provider.add(&id, &name, &kind, base_url.as_deref())
}

#[tauri::command]
pub fn provider_remove(state: State<'_, AppState>, id: String) -> Result<(), AppError> {
    state.provider.remove(&id)
}

#[tauri::command]
pub fn provider_toggle(
    state: State<'_, AppState>,
    id: String,
    enabled: bool,
) -> Result<(), AppError> {
    state.provider.toggle(&id, enabled)
}

#[tauri::command]
pub fn provider_store_key(
    state: State<'_, AppState>,
    provider_id: String,
    api_key: String,
) -> Result<String, AppError> {
    state.provider.store_api_key(&provider_id, "default", &api_key)
}

#[tauri::command]
pub fn provider_get_masked_key(
    state: State<'_, AppState>,
    provider_id: String,
) -> Result<String, AppError> {
    state.provider.get_masked_key(&provider_id)
}

#[tauri::command]
pub fn provider_has_key(
    state: State<'_, AppState>,
    provider_id: String,
) -> Result<bool, AppError> {
    state.provider.has_api_key(&provider_id)
}

#[tauri::command]
pub fn provider_delete_key(
    state: State<'_, AppState>,
    key_id: String,
) -> Result<(), AppError> {
    state.provider.delete_api_key(&key_id)
}
