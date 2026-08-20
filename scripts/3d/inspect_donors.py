"""List donor mesh names and rough world bounds (Blender Z-up)."""
from pathlib import Path
import bpy
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[2]
DONORS = ROOT / "assets" / "3d" / "donors"


def clear():
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)


def bbox(names):
    coords = []
    deps = bpy.context.evaluated_depsgraph_get()
    for name in names:
        o = bpy.data.objects[name]
        ev = o.evaluated_get(deps)
        for c in ev.bound_box:
            coords.append(ev.matrix_world @ Vector(c))
    xs, ys, zs = [c.x for c in coords], [c.y for c in coords], [c.z for c in coords]
    return (min(xs), min(ys), min(zs)), (max(xs), max(ys), max(zs))


def inspect(stem: str):
    path = DONORS / f"{stem}.glb"
    clear()
    before = {o.name for o in bpy.data.objects}
    bpy.ops.import_scene.gltf(filepath=str(path))
    imported = [n for n in (o.name for o in bpy.data.objects) if n not in before]
    meshes = [n for n in imported if bpy.data.objects[n].type == "MESH"]
    print(f"=== {stem} ({len(meshes)} meshes) ===")
    for name in meshes:
        o = bpy.data.objects[name]
        mn, mx = bbox([name])
        vol = max(mx[0] - mn[0], 1e-9) * max(mx[1] - mn[1], 1e-9) * max(mx[2] - mn[2], 1e-9)
        print(
            f"  {name}: verts={len(o.data.vertices)} "
            f"size=({mx[0]-mn[0]:.3f},{mx[1]-mn[1]:.3f},{mx[2]-mn[2]:.3f}) vol={vol:.4f}"
        )


for stem in ("suit-jacket", "double-breasted-blazer", "fashionable-waistcoat", "classic-suit"):
    inspect(stem)
