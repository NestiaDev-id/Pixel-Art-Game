@tool
extends EditorScript

## School Collision Generator
## Script otomatis untuk meng-generate CollisionShape (Trimesh StaticBody3D)
## pada gedung sekolah (Untitled_school.glb) berdasarkan kategori material.
## Sesuai roadmap Tahap 2 & perhitungan_ukuran_gedung.md.
##
## CARA PAKAI:
## 1. Buka scene 'res://scenes/main.tscn' di Godot Editor.
## 2. Buka script ini di Script Editor, lalu klik menu 'File' -> 'Run' (atau Ctrl+Shift+X).
## 3. Script akan otomatis membuat Trimesh StaticBody3D untuk lantai, tangga, dinding, pagar, dan jalan.
## 4. Tekan Ctrl+S untuk menyimpan perubahan pada scene.

const FLOOR_MATERIALS = ["floor_slab", "楼板"]
const STAIRS_MATERIALS = ["stairs", "stairs_alt", "台阶", "台阶ss"]
const WALL_MATERIALS = ["wall_gray", "wall_gray_2", "wall_gray_2b", "wall_white", "wall_white_alt", "灰墙", "灰墙2", "灰墙22", "白墙", "白墙s"]
const RAILING_MATERIALS = ["railing_metal", "glass_railing", "glass_railing_2", "栏杆", "栏杆玻璃", "栏杆玻璃2"]
const GROUND_MATERIALS = ["paving_1", "road", "curb", "zebra_crossing", "line_yellow", "grass_field_large", "grass_field_large_alt", "grass_2", "courtyard", "大草地", "大草地ss", "草地-2", "铺地-1", "马路ss", "路牙", "斑马线", "黄线", "院子"]

func _run() -> void:
	var editor_interface = get_editor_interface()
	var root = editor_interface.get_edited_scene_root()
	if not root:
		printerr("[CollisionGenerator] ERROR: Tidak ada scene yang sedang diedit! Buka 'res://scenes/main.tscn' terlebih dahulu.")
		return

	var school_node = root.find_child("Untitled_school", true, false)
	if not school_node:
		printerr("[CollisionGenerator] ERROR: Node 'Untitled_school' tidak ditemukan di scene!")
		return

	print("==================================================")
	print("[CollisionGenerator] MEMULAI GENERASI COLLISION...")
	print("==================================================")

	var count_floors = 0
	var count_stairs = 0
	var count_walls = 0
	var count_railings = 0
	var count_grounds = 0
	var count_skipped = 0

	var mesh_nodes: Array[MeshInstance3D] = []
	_gather_mesh_instances(school_node, mesh_nodes)
	print("[CollisionGenerator] Total MeshInstance3D ditemukan: ", mesh_nodes.size())

	for mesh_inst in mesh_nodes:
		var cat = _determine_category(mesh_inst)
		if cat == "skip":
			count_skipped += 1
			continue

		var created = _ensure_trimesh_collision(mesh_inst, root)
		if created:
			match cat:
				"floor": count_floors += 1
				"stairs": count_stairs += 1
				"wall": count_walls += 1
				"railing": count_railings += 1
				"ground": count_grounds += 1

	print("--------------------------------------------------")
	print("[CollisionGenerator] HASIL GENERASI COLLISION:")
	print(" - Lantai (Floors)    : ", count_floors, " mesh")
	print(" - Tangga (Stairs)    : ", count_stairs, " mesh (Trimesh)")
	print(" - Dinding (Walls)    : ", count_walls, " mesh")
	print(" - Pagar (Railings)   : ", count_railings, " mesh")
	print(" - Area Tanah/Jalan   : ", count_grounds, " mesh")
	print(" - Mesh Dilewati      : ", count_skipped, " mesh (dekoratif/prop non-solid)")
	print("==================================================")
	print("[CollisionGenerator] SELESAI! Silakan tekan Ctrl+S untuk menyimpan scene main.tscn.")
	print("==================================================")

func _gather_mesh_instances(node: Node, list: Array[MeshInstance3D]) -> void:
	if node is MeshInstance3D and node.mesh != null:
		list.append(node)
	for child in node.get_children():
		_gather_mesh_instances(child, list)

func _determine_category(mesh_inst: MeshInstance3D) -> String:
	var mesh = mesh_inst.mesh
	if not mesh:
		return "skip"

	var mat_names: Array[String] = []
	for i in range(mesh.get_surface_count()):
		var mat = mesh_inst.get_surface_override_material(i)
		if not mat:
			mat = mesh.surface_get_material(i)
		if mat:
			var mat_path = mat.resource_path.get_file().get_basename().to_lower()
			var mat_res_name = mat.resource_name.to_lower()
			mat_names.append(mat_path)
			mat_names.append(mat_res_name)

	var node_name = mesh_inst.name.to_lower()

	# Cek apakah cocok kategori
	for name in mat_names:
		for f in FLOOR_MATERIALS:
			if f.to_lower() in name: return "floor"
		for s in STAIRS_MATERIALS:
			if s.to_lower() in name: return "stairs"
		for w in WALL_MATERIALS:
			if w.to_lower() in name: return "wall"
		for r in RAILING_MATERIALS:
			if r.to_lower() in name: return "railing"
		for g in GROUND_MATERIALS:
			if g.to_lower() in name: return "ground"

	# Fallback nama node jika material belum match
	if "floor" in node_name: return "floor"
	if "stair" in node_name: return "stairs"
	if "wall" in node_name: return "wall"
	if "railing" in node_name: return "railing"

	return "skip"

func _ensure_trimesh_collision(mesh_inst: MeshInstance3D, root: Node) -> bool:
	# Cek apakah sudah ada StaticBody3D sebagai child
	for child in mesh_inst.get_children():
		if child is StaticBody3D:
			return false

	mesh_inst.create_trimesh_collision()

	# Set owner agar tersimpan ke file .tscn
	for child in mesh_inst.get_children():
		if child is StaticBody3D:
			child.collision_layer = 1
			child.collision_mask = 0
			child.owner = root
			for subchild in child.get_children():
				if subchild is CollisionShape3D:
					subchild.owner = root
	return true
