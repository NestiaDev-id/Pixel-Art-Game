extends CharacterBody3D

# ============================================================
# SHADOW ACADEMY - Player Controller + Procedural Animation
# ============================================================
# Menggerakkan Sigrika dengan WASD, Mouse Look (TPP),
# Procedural Walk Animation (tanpa AnimationPlayer),
# dan Stair-Stepping Algorithm.
# ============================================================

# --- Konfigurasi Pergerakan ---
@export_group("Movement")
@export var speed: float = 5.0
@export var run_speed: float = 8.0
@export var jump_velocity: float = 4.5
@export var sensitivity: float = 0.003
@export var acceleration: float = 10.0

# --- Konfigurasi Tangga ---
@export_group("Stair Stepping")
@export var max_step_height: float = 0.4 # Tinggi maksimal anak tangga

# --- Konfigurasi Animasi Prosedural ---
@export_group("Procedural Animation")
@export var leg_swing_amplitude: float = 0.6  # Seberapa jauh kaki berayun
@export var leg_swing_speed: float = 8.0      # Kecepatan langkah
@export var arm_swing_amplitude: float = 0.4  # Seberapa jauh tangan berayun
@export var hip_sway_amplitude: float = 0.03  # Goyang pinggul kiri-kanan
@export var body_bob_amplitude: float = 0.02  # Naik-turun badan saat jalan
@export var breath_speed: float = 2.0         # Kecepatan nafas (idle)
@export var breath_amplitude: float = 0.01    # Seberapa besar nafas

# --- Node References ---
@onready var pivot = $SpringArm3D
@onready var model = $Untitled_sigrika
@onready var skeleton: Skeleton3D = null

# --- Internal Variables ---
var gravity = ProjectSettings.get_setting("physics/3d/default_gravity")
var walk_cycle_time: float = 0.0
var is_walking: bool = false
var current_speed: float = 0.0

# --- MMD Bone Indices (cached) ---
var bone_center: int = -1       # センター (Center/Hips)
var bone_upper_body: int = -1   # 上半身 (Upper Body)
var bone_lower_body: int = -1   # 下半身 (Lower Body)
var bone_leg_l: int = -1        # 足.L (Left Leg/Thigh)
var bone_leg_r: int = -1        # 足.R (Right Leg/Thigh)
var bone_knee_l: int = -1       # ひざ.L (Left Knee)
var bone_knee_r: int = -1       # ひざ.R (Right Knee)
var bone_arm_l: int = -1        # 腕.L (Left Arm)
var bone_arm_r: int = -1        # 腕.R (Right Arm)
var bone_forearm_l: int = -1    # ひじ.L (Left Elbow)
var bone_forearm_r: int = -1    # ひじ.R (Right Elbow)

func _ready():
	Input.mouse_mode = Input.MOUSE_MODE_CAPTURED
	_find_skeleton()
	_cache_bone_indices()

func _find_skeleton():
	# Cari Skeleton3D secara rekursif di dalam model Sigrika
	if model:
		skeleton = _find_node_by_type(model, "Skeleton3D")
	if skeleton:
		print("✅ Skeleton3D ditemukan! Total bones: ", skeleton.get_bone_count())
	else:
		print("⚠️ Skeleton3D tidak ditemukan di dalam model.")

func _find_node_by_type(node: Node, type_name: String) -> Node:
	if node.get_class() == type_name:
		return node
	for child in node.get_children():
		var result = _find_node_by_type(child, type_name)
		if result:
			return result
	return null

func _cache_bone_indices():
	if not skeleton:
		return
	
	# Cari semua tulang berdasarkan nama Jepang (MMD Standard)
	bone_center = skeleton.find_bone("センター")
	bone_upper_body = skeleton.find_bone("上半身")
	bone_lower_body = skeleton.find_bone("下半身")
	bone_leg_l = skeleton.find_bone("足.L")
	bone_leg_r = skeleton.find_bone("足.R")
	bone_knee_l = skeleton.find_bone("ひざ.L")
	bone_knee_r = skeleton.find_bone("ひざ.R")
	bone_arm_l = skeleton.find_bone("腕.L")
	bone_arm_r = skeleton.find_bone("腕.R")
	bone_forearm_l = skeleton.find_bone("ひじ.L")
	bone_forearm_r = skeleton.find_bone("ひじ.R")
	
	# Debug: Cetak tulang yang berhasil ditemukan
	var found = []
	if bone_center != -1: found.append("Center")
	if bone_upper_body != -1: found.append("UpperBody")
	if bone_lower_body != -1: found.append("LowerBody")
	if bone_leg_l != -1: found.append("Leg.L")
	if bone_leg_r != -1: found.append("Leg.R")
	if bone_knee_l != -1: found.append("Knee.L")
	if bone_knee_r != -1: found.append("Knee.R")
	if bone_arm_l != -1: found.append("Arm.L")
	if bone_arm_r != -1: found.append("Arm.R")
	print("🦴 Bones mapped: ", ", ".join(found))

