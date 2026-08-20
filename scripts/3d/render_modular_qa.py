"""Render orthographic QA frames of suit-configurable-v3.glb with light bg."""
from pathlib import Path
import bpy
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[2]
GLB = ROOT / "public" / "models" / "suit-configurable-v3.glb"
OUT = ROOT / "artifacts" / "modular-3d"
OUT.mkdir(parents=True, exist_ok=True)

# Clear
bpy.ops.object.select_all(action="SELECT")
bpy.ops.object.delete(use_global=False)
bpy.ops.import_scene.gltf(filepath=str(GLB))

# World / light
world = bpy.data.worlds.new("QAWorld")
bpy.context.scene.world = world
world.use_nodes = True
bg = world.node_tree.nodes["Background"]
bg.inputs[0].default_value = (0.85, 0.86, 0.88, 1)
bg.inputs[1].default_value = 1.0

bpy.ops.object.light_add(type="AREA", location=(2.2, -2.5, 2.8))
light = bpy.context.object
light.data.energy = 250
light.data.size = 4
bpy.ops.object.light_add(type="AREA", location=(-2.0, 1.5, 2.0))
fill = bpy.context.object
fill.data.energy = 80
fill.data.size = 3

# Simple clay material
mat = bpy.data.materials.new("CLAY")
mat.use_nodes = True
bsdf = mat.node_tree.nodes.get("Principled BSDF")
if bsdf:
    bsdf.inputs["Base Color"].default_value = (0.18, 0.22, 0.28, 1)
    bsdf.inputs["Roughness"].default_value = 0.55

for obj in bpy.data.objects:
    if obj.type == "MESH":
        obj.data.materials.clear()
        obj.data.materials.append(mat)

# Camera
bpy.ops.object.camera_add(location=(0, -3.4, 0.95))
cam = bpy.context.object
cam.data.type = "ORTHO"
cam.data.ortho_scale = 2.2
cam.rotation_euler = (1.5708, 0, 0)
bpy.context.scene.camera = cam

scene = bpy.context.scene
scene.render.engine = "BLENDER_EEVEE_NEXT" if "BLENDER_EEVEE_NEXT" in dir(bpy.types) else "BLENDER_EEVEE"
scene.render.resolution_x = 900
scene.render.resolution_y = 1200
scene.render.film_transparent = False
scene.render.image_settings.file_format = "PNG"


def set_visible(active: set[str]) -> None:
    for obj in bpy.data.objects:
        if obj.type == "MESH":
            obj.hide_render = obj.name not in active
            obj.hide_viewport = obj.name not in active


def render(name: str, active: set[str]) -> None:
    set_visible(active)
    scene.render.filepath = str(OUT / name)
    bpy.ops.render.render(write_still=True)
    print(f"wrote {scene.render.filepath}")


render("offline-01-single.png", {"JACKET_SINGLE_NOTCH", "TROUSERS_CLASSIC"})
render("offline-02-double.png", {"JACKET_DOUBLE_PEAK", "TROUSERS_CLASSIC"})
render("offline-03-vest.png", {"JACKET_DOUBLE_PEAK", "VEST_SINGLE", "TROUSERS_CLASSIC"})
render("offline-04-vest-only.png", {"VEST_SINGLE", "TROUSERS_CLASSIC"})
