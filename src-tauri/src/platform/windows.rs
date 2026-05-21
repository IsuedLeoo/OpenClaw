use crate::error::AppResult;

pub fn register_service(_service_name: &str) -> AppResult<()> {
    // TODO: Register Windows Service for background runtime
    log::info!("Windows service registration not yet implemented");
    Ok(())
}

pub fn unregister_service(_service_name: &str) -> AppResult<()> {
    // TODO: Unregister the Windows Service
    Ok(())
}