# ============================================================
# INPUT HANDLING
# ============================================================

func _unhandled_input(event):
	if event is InputEventMouseMotion and Input.mouse_mode == Input.MOUSE_MODE_CAPTURED:
		rotate_y(-event.relative.x * sensitivity)
		pivot.rotate_x(-event.relative.y * sensitivity)
		pivot.rotation.x = clamp(pivot.rotation.x, deg_to_rad(-60), deg_to_rad(60))

# ============================================================
# PHYSICS & MOVEMENT
# ============================================================

func _physics_process(delta):
	# 1. Gravitasi
	if not is_on_floor():
		velocity.y -= gravity * delta

	# 2. Loncat (Space/Enter)
	if Input.is_action_just_pressed("ui_accept") and is_on_floor():
		velocity.y = jump_velocity

	# 3. Input Arah (WASD)
	var input_dir = Input.get_vector("ui_left", "ui_right", "ui_up", "ui_down")
	var direction = (transform.basis * Vector3(input_dir.x, 0, input_dir.y)).normalized()
	
	# Deteksi lari (Shift)
	var target_speed = speed
	if Input.is_action_pressed("ui_text_submit"):  # Shift
		target_speed = run_speed
	
	if direction:
		velocity.x = lerp(velocity.x, direction.x * target_speed, acceleration * delta)
		velocity.z = lerp(velocity.z, direction.z * target_speed, acceleration * delta)
		
		# Rotasi model ke arah jalan
		var target_look = atan2(-direction.x, -direction.z)
		model.rotation.y = lerp_angle(model.rotation.y, target_look, delta * 12)
		is_walking = true
	else:
		velocity.x = move_toward(velocity.x, 0, target_speed * delta * acceleration)
		velocity.z = move_toward(velocity.z, 0, target_speed * delta * acceleration)
		is_walking = false

	# 4. Move & Slide
	move_and_slide()
	
	# 5. Stair-Stepping (setelah move_and_slide)
	_handle_stairs(delta)
	
	# 6. Hitung kecepatan horizontal aktual
	current_speed = Vector2(velocity.x, velocity.z).length()
	
	# 7. Update Animasi Prosedural
	_update_procedural_animation(delta)

	# 8. Melepas Mouse (ESC)
	if Input.is_action_just_pressed("ui_cancel"):
		if Input.mouse_mode == Input.MOUSE_MODE_CAPTURED:
			Input.mouse_mode = Input.MOUSE_MODE_VISIBLE
		else:
			Input.mouse_mode = Input.MOUSE_MODE_CAPTURED

# ============================================================
# STAIR-STEPPING ALGORITHM
# ============================================================

func _handle_stairs(delta):
	if not is_on_floor():
		return
	if current_speed < 0.5:
		return
	
	# Arah horizontal pergerakan
	var horizontal_velocity = Vector3(velocity.x, 0, velocity.z)
	if horizontal_velocity.length() < 0.1:
		return
	
	var motion = horizontal_velocity.normalized() * 0.3  # Jarak tes ke depan
	
	# Tes 1: Apakah ada dinding/halangan di depan?
	var params_forward = PhysicsTestMotionParameters3D.new()
	params_forward.from = global_transform
	params_forward.motion = motion
	var result_forward = PhysicsTestMotionResult3D.new()
	
	var blocked = PhysicsServer3D.body_test_motion(get_rid(), params_forward, result_forward)
	
	if blocked:
		# Tes 2: Coba naik ke atas sebesar max_step_height, lalu maju
		var elevated_transform = global_transform
		elevated_transform.origin.y += max_step_height
		
		var params_up = PhysicsTestMotionParameters3D.new()
		params_up.from = elevated_transform
		params_up.motion = motion
		var result_up = PhysicsTestMotionResult3D.new()
		
		var blocked_up = PhysicsServer3D.body_test_motion(get_rid(), params_up, result_up)
		
		if not blocked_up:
			# Berhasil! Pindahkan karakter ke atas tangga
			global_position.y += max_step_height
			# Gravitasi akan menurunkan kita ke permukaan yang benar

# ============================================================
# PROCEDURAL ANIMATION (MMD BONES)
# ============================================================

