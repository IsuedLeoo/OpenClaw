use tauri::State;

use crate::db::models::AuditEntry;
use crate::error::AppError;
use crate::state::AppState;

#[tauri::command]
pub fn audit_log(state: State<'_, AppState>, limit: Option<u32>) -> Result<Vec<AuditEntry>, AppError> {
    state.monitoring.get_audit_log(limit.unwrap_or(100))
}
