use tauri::State;

use crate::db::models::PermissionEntry;
use crate::error::AppError;
use crate::state::AppState;

#[tauri::command]
pub fn permission_list(state: State<'_, AppState>) -> Result<Vec<PermissionEntry>, AppError> {
    state.security.list_permissions()
}

#[tauri::command]
pub fn permission_grant(state: State<'_, AppState>, id: String) -> Result<(), AppError> {
    state.security.grant_permission(&id)
}

#[tauri::command]
pub fn permission_revoke(state: State<'_, AppState>, id: String) -> Result<(), AppError> {
    state.security.revoke_permission(&id)
}
