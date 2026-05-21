use tauri::State;

use crate::db::models::Profile;
use crate::error::AppError;
use crate::state::AppState;

#[tauri::command]
pub fn profile_list(state: State<'_, AppState>) -> Result<Vec<Profile>, AppError> {
    state.profile.list()
}

#[tauri::command]
pub fn profile_set_active(state: State<'_, AppState>, id: String) -> Result<(), AppError> {
    state.profile.set_active(&id)
}

#[tauri::command]
pub fn profile_create(
    state: State<'_, AppState>,
    name: String,
    description: String,
    personality: String,
    model: String,
) -> Result<String, AppError> {
    state.profile.create(&name, &description, &personality, &model)
}

#[tauri::command]
pub fn profile_delete(state: State<'_, AppState>, id: String) -> Result<(), AppError> {
    state.profile.delete(&id)
}
