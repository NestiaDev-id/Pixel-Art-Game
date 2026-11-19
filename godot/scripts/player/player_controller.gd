extends CharacterBody3D

@export_group("Movement")
@export var walk_speed: float = 3.0
@export var run_speed: float = 6.0
@export var acceleration: float = 25.0
@export var deceleration: float = 30.0
@export var rotation_speed: float = 12.0

@export_group("Jump & Gravity")
@export var jump_velocity: float = 4.5
@export var gravity_multiplier: float = 1.0

# Node references
@onready var model_pivot: Node3D = $ModelPivot
@onready var collision_shape: CollisionShape3D = $CollisionShape3D
@onready var camera_arm: SpringArm3D = get_node_or_null("CameraArm")

# Physics properties
var gravity: float = ProjectSettings.get_setting("physics/3d/default_gravity", 9.8)
var current_speed: float = 0.0
var is_sprinting: bool = false

func _ready() -> void:
	# Konfigurasi floor snapping agar perpindahan di tangga sekolah (20 cm) mulus
	floor_snap_length = 0.3
	floor_constant_speed = true
	floor_stop_on_slope = true
	floor_max_angle = deg_to_rad(50.0)

func _physics_process(delta: float) -> void:
	# 1. Terapkan Gravitasi Jolt Physics (9.8 m/s^2)
	if not is_on_floor():
		velocity.y -= gravity * gravity_multiplier * delta
	else:
		# Reset momentum vertikal saat menapak lantai
		if velocity.y < 0:
			velocity.y = -0.1
	
	# 2. Input Lompat
	if Input.is_action_just_pressed("jump") and is_on_floor():
		velocity.y = jump_velocity
	
	# 3. Input Arah Gerakan
	var input_dir := Input.get_vector("move_left", "move_right", "move_forward", "move_backward")
	is_sprinting = Input.is_action_pressed("sprint")
	var target_speed := run_speed if is_sprinting else walk_speed
	
	# 4. Proyeksikan Arah Gerak Relatif terhadap Orientasi Kamera (Third-Person)
	var direction := Vector3.ZERO
	var cam := get_viewport().get_camera_3d()
	if cam:
		var cam_basis := cam.global_transform.basis
		var forward := -cam_basis.z
		forward.y = 0.0
		forward = forward.normalized()
		var right := cam_basis.x
		right.y = 0.0
		right = right.normalized()
		direction = (forward * -input_dir.y + right * input_dir.x).normalized()
	else:
		# Fallback jika kamera belum aktif
		direction = Vector3(input_dir.x, 0.0, input_dir.y).normalized()
	
	# 5. Akselerasi / Deselerasi Halus (Smooth Interpolation)
	if direction.length_squared() > 0.001:
		velocity.x = move_toward(velocity.x, direction.x * target_speed, acceleration * delta)
		velocity.z = move_toward(velocity.z, direction.z * target_speed, acceleration * delta)
		
		# Rotasi model karakter menghadap arah pergerakan
		var target_angle := atan2(direction.x, direction.z)
		model_pivot.rotation.y = lerp_angle(model_pivot.rotation.y, target_angle, rotation_speed * delta)
	else:
		velocity.x = move_toward(velocity.x, 0.0, deceleration * delta)
		velocity.z = move_toward(velocity.z, 0.0, deceleration * delta)
	
	# Simpan kecepatan horizontal saat ini (siap dihubungkan ke AnimationTree di Tahap 7)
	current_speed = Vector2(velocity.x, velocity.z).length()
	
	# 6. Eksekusi Gerakan Karakter
	move_and_slide()
