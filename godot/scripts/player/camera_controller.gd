extends SpringArm3D

@export var mouse_sensitivity: float = 0.003
@export var min_pitch: float = deg_to_rad(-60.0)
@export var max_pitch: float = deg_to_rad(30.0)
@export var default_distance: float = 4.0
@export var zoom_speed: float = 0.5
@export var min_distance: float = 1.5
@export var max_distance: float = 8.0

func _ready() -> void:
	Input.mouse_mode = Input.MOUSE_MODE_CAPTURED
	spring_length = default_distance

func _unhandled_input(event: InputEvent) -> void:
	if event is InputEventMouseMotion:
		# Rotasi horizontal (yaw)
		rotate_y(-event.relative.x * mouse_sensitivity)
		# Rotasi vertikal (pitch)
		rotate_object_local(Vector3.RIGHT, -event.relative.y * mouse_sensitivity)
		rotation.x = clamp(rotation.x, min_pitch, max_pitch)
	
	if event is InputEventMouseButton:
		if event.button_index == MOUSE_BUTTON_WHEEL_UP:
			spring_length = max(min_distance, spring_length - zoom_speed)
		elif event.button_index == MOUSE_BUTTON_WHEEL_DOWN:
			spring_length = min(max_distance, spring_length + zoom_speed)
	
	if event.is_action_pressed("ui_cancel"):
		if Input.mouse_mode == Input.MOUSE_MODE_CAPTURED:
			Input.mouse_mode = Input.MOUSE_MODE_VISIBLE
		else:
			Input.mouse_mode = Input.MOUSE_MODE_CAPTURED
