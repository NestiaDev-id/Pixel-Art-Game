extends CharacterBody3D

@export var npc_name: String = "Student"
@export var idle_animation: String = "idle"

func _ready() -> void:
	# Rotasi random agar NPC tidak semua menghadap arah yang sama
	rotation.y = randf_range(0.0, TAU)
