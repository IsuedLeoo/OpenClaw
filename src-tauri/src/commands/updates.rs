use tauri::State;

use crate::error::AppError;
use crate::services::update::UpdateInfo;
use crate::state::AppState;

#[tauri::command]
pub fn check_update(state: State<'_, AppState>) -> Result<UpdateInfo, AppError> {
    state.update.check_for_updates()
}