func _update_procedural_animation(delta):
	if not skeleton:
		return
	
	if is_walking and current_speed > 0.3:
		# --- WALKING ANIMATION ---
		# Kecepatan langkah berdasarkan kecepatan jalan
		var speed_factor = clamp(current_speed / speed, 0.3, 1.5)
		walk_cycle_time += delta * leg_swing_speed * speed_factor
		
		var cycle = walk_cycle_time
		
		# 1. KAKI (Paha): Ayun maju-mundur bergantian
		if bone_leg_l != -1:
			var swing_l = sin(cycle) * leg_swing_amplitude * speed_factor
			skeleton.set_bone_pose_rotation(bone_leg_l, 
				Quaternion(Vector3.RIGHT, swing_l))
		
		if bone_leg_r != -1:
			var swing_r = sin(cycle + PI) * leg_swing_amplitude * speed_factor
			skeleton.set_bone_pose_rotation(bone_leg_r, 
				Quaternion(Vector3.RIGHT, swing_r))
		
		# 2. LUTUT: Tekuk saat kaki terangkat ke belakang
		if bone_knee_l != -1:
			var knee_bend_l = max(0, -sin(cycle)) * 0.5 * speed_factor
			skeleton.set_bone_pose_rotation(bone_knee_l, 
				Quaternion(Vector3.RIGHT, knee_bend_l))
		
		if bone_knee_r != -1:
			var knee_bend_r = max(0, -sin(cycle + PI)) * 0.5 * speed_factor
			skeleton.set_bone_pose_rotation(bone_knee_r, 
				Quaternion(Vector3.RIGHT, knee_bend_r))
		
		# 3. TANGAN: Ayun berlawanan dengan kaki
		if bone_arm_l != -1:
			var arm_swing_l = sin(cycle + PI) * arm_swing_amplitude * speed_factor
			skeleton.set_bone_pose_rotation(bone_arm_l, 
				Quaternion(Vector3.RIGHT, arm_swing_l))
		
		if bone_arm_r != -1:
			var arm_swing_r = sin(cycle) * arm_swing_amplitude * speed_factor
			skeleton.set_bone_pose_rotation(bone_arm_r, 
				Quaternion(Vector3.RIGHT, arm_swing_r))
		
		# 4. SIKU: Sedikit tekuk saat tangan berayun
		if bone_forearm_l != -1:
			var elbow_l = abs(sin(cycle + PI)) * 0.3 * speed_factor
			skeleton.set_bone_pose_rotation(bone_forearm_l,
				Quaternion(Vector3.RIGHT, -elbow_l))
		
		if bone_forearm_r != -1:
			var elbow_r = abs(sin(cycle)) * 0.3 * speed_factor
			skeleton.set_bone_pose_rotation(bone_forearm_r,
				Quaternion(Vector3.RIGHT, -elbow_r))
		
		# 5. PINGGUL (Lower Body): Goyang kiri-kanan
		if bone_lower_body != -1:
			var hip_sway = sin(cycle) * hip_sway_amplitude * speed_factor
			skeleton.set_bone_pose_rotation(bone_lower_body, 
				Quaternion(Vector3.FORWARD, hip_sway))
		
		# 6. BADAN ATAS: Sedikit condong maju + bouncing
		if bone_upper_body != -1:
			var bob = abs(sin(cycle * 2)) * body_bob_amplitude * speed_factor
			var lean = 0.05 * speed_factor  # Condong ke depan saat jalan
			skeleton.set_bone_pose_rotation(bone_upper_body, 
				Quaternion(Vector3.RIGHT, lean))
			skeleton.set_bone_pose_position(bone_upper_body, Vector3(0, bob, 0))
		
	else:
		# --- IDLE ANIMATION (Bernapas) ---
		walk_cycle_time = 0.0
		var time = Time.get_ticks_msec() * 0.001
		
		# 1. Nafas: Badan naik-turun pelan
		if bone_upper_body != -1:
			var breath = sin(time * breath_speed) * breath_amplitude
			skeleton.set_bone_pose_position(bone_upper_body, Vector3(0, breath, 0))
			skeleton.set_bone_pose_rotation(bone_upper_body, Quaternion.IDENTITY)
		
		# 2. Reset semua tulang ke posisi default
		_reset_bone(bone_leg_l)
		_reset_bone(bone_leg_r)
		_reset_bone(bone_knee_l)
		_reset_bone(bone_knee_r)
		_reset_bone(bone_arm_l)
		_reset_bone(bone_arm_r)
		_reset_bone(bone_forearm_l)
		_reset_bone(bone_forearm_r)
		_reset_bone(bone_lower_body)

func _reset_bone(bone_idx: int):
	if bone_idx != -1:
		skeleton.set_bone_pose_rotation(bone_idx, Quaternion.IDENTITY)
