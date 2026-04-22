use godot::prelude::*;
use godot::classes::{INode3D, Node3D, MeshInstance3D, BoxMesh, Mesh, StandardMaterial3D, Material};

use std::net::UdpSocket;

struct GameExtension;

#[gdextension]
unsafe impl ExtensionLibrary for GameExtension {}

const WALL_HEIGHT: f32 = 3.0;
const WALL_THICKNESS: f32 = 0.2;
const FLOOR_THICKNESS: f32 = 0.1;

const CLASSROOM_WIDTH: f32 = 8.0;
const CLASSROOM_DEPTH: f32 = 7.0;

const HALLWAY_WIDTH: f32 = 3.0;
const HALLWAY_LENGTH: f32 = 40.0;

const WINDOW_WIDTH: f32 = 1.5;
const WINDOW_HEIGHT: f32 = 1.5;

const NUM_CLASSROOMS_PER_SIDE: i32 = 4;

fn color_floor() -> Color { Color::from_rgb(0.75, 0.72, 0.68) }
fn color_wall() -> Color { Color::from_rgb(0.92, 0.90, 0.85) }
fn color_wall_exterior() -> Color { Color::from_rgb(0.80, 0.78, 0.73) }
fn color_ceiling() -> Color { Color::from_rgb(0.95, 0.95, 0.95) }
fn color_window() -> Color { Color::from_rgb(0.6, 0.85, 0.95) }
fn color_door() -> Color { Color::from_rgb(0.55, 0.35, 0.20) }
fn color_blackboard() -> Color { Color::from_rgb(0.15, 0.25, 0.15) }
fn color_desk() -> Color { Color::from_rgb(0.65, 0.50, 0.35) }
fn color_roof() -> Color { Color::from_rgb(0.45, 0.35, 0.30) }

