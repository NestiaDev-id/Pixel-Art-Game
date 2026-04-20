use godot::prelude::*;
use godot::classes::{INode3D, Node3D, MeshInstance3D, BoxMesh, Mesh, StandardMaterial3D, Material};

use std::net::UdpSocket;

struct GameExtension;

#[gdextension]
unsafe impl ExtensionLibrary for GameExtension {}

#[derive(GodotClass)]
#[class(base=Node3D)]
pub struct WorldGenerator {
    base: Base<Node3D>,
    socket: Option<UdpSocket>,
}

#[godot_api]
impl INode3D for WorldGenerator {
    fn init(base: Base<Node3D>) -> Self {
        godot_print!("WorldGenerator initialized!");
        
        // Setup UDP Socket (Non-blocking)
        let socket = UdpSocket::bind("127.0.0.1:9001").ok().and_then(|s| {
            s.set_nonblocking(true).ok();
            Some(s)
        });

        if socket.is_some() {
            godot_print!("Rust: UDP Listener aktif di port 9001");
        }

        Self { base, socket }
    }

    fn process(&mut self, _delta: f64) {
        // Cek pesan UDP setiap frame
        if let Some(ref socket) = self.socket {
            let mut buf = [0; 1024];
            if let Ok((amt, _)) = socket.recv_from(&mut buf) {
                let msg = String::from_utf8_lossy(&buf[..amt]);
                godot_print!("Rust Received UDP: {}", msg);
                
                if msg.starts_with("SPAWN:") {
                    if let Ok(count) = msg[6..].parse::<i32>() {
                        self.spawn_random_cubes(count);
                    }
                } else if msg == "CLEAR" {
                    self.clear_objects();
                }
            }
        }
    }
}

#[godot_api]
impl WorldGenerator {
    #[func]
    pub fn spawn_random_cubes(&mut self, count: i32) {
        let mut base = self.base_mut();
        
        for i in 0..count {
            let mut mesh_instance = MeshInstance3D::new_alloc();
            let mut mesh = BoxMesh::new_gd();
            let mut material = StandardMaterial3D::new_gd();
            
            material.set_albedo(Color::from_rgb(
                0.1, 
                0.5 + (i as f32 / count as f32).min(0.5), 
                0.2
            ));
            
            mesh.set_material(&material.upcast::<Material>());
            mesh_instance.set_mesh(&mesh.upcast::<Mesh>());
            
            let x = (rand::random::<f32>() - 0.5) * 20.0;
            let z = (rand::random::<f32>() - 0.5) * 20.0;
            mesh_instance.set_position(Vector3::new(x, 0.0, z));
            
            base.add_child(&mesh_instance);
        }
    }

    #[func]
    pub fn clear_objects(&mut self) {
        let mut base = self.base_mut();
        let children = base.get_children();
        for i in 0..children.len() {
            let mut child = children.at(i);
            // Hanya hapus MeshInstance3D agar kamera dan lampu aman
            if child.is_class("MeshInstance3D") {
                child.queue_free();
            }
        }
    }
}
