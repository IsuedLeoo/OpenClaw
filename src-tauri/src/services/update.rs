use crate::error::AppResult;
use serde::Serialize;

#[derive(Debug, Serialize, Clone)]
pub struct UpdateInfo {
    pub available: bool,
    pub version: Option<String>,
    pub notes: Option<String>,
    pub date: Option<String>,
}

pub struct UpdateService;

impl UpdateService {
    pub fn new() -> Self {
        Self
    }

    pub fn check_for_updates(&self) -> AppResult<UpdateInfo> {
        // TODO: Check the update manifest URL
        Ok(UpdateInfo {
            available: false,
            version: None,
            notes: None,
            date: None,
        })
    }
}
