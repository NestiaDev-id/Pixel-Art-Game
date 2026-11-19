extends SpringArm3D

@export_group("Orbit & Sensitivity")
@export var mouse_sensitivity: float = 0.003
@export var min_pitch: float = deg_to_rad(-65.0)  # Menunduk melihat ke bawah
@export var max_pitch: float = deg_to_rad(35.0)   # Menengadah melihat ke atas

@export_group("Zoom")
@export var default_distance: float = 3.5
@export var min_distance: float = 1.2
@export var max_distance: float = 6.5
@export var zoom_step: float = 0.4
@export var zoom_smoothness: float = 15.0

var _target_distance: float = 3.5
var _rot_x: float = 0.0
var _rot_y: float = 0.0

func _ready() -> void:
	# Sembunyikan dan kunci kursor mouse ke dalam jendela game
	Input.mouse_mode = Input.MOUSE_MODE_CAPTURED
	
	_target_distance = default_distance
	spring_length = default_distance
	margin = 0.2
	collision_mask = 1  # Deteksi tabrakan dengan arsitektur sekolah (Layer 1)
	
	# Baca sudut pitch awal dari rotasi saat ini
	_rot_x = rotation.x
	_rot_y = rotation.y

func _process(delta: float) -> void:
	# Zoom halus (smooth interpolation)
	spring_length = lerp(spring_length, _target_distance, zoom_smoothness * delta)

func _unhandled_input(event: InputEvent) -> void:
	# 1. Rotasi Orbit Mouse (Yaw & Pitch)
	if event is InputEventMouseMotion and Input.mouse_mode == Input.MOUSE_MODE_CAPTURED:
		_rot_y -= event.relative.x * mouse_sensitivity
		_rot_x -= event.relative.y * mouse_sensitivity
		_rot_x = clamp(_rot_x, min_pitch, max_pitch)
		
		# Terapkan rotasi secara independen untuk mencegah gimbal roll
		rotation.y = _rot_y
		rotation.x = _rot_x
		rotation.z = 0.0
	
	# 2. Zoom Kamera (Mouse Wheel)
	if event is InputEventMouseButton and event.is_pressed():
		if event.button_index == MOUSE_BUTTON_WHEEL_UP:
			_target_distance = clamp(_target_distance - zoom_step, min_distance, max_distance)
		elif event.button_index == MOUSE_BUTTON_WHEEL_DOWN:
			_target_distance = clamp(_target_distance + zoom_step, min_distance, max_distance)
		elif event.button_index == MOUSE_BUTTON_LEFT and Input.mouse_mode == Input.MOUSE_MODE_VISIBLE:
			# Klik kiri untuk mengunci kembali kursor ke game
			Input.mouse_mode = Input.MOUSE_MODE_CAPTURED
	
	# 3. Toggle Mouse Capture (ESC / ui_cancel)
	if event.is_action_pressed("ui_cancel"):
		if Input.mouse_mode == Input.MOUSE_MODE_CAPTURED:
			Input.mouse_mode = Input.MOUSE_MODE_VISIBLE
		else:
			Input.mouse_mode = Input.MOUSE_MODE_CAPTURED
