use godot::prelude::*;
use godot::classes::{INode3D, Node3D, MeshInstance3D, BoxMesh, Mesh, StandardMaterial3D, Material};

struct GameExtension;

#[gdextension]
unsafe impl ExtensionLibrary for GameExtension {}

#[derive(GodotClass)]
#[class(base=Node3D)]
pub struct WorldGenerator {
    base: Base<Node3D>,
}

#[godot_api]
impl INode3D for WorldGenerator {
    fn init(base: Base<Node3D>) -> Self {
        godot_print!("WorldGenerator initialized!");
        Self { base }
    }
}

#[godot_api]
impl WorldGenerator {
    #[func]
    fn spawn_random_cubes(&mut self, count: i32) {
        godot_print!("Rust: Menanam {} kotak secara acak...", count);
        let mut base = self.base_mut();
        
        for i in 0..count {
            let mut mesh_instance = MeshInstance3D::new_alloc();
            let mut mesh = BoxMesh::new_gd();
            let mut material = StandardMaterial3D::new_gd();
            
            // Warna bervariasi
            material.set_albedo(Color::from_rgb(
                0.1, 
                0.5 + (i as f32 / count as f32) * 0.5, 
                0.2
            ));
            
            mesh.set_material(&material.upcast::<Material>());
            mesh_instance.set_mesh(&mesh.upcast::<Mesh>());
            
            // Posisi
            let x = (i as f32 % 10.0) * 2.5;
            let z = (i as f32 / 10.0) * 2.5;
            mesh_instance.set_position(Vector3::new(x, 0.0, z));
            
            base.add_child(&mesh_instance);
        }
    }

    #[func]
    fn clear_objects(&mut self) {
        let mut base = self.base_mut();
        let children = base.get_children();
        for i in 0..children.len() {
            let mut child = children.at(i);
            child.queue_free();
        }
    }
}
