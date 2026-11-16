extends CharacterBody3D

@export var walk_speed: float = 3.0
@export var run_speed: float = 6.0
@export var jump_velocity: float = 4.5
@export var rotation_speed: float = 10.0

var gravity: float = ProjectSettings.get_setting("physics/3d/default_gravity")
var current_speed: float = 0.0

@onready var model_pivot: Node3D = $ModelPivot

func _physics_process(delta: float) -> void:
	# Gravity
	if not is_on_floor():
		velocity.y -= gravity * delta
	
	# Jump
	if Input.is_action_just_pressed("jump") and is_on_floor():
		velocity.y = jump_velocity
	
	# Movement input
	var input_dir := Input.get_vector("move_left", "move_right", "move_forward", "move_backward")
	
	# Dapatkan arah berdasarkan kamera
	var cam := get_viewport().get_camera_3d()
	var cam_basis := cam.global_transform.basis if cam else Basis.IDENTITY
	var forward := -cam_basis.z
	forward.y = 0.0
	forward = forward.normalized()
	var right := cam_basis.x
	right.y = 0.0
	right = right.normalized()
	
	var direction := (forward * -input_dir.y + right * input_dir.x).normalized()
	
	# Sprint
	var speed := run_speed if Input.is_action_pressed("sprint") else walk_speed
	
	if direction:
		velocity.x = direction.x * speed
		velocity.z = direction.z * speed
		# Rotasi model ke arah gerakan
		var target_angle := atan2(direction.x, direction.z)
		model_pivot.rotation.y = lerp_angle(model_pivot.rotation.y, target_angle, rotation_speed * delta)
	else:
		velocity.x = move_toward(velocity.x, 0.0, speed * delta * 5.0)
		velocity.z = move_toward(velocity.z, 0.0, speed * delta * 5.0)
	
	move_and_slide()
