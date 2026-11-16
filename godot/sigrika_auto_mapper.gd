@tool
extends EditorScript

const TEXTURE_DIR = "res://assets/actors/Sigrika/textures/"

func _run():
	var root = get_editor_interface().get_edited_scene_root()
	if not root: return

	# Cari SEMUA MeshInstance3D di scene
	var all_nodes = []
	_find_all_mesh_nodes(root, all_nodes)
	
	var target = null
	for node in all_nodes:
		if node.mesh != null and ("sigrika" in node.name.to_lower() or "sigrika" in node.get_parent().name.to_lower()):
			target = node
			break
	
	if not target:
		print("ERROR: Tidak menemukan Sigrika yang punya Mesh! Klik kanan 'Untitled_sigrika' lalu 'Editable Children' jika perlu.")
		return

	var mesh = target.mesh
	var surface_count = mesh.get_surface_count()
	print("--- FIXING: ", target.name, " ---")

	for i in range(surface_count):
		var slot_name = mesh.surface_get_name(i)
		var clean_name = slot_name.replace("+", "").split("_")[0]
		
		# Cari gambar yang cocok
		var found_tex = null
		var names = [slot_name, clean_name]
		for n in names:
			for ext in [".png", "_D.png"]:
				var p = TEXTURE_DIR + n + ext
				if FileAccess.file_exists(p):
					found_tex = load(p)
					break
			if found_tex: break

		if found_tex:
			var mat = StandardMaterial3D.new()
			mat.albedo_texture = found_tex
			mat.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
			target.set_surface_override_material(i, mat)
			print("OK: [", slot_name, "] -> ", found_tex.resource_path.get_file())

	print("--- SELESAI! ---")

func _find_all_mesh_nodes(node, list):
	if node is MeshInstance3D:
		list.append(node)
	for child in node.get_children():
		_find_all_mesh_nodes(child, list)
