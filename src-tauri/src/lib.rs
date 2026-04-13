use std::net::UdpSocket;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn send_to_godot(msg: String) {
    let socket = UdpSocket::bind("127.0.0.1:0").expect("couldn't bind to address");
    socket.send_to(msg.as_bytes(), "127.0.0.1:9001").expect("couldn't send data");
    println!("Tauri sent to Godot: {}", msg);
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, send_to_godot])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
