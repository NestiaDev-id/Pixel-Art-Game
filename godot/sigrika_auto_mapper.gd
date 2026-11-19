@tool
extends EditorScript

const TEXTURE_DIR = "res://assets/actors/Sigrika/textures/"

const MAPPING = {
	"Up_": "Up_D.png",
	"Up_Belt": "Up_D.png",
	"Up_Metal": "Up_D.png",
	"Up_Glove": "Up_D.png",
	"Up_Shoe": "Up_D.png",
	"Up_Skin": "Up_Skin.png",
	"Down_": "Down_D.png",
	"Down_Belt": "Down_D.png",
	"Down_Liusu": "Down_D.png",
	"Down_Pink": "Down_D.png",
	"Down_Coatin": "Down_D.png",
	"Down_Bag": "Down_D.png",
	"Down_Collar": "Down_D.png",
	"Down_Metal": "Down_D.png",
	"Down_Tie": "Down_D.png",
	"Down_Horn": "Down_D.png",
	"Cloth": "Cloth_D.png",
	"Cloth_Ring": "Cloth_D.png",
	"Cloth_Bow": "Cloth_D.png",
	"Cloth_Earring": "Cloth_D.png",
	"Cloth_Metal": "Cloth_D.png",
	"Cloth_Hairscarf": "Cloth_D.png",
	"Cloth_Hairpin": "Cloth_D.png",
	"Cloth_Liusu": "Cloth_D.png",
	"Cloth_Peal": "Cloth_D.png",
	"Cloth_HeadFlower": "Cloth_D.png",
	"Hair_Bangs": "Bangs_D.png",
	"Hair_Bangs+": "Bangs_Hi.png",
	"Hair_Back": "Hair_D.png",
	"Hair_Back+": "Hair_Hi.png",
	"Face_": "Face_D.png",
	"Face+": "face+.png",
	"Face_Mouthin": "Face_D.png",
	"Face_Noseline": "Face_D.png",
	"Face_Eyebrow": "Face_D.png",
	"Face_Eyelash": "Face_D.png",
	"Face_Eyewhite": "Face_D.png",
	"Eye_": "Eye_D.png",
	"Eye_+": "Eye_D.png",
	"Eye_Hi": "eyehi.png",
	"Star": "5xing.png",
	"Facial": "bqb.png",
}

func _run():
	var root = get_editor_interface().get_edited_scene_root()
	if not root:
		print("ERROR: Tidak ada scene root yang terbuka!")
		return

	# Sembunyikan semua collider rigid body visualizer
	var all_nodes = []
	_find_all_mesh_nodes(root, all_nodes)
	var hidden_count = 0
	for node in all_nodes:
		if not ("sigrika" in node.name.to_lower()):
			node.visible = false
			hidden_count += 1
	print("--- Rigid body collider disembunyikan: ", hidden_count, " node ---")

	# Cari MeshInstance3D tubuh utama Sigrika
	var target: MeshInstance3D = null
	for node in all_nodes:
		if node.mesh != null and "sigrika" in node.name.to_lower():
			target = node
			break

	if not target:
		print("ERROR: Tidak menemukan mesh utama Sigrika!")
		return

	var mesh = target.mesh
	var surface_count = mesh.get_surface_count()
	print("--- MAP TEKSTUR SIGRIKA: ", target.name, " (", surface_count, " surfaces) ---")

	for i in range(surface_count):
		var slot_name = mesh.surface_get_name(i)
		var tex_file = MAPPING.get(slot_name, "")
		
		if tex_file != "":
			var tex_path = TEXTURE_DIR + tex_file
			if FileAccess.file_exists(tex_path):
				var tex = load(tex_path)
				var mat = StandardMaterial3D.new()
				mat.resource_name = slot_name
				mat.albedo_texture = tex
				mat.cull_mode = BaseMaterial3D.CULL_DISABLED
				mat.shading_mode = BaseMaterial3D.SHADING_MODE_PER_PIXEL
				
				# Setup transparansi untuk highlight/blush
				if slot_name in ["Face+", "Eye_Hi", "Facial"]:
					mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
				elif slot_name in ["Hair_Bangs+", "Hair_Back+"]:
					mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
					mat.albedo_color = Color(1, 1, 1, 0.6)
				
				target.set_surface_override_material(i, mat)
				print("OK: [", slot_name, "] -> ", tex_file)
			else:
				print("FILE NOT FOUND: ", tex_path)
		elif slot_name == "Face_Mouthtooth":
			var mat = StandardMaterial3D.new()
			mat.resource_name = slot_name
			mat.cull_mode = BaseMaterial3D.CULL_DISABLED
			mat.shading_mode = BaseMaterial3D.SHADING_MODE_PER_PIXEL
			mat.albedo_color = Color(1, 1, 1, 1)
			target.set_surface_override_material(i, mat)
			print("OK: [Face_Mouthtooth] -> White teeth solid")

	print("--- SELESAI PEMETAAN RESMI! ---")

func _find_all_mesh_nodes(node, list):
	if node is MeshInstance3D:
		list.append(node)
	for child in node.get_children():
		_find_all_mesh_nodes(child, list)