fn create_box_node(pos: Vector3, size: Vector3, color: Color) -> Gd<MeshInstance3D> {
    let mut mesh_instance = MeshInstance3D::new_alloc();
    let mut mesh = BoxMesh::new_gd();
    let mut material = StandardMaterial3D::new_gd();

    material.set_albedo(color);
    mesh.set_size(size);
    mesh.set_material(&material.upcast::<Material>());
    mesh_instance.set_mesh(&mesh.upcast::<Mesh>());
    mesh_instance.set_position(pos);

    mesh_instance
}

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
        if let Some(ref socket) = self.socket {
            let mut buf = [0; 1024];
            if let Ok((amt, _)) = socket.recv_from(&mut buf) {
                let msg = String::from_utf8_lossy(&buf[..amt]);
                godot_print!("Rust Received UDP: {}", msg);

                if msg == "GENERATE" || msg == "GENERATE_SCHOOL" {
                    self.clear_objects();
                    self.generate_school();
                } else if msg.starts_with("SPAWN:") {
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

    // ========================================================
    // GENERATE SCHOOL - Fungsi utama
    // ========================================================
    #[func]
    pub fn generate_school(&mut self) {
        godot_print!("=== GENERATING SCHOOL ===");

        // Kumpulkan semua node dulu, baru add_child setelahnya
        let mut nodes: Vec<Gd<MeshInstance3D>> = Vec::new();

        // --- 1. LANTAI UTAMA ---
        let total_width = HALLWAY_LENGTH + 4.0;
        let total_depth = HALLWAY_WIDTH + (CLASSROOM_DEPTH * 2.0) + (WALL_THICKNESS * 4.0);
        nodes.push(create_box_node(
            Vector3::new(0.0, -FLOOR_THICKNESS / 2.0, 0.0),
            Vector3::new(total_width, FLOOR_THICKNESS, total_depth),
            color_floor(),
        ));

        // --- 2. PLAFON LORONG ---
        nodes.push(create_box_node(
            Vector3::new(0.0, WALL_HEIGHT, 0.0),
            Vector3::new(HALLWAY_LENGTH, FLOOR_THICKNESS, HALLWAY_WIDTH + WALL_THICKNESS * 2.0),
            color_ceiling(),
        ));

        // --- 3. KELAS SISI UTARA ---
        let classroom_start_x = -(HALLWAY_LENGTH / 2.0) + (CLASSROOM_WIDTH / 2.0) + 1.0;

        for i in 0..NUM_CLASSROOMS_PER_SIDE {
            let cx = classroom_start_x + (i as f32 * (CLASSROOM_WIDTH + WALL_THICKNESS + 0.5));
            let cz = -(HALLWAY_WIDTH / 2.0) - WALL_THICKNESS - (CLASSROOM_DEPTH / 2.0);
            Self::build_classroom(&mut nodes, cx, cz, false);
        }

        // --- 4. KELAS SISI SELATAN ---
        for i in 0..NUM_CLASSROOMS_PER_SIDE {
            let cx = classroom_start_x + (i as f32 * (CLASSROOM_WIDTH + WALL_THICKNESS + 0.5));
            let cz = (HALLWAY_WIDTH / 2.0) + WALL_THICKNESS + (CLASSROOM_DEPTH / 2.0);
            Self::build_classroom(&mut nodes, cx, cz, true);
        }

        // --- 5. DINDING UJUNG LORONG ---
        // Ujung kiri (tertutup)
        nodes.push(create_box_node(
            Vector3::new(-(HALLWAY_LENGTH / 2.0), WALL_HEIGHT / 2.0, 0.0),
            Vector3::new(WALL_THICKNESS, WALL_HEIGHT, HALLWAY_WIDTH),
            color_wall(),
        ));

        // Ujung kanan (pintu masuk - dibagi 2 dengan lubang di tengah)
        nodes.push(create_box_node(
            Vector3::new(HALLWAY_LENGTH / 2.0, WALL_HEIGHT / 2.0, -(HALLWAY_WIDTH / 4.0)),
            Vector3::new(WALL_THICKNESS, WALL_HEIGHT, HALLWAY_WIDTH / 2.0 - 0.5),
            color_wall(),
        ));
        nodes.push(create_box_node(
            Vector3::new(HALLWAY_LENGTH / 2.0, WALL_HEIGHT / 2.0, HALLWAY_WIDTH / 4.0),
            Vector3::new(WALL_THICKNESS, WALL_HEIGHT, HALLWAY_WIDTH / 2.0 - 0.5),
            color_wall(),
        ));
        // Kusen pintu masuk
        nodes.push(create_box_node(
            Vector3::new(HALLWAY_LENGTH / 2.0, WALL_HEIGHT - 0.3, 0.0),
            Vector3::new(WALL_THICKNESS + 0.05, 0.6, 1.0),
            color_door(),
        ));

        // --- 6. ATAP ---
        nodes.push(create_box_node(
            Vector3::new(0.0, WALL_HEIGHT + FLOOR_THICKNESS, 0.0),
            Vector3::new(total_width, 0.15, total_depth),
            color_roof(),
        ));

        // --- 7. TEMBOK EKSTERIOR PANJANG ---
        let ext_z_north = -(HALLWAY_WIDTH / 2.0) - WALL_THICKNESS - CLASSROOM_DEPTH;
        nodes.push(create_box_node(
            Vector3::new(0.0, WALL_HEIGHT / 2.0, ext_z_north),
            Vector3::new(HALLWAY_LENGTH, WALL_HEIGHT, WALL_THICKNESS),
            color_wall_exterior(),
        ));
        let ext_z_south = (HALLWAY_WIDTH / 2.0) + WALL_THICKNESS + CLASSROOM_DEPTH;
        nodes.push(create_box_node(
            Vector3::new(0.0, WALL_HEIGHT / 2.0, ext_z_south),
            Vector3::new(HALLWAY_LENGTH, WALL_HEIGHT, WALL_THICKNESS),
            color_wall_exterior(),
        ));

        // --- 8. JENDELA EKSTERIOR ---
        for i in 0..8 {
            let wx = -(HALLWAY_LENGTH / 2.0) + 3.0 + (i as f32 * 5.0);
            nodes.push(create_box_node(
                Vector3::new(wx, WALL_HEIGHT * 0.55, ext_z_north),
                Vector3::new(WINDOW_WIDTH, WINDOW_HEIGHT, WALL_THICKNESS + 0.05),
                color_window(),
            ));
            nodes.push(create_box_node(
                Vector3::new(wx, WALL_HEIGHT * 0.55, ext_z_south),
                Vector3::new(WINDOW_WIDTH, WINDOW_HEIGHT, WALL_THICKNESS + 0.05),
                color_window(),
            ));
        }

        // --- TAMBAHKAN SEMUA NODE KE SCENE ---
        let mut base = self.base_mut();
        for node in nodes {
            base.add_child(&node);
        }

        godot_print!("=== SCHOOL GENERATED SUCCESSFULLY ===");
    }

  
    fn build_classroom(nodes: &mut Vec<Gd<MeshInstance3D>>, cx: f32, cz: f32, is_south: bool) {
        let door_side = if is_south { -1.0 } else { 1.0 };

        // Lantai kelas
        nodes.push(create_box_node(
            Vector3::new(cx, 0.01, cz),
            Vector3::new(CLASSROOM_WIDTH, 0.02, CLASSROOM_DEPTH),
            Color::from_rgb(0.78, 0.74, 0.68),
        ));

        // Plafon kelas
        nodes.push(create_box_node(
            Vector3::new(cx, WALL_HEIGHT, cz),
            Vector3::new(CLASSROOM_WIDTH, FLOOR_THICKNESS, CLASSROOM_DEPTH),
            color_ceiling(),
        ));

        // Tembok kiri
        nodes.push(create_box_node(
            Vector3::new(cx - CLASSROOM_WIDTH / 2.0, WALL_HEIGHT / 2.0, cz),
            Vector3::new(WALL_THICKNESS, WALL_HEIGHT, CLASSROOM_DEPTH),
            color_wall(),
        ));

        // Tembok kanan
        nodes.push(create_box_node(
            Vector3::new(cx + CLASSROOM_WIDTH / 2.0, WALL_HEIGHT / 2.0, cz),
            Vector3::new(WALL_THICKNESS, WALL_HEIGHT, CLASSROOM_DEPTH),
            color_wall(),
        ));

        // Tembok depan (menghadap lorong) - bagian kiri pintu
        let front_z = cz + (CLASSROOM_DEPTH / 2.0) * door_side;
        nodes.push(create_box_node(
            Vector3::new(cx - CLASSROOM_WIDTH / 4.0 - 0.5, WALL_HEIGHT / 2.0, front_z),
            Vector3::new(CLASSROOM_WIDTH / 2.0 - 1.0, WALL_HEIGHT, WALL_THICKNESS),
            color_wall(),
        ));
        // Bagian kanan pintu
        nodes.push(create_box_node(
            Vector3::new(cx + CLASSROOM_WIDTH / 4.0 + 0.5, WALL_HEIGHT / 2.0, front_z),
            Vector3::new(CLASSROOM_WIDTH / 2.0 - 1.0, WALL_HEIGHT, WALL_THICKNESS),
            color_wall(),
        ));
        // Kusen pintu
        nodes.push(create_box_node(
            Vector3::new(cx, WALL_HEIGHT - 0.25, front_z),
            Vector3::new(1.2, 0.5, WALL_THICKNESS + 0.02),
            color_door(),
        ));

        // Papan tulis (tembok belakang)
        let back_z = cz - (CLASSROOM_DEPTH / 2.0) * door_side;
        nodes.push(create_box_node(
            Vector3::new(cx, WALL_HEIGHT * 0.5, back_z + 0.15 * door_side),
            Vector3::new(3.5, 1.2, 0.08),
            color_blackboard(),
        ));

        // Meja-meja (Grid 3x4)
        for row in 0..4 {
            for col in 0..3 {
                let dx = cx - 2.0 + (col as f32 * 2.0);
                let dz_offset = -1.5 + (row as f32 * 1.2);
                let dz = cz + dz_offset * door_side;

                // Permukaan meja
                nodes.push(create_box_node(
                    Vector3::new(dx, 0.75, dz),
                    Vector3::new(0.8, 0.05, 0.5),
                    color_desk(),
                ));
                // Kaki meja
                nodes.push(create_box_node(
                    Vector3::new(dx, 0.35, dz),
                    Vector3::new(0.05, 0.7, 0.05),
                    Color::from_rgb(0.3, 0.3, 0.3),
                ));
            }
        }
    }

    #[func]
    pub fn spawn_random_cubes(&mut self, count: i32) {
        let mut nodes: Vec<Gd<MeshInstance3D>> = Vec::new();

        for i in 0..count {
            let mut material = StandardMaterial3D::new_gd();
            material.set_albedo(Color::from_rgb(
                0.1,
                0.5 + (i as f32 / count as f32).min(0.5),
                0.2
            ));

            let mut mesh = BoxMesh::new_gd();
            mesh.set_material(&material.upcast::<Material>());

            let mut mesh_instance = MeshInstance3D::new_alloc();
            mesh_instance.set_mesh(&mesh.upcast::<Mesh>());

            let x = (rand::random::<f32>() - 0.5) * 20.0;
            let z = (rand::random::<f32>() - 0.5) * 20.0;
            mesh_instance.set_position(Vector3::new(x, 0.0, z));

            nodes.push(mesh_instance);
        }

        let mut base = self.base_mut();
        for node in nodes {
            base.add_child(&node);
        }
    }

    #[func]
    pub fn clear_objects(&mut self) {
        let base = self.base_mut();
        let children = base.get_children();
        for i in 0..children.len() {
            let mut child = children.at(i);
            if child.is_class("MeshInstance3D") {
                child.queue_free();
            }
        }
    }
}
