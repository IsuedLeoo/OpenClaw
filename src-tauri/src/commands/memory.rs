use tauri::State;

use crate::db::models::MemoryEntry;
use crate::error::AppError;
use crate::state::AppState;

#[tauri::command]
pub fn memory_list(state: State<'_, AppState>) -> Result<Vec<MemoryEntry>, AppError> {
    state.memory.list()
}

#[tauri::command]
pub fn memory_search(state: State<'_, AppState>, query: String) -> Result<Vec<MemoryEntry>, AppError> {
    state.memory.search(&query)
}

#[tauri::command]
pub fn memory_add(
    state: State<'_, AppState>,
    content: String,
    category: String,
    source: String,
) -> Result<String, AppError> {
    state.memory.add(&content, &category, &source)
}

#[tauri::command]
pub fn memory_remove(state: State<'_, AppState>, id: String) -> Result<(), AppError> {
    state.memory.remove(&id)
}

#[tauri::command]
pub fn memory_clear(state: State<'_, AppState>) -> Result<(), AppError> {
    state.memory.clear()
}
