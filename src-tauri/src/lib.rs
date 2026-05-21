pub mod commands;
pub mod crypto;
pub mod db;
pub mod error;
pub mod platform;
pub mod runtime;
pub mod services;
pub mod state;

use state::AppState;
use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    Manager, WindowEvent,
};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    env_logger::Builder::from_env(env_logger::Env::default().default_filter_or("info")).init();

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .setup(|app| {
            let data_dir = app
                .path()
                .app_data_dir()
                .expect("Failed to get app data directory");

            let app_state =
                AppState::new(data_dir).expect("Failed to initialize application state");

            app.manage(app_state);

            // Build system tray
            let show = MenuItem::with_id(app, "show", "Show OpenClaw", true, None::<&str>)?;
            let start_agent =
                MenuItem::with_id(app, "start_agent", "Start Agent", true, None::<&str>)?;
            let stop_agent =
                MenuItem::with_id(app, "stop_agent", "Stop Agent", true, None::<&str>)?;
            let quit = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;

            let menu = Menu::with_items(app, &[&show, &start_agent, &stop_agent, &quit])?;

            let icon = app.default_window_icon().cloned()
                .expect("Failed to load tray icon");

            let _tray = TrayIconBuilder::new()
                .icon(icon)
                .menu(&menu)
                .tooltip("OpenClaw — AI Agent Platform")
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "show" => {
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                    "start_agent" => {
                        let state = app.state::<AppState>();
                        if let Err(err) = state.runtime.start(Some(app)) {
                            log::error!("Failed to start runtime from tray: {}", err);
                        }
                    }
                    "stop_agent" => {
                        let state = app.state::<AppState>();
                        if let Err(err) = state.runtime.stop(Some(app)) {
                            log::error!("Failed to stop runtime from tray: {}", err);
                        }
                    }
                    "quit" => {
                        let state = app.state::<AppState>();
                        if let Err(err) = state.runtime.stop(None) {
                            log::warn!("Error stopping runtime on quit: {}", err);
                        }
                        app.exit(0);
                    }
                    _ => {}
                })
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::Click {
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Up,
                        ..
                    } = event
                    {
                        let app = tray.app_handle();
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                })
                .build(app)?;

            // Minimize to tray on window close
            let main_window = app.get_webview_window("main").unwrap();
            main_window.on_window_event(|event| {
                if let WindowEvent::CloseRequested { api, .. } = event {
                    // Prevent closing — hide to tray instead
                    api.prevent_close();
                    // The window handle is available from the event in newer Tauri,
                    // but we handle this in the on_window_event callback
                }
            });

            log::info!("OpenClaw initialized successfully");
            Ok(())
        })
        .on_window_event(|window, event| {
            if let WindowEvent::CloseRequested { api, .. } = event {
                api.prevent_close();
                let _ = window.hide();
            }
        })
        .invoke_handler(tauri::generate_handler![
            // Config
            commands::config::config_get_all,
            commands::config::config_get,
            commands::config::config_set,
            // Runtime
            commands::runtime::runtime_status,
            commands::runtime::runtime_metrics,
            commands::runtime::runtime_start,
            commands::runtime::runtime_stop,
            commands::runtime::runtime_restart,
            // Chat
            commands::chat::chat_send,
            // Telegram
            commands::telegram::telegram_status,
            commands::telegram::telegram_connect,
            commands::telegram::telegram_disconnect,
            // Providers
            commands::providers::provider_list,
            commands::providers::provider_add,
            commands::providers::provider_remove,
            commands::providers::provider_toggle,
            commands::providers::provider_store_key,
            commands::providers::provider_get_masked_key,
            commands::providers::provider_has_key,
            commands::providers::provider_delete_key,
            // Permissions
            commands::permissions::permission_list,
            commands::permissions::permission_grant,
            commands::permissions::permission_revoke,
            // Memory
            commands::memory::memory_list,
            commands::memory::memory_search,
            commands::memory::memory_add,
            commands::memory::memory_remove,
            commands::memory::memory_clear,
            // Profiles
            commands::profiles::profile_list,
            commands::profiles::profile_set_active,
            commands::profiles::profile_create,
            commands::profiles::profile_delete,
            // Monitoring
            commands::monitoring::audit_log,
            // Updates
            commands::updates::check_update,
        ])
        .run(tauri::generate_context!())
        .expect("error while running OpenClaw");
}
