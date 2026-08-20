"""
Build public/models/suit-configurable-v3.glb from Sketchfab donor assets.
Blender Z-up → glTF Y-up on export.
"""

from __future__ import annotations

import math
import sys
from pathlib import Path

import bpy
from mathutils import Matrix, Vector

ROOT = Path(__file__).resolve().parents[2]
DONORS = ROOT / "assets" / "3d" / "donors"
OUT = ROOT / "public" / "models" / "suit-configurable-v3.glb"
# Proven Sketchfab full suit — used for JACKET_SINGLE_NOTCH (ExposedLeaf donor is unusable).
WEB_SUIT = ROOT / "public" / "models" / "suit-web-v2.glb"

JACKET_HEIGHT = 0.82
VEST_HEIGHT = 0.58
TROUSERS_HEIGHT = 1.02
# Intentionally overlap jacket hem over trouser waist so donor sleeve tips
# and side-rise differences do not open a visible gap.
TROUSERS_WAIST_Z = 1.08
JACKET_HEM_Z = 0.96
VEST_BOTTOM_Z = 1.02
CHEST_WIDTH = 0.58
# Central torso band used to ignore hanging sleeves / side vents when aligning hems.
TORSO_X_FRAC = 0.32
TORSO_Y_FRAC = 0.60


def log(msg: str) -> None:
    print(f"[modular-suit] {msg}")


def clear_scene() -> None:
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    for block in list(bpy.data.meshes):
        bpy.data.meshes.remove(block)


def find_donor(stem: str) -> Path | None:
    glb = DONORS / f"{stem}.glb"
    return glb if glb.is_file() else None


def import_gltf(path: Path) -> list[str]:
    before = {obj.name for obj in bpy.data.objects}
    bpy.ops.import_scene.gltf(filepath=str(path))
    return [name for name in (obj.name for obj in bpy.data.objects) if name not in before]


def obj(name: str) -> bpy.types.Object:
    return bpy.data.objects[name]


def world_bbox_names(names: list[str]) -> tuple[Vector, Vector]:
    coords: list[Vector] = []
    depsgraph = bpy.context.evaluated_depsgraph_get()
    for name in names:
        o = obj(name)
        ev = o.evaluated_get(depsgraph)
        for corner in ev.bound_box:
            coords.append(ev.matrix_world @ Vector(corner))
    xs = [c.x for c in coords]
    ys = [c.y for c in coords]
    zs = [c.z for c in coords]
    return Vector((min(xs), min(ys), min(zs))), Vector((max(xs), max(ys), max(zs)))


def bake_mesh(name: str) -> None:
    o = obj(name)
    if o.type != "MESH":
        return
    mw = o.matrix_world.copy()
    o.parent = None
    o.matrix_world = Matrix.Identity(4)
    mesh = o.data
    mesh.transform(mw)
    mesh.update()
    o.location = (0, 0, 0)
    o.rotation_euler = (0, 0, 0)
    o.scale = (1, 1, 1)


def delete_names(names: list[str]) -> None:
    bpy.ops.object.select_all(action="DESELECT")
    for name in names:
        if name in bpy.data.objects:
            bpy.data.objects[name].select_set(True)
    if bpy.context.selected_objects:
        bpy.ops.object.delete()


def mesh_volume(name: str) -> float:
    mn, mx = world_bbox_names([name])
    return max(mx.x - mn.x, 1e-9) * max(mx.y - mn.y, 1e-9) * max(mx.z - mn.z, 1e-9)


def join_names(names: list[str], semantic: str) -> str:
    for name in names:
        bake_mesh(name)
    bpy.ops.object.select_all(action="DESELECT")
    for name in names:
        o = obj(name)
        o.select_set(True)
    bpy.context.view_layer.objects.active = obj(names[0])
    if len(names) > 1:
        bpy.ops.object.join()
    active = bpy.context.view_layer.objects.active
    active.name = semantic
    active.data.name = semantic
    bake_mesh(semantic)
    return semantic


def assign_fabric(name: str) -> None:
    mat = bpy.data.materials.get("FABRIC_MAIN")
    if mat is None:
        mat = bpy.data.materials.new("FABRIC_MAIN")
    o = obj(name)
    o.data.materials.clear()
    o.data.materials.append(mat)


def mesh_world_verts(name: str) -> list[Vector]:
    o = obj(name)
    mw = o.matrix_world
    return [mw @ v.co for v in o.data.vertices]


def torso_band_z(
    name: str,
    *,
    mode: str,
) -> float:
    """Hem/waist from central torso verts so sleeve cuffs don't dominate bbox.min."""
    mn, mx = world_bbox_names([name])
    cx = 0.5 * (mn.x + mx.x)
    cy = 0.5 * (mn.y + mx.y)
    half_w = max(mx.x - mn.x, 1e-9) * 0.5
    half_d = max(mx.y - mn.y, 1e-9) * 0.5
    x_lim = half_w * TORSO_X_FRAC
    y_lim = half_d * TORSO_Y_FRAC
    zs = [
        v.z
        for v in mesh_world_verts(name)
        if abs(v.x - cx) <= x_lim and abs(v.y - cy) <= y_lim
    ]
    if not zs:
        return mn.z if mode == "min" else mx.z
    return min(zs) if mode == "min" else max(zs)


def torso_band_xy_extents(name: str) -> tuple[float, float]:
    """Width/depth from a mid-torso slab so outstretched arms do not inflate width."""
    mn, mx = world_bbox_names([name])
    z0 = mn.z + (mx.z - mn.z) * 0.45
    z1 = mn.z + (mx.z - mn.z) * 0.70
    cy = 0.5 * (mn.y + mx.y)
    half_d = max(mx.y - mn.y, 1e-9) * 0.5
    y_lim = half_d * TORSO_Y_FRAC
    xs: list[float] = []
    ys: list[float] = []
    for v in mesh_world_verts(name):
        if z0 <= v.z <= z1 and abs(v.y - cy) <= y_lim:
            xs.append(v.x)
            ys.append(v.y)
    if len(xs) < 8:
        return max(mx.x - mn.x, 1e-9), max(mx.y - mn.y, 1e-9)
    return max(xs) - min(xs), max(ys) - min(ys)


def normalize(
    name: str,
    *,
    target_height: float,
    align_z: float,
    target_width: float | None,
    align: str = "bbox_min",
    width_mode: str = "bbox",
) -> None:
    o = obj(name)
    bpy.context.view_layer.update()
    mn, mx = world_bbox_names([name])
    height = max(mx.z - mn.z, 1e-9)

    # Uniform scale to target height first
    scale = target_height / height
    mesh = o.data
    mesh.transform(Matrix.Scale(scale, 4))
    mesh.update()
    bpy.context.view_layer.update()

    # Match chest width. Prefer torso slab so T-pose arms are not crushed.
    if target_width is not None:
        if width_mode == "torso":
            width, _depth = torso_band_xy_extents(name)
        else:
            mn, mx = world_bbox_names([name])
            width = max(mx.x - mn.x, 1e-9)
        sx = target_width / max(width, 1e-9)
        # Scale X only from torso width; keep depth from the height pass.
        mesh.transform(Matrix.Diagonal((sx, 1.0, 1.0, 1.0)))
        mesh.update()
        bpy.context.view_layer.update()

    mn, mx = world_bbox_names([name])
    dx = -0.5 * (mn.x + mx.x)
    dy = -0.5 * (mn.y + mx.y)
    if align == "torso_hem":
        ref_z = torso_band_z(name, mode="min")
    elif align == "torso_waist":
        ref_z = torso_band_z(name, mode="max")
    elif align == "bbox_max":
        ref_z = mx.z
    else:
        ref_z = mn.z
    dz = align_z - ref_z
    mesh.transform(Matrix.Translation(Vector((dx, dy, dz))))
    mesh.update()
    bpy.context.view_layer.update()
    mn, mx = world_bbox_names([name])
    hem = torso_band_z(name, mode="min") if align.startswith("torso") else mn.z
    waist = torso_band_z(name, mode="max") if align.startswith("torso") else mx.z
    torso_w, torso_d = torso_band_xy_extents(name)
    log(
        f"  {name}: z=[{mn.z:.3f},{mx.z:.3f}] h={mx.z-mn.z:.3f} "
        f"w={mx.x-mn.x:.3f} d={mx.y-mn.y:.3f} "
        f"torso_w={torso_w:.3f} torso_hem={hem:.3f} torso_waist={waist:.3f} "
        f"align={align} width_mode={width_mode}"
    )


def prepare(
    stem: str,
    semantic: str,
    *,
    target_height: float,
    align_z: float,
    target_width: float | None,
    keep: list[str] | None = None,
    largest_only: bool = False,
    align: str = "bbox_min",
    width_mode: str = "bbox",
) -> None:
    path = find_donor(stem)
    if path is None:
        raise RuntimeError(f"Missing {stem}")
    log(f"Import {stem}")
    imported = import_gltf(path)
    mesh_names = [n for n in imported if n in bpy.data.objects and obj(n).type == "MESH"]
    # Drop empties / non-mesh
    delete_names([n for n in imported if n in bpy.data.objects and obj(n).type != "MESH"])

    selected = mesh_names
    if keep:
        selected = [n for n in mesh_names if any(token in n.lower() for token in keep)]
        if not selected:
            selected = mesh_names
    if largest_only and selected:
        selected = [max(selected, key=mesh_volume)]

    # Delete non-selected meshes from this import
    delete_names([n for n in mesh_names if n not in selected and n in bpy.data.objects])
    selected = [n for n in selected if n in bpy.data.objects]
    join_names(selected, semantic)
    normalize(
        semantic,
        target_height=target_height,
        align_z=align_z,
        target_width=target_width,
        align=align,
        width_mode=width_mode,
    )
    assign_fabric(semantic)


def convert_imported_y_up_to_z_up(names: list[str]) -> None:
    """Some glTF imports keep Y-up; the rest of this pipeline assumes Blender Z-up."""
    mesh_names = [n for n in names if n in bpy.data.objects and obj(n).type == "MESH"]
    if not mesh_names:
        return
    mn, mx = world_bbox_names(mesh_names)
    if (mx.y - mn.y) <= (mx.z - mn.z) * 1.05:
        return
    log("  reorient Y-up → Z-up (-90° X)")
    rot = Matrix.Rotation(math.radians(-90.0), 4, "X")
    for name in mesh_names:
        o = obj(name)
        mw = o.matrix_world.copy()
        o.parent = None
        o.matrix_world = Matrix.Identity(4)
        o.data.transform(rot @ mw)
        o.data.update()
        o.location = (0, 0, 0)
        o.rotation_euler = (0, 0, 0)
        o.scale = (1, 1, 1)
    bpy.context.view_layer.update()


def prepare_single_jacket_from_web_suit() -> None:
    """Extract upper-body cloth from suit-web-v2 (good Sketchfab suit)."""
    if not WEB_SUIT.is_file():
        raise RuntimeError(f"Missing {WEB_SUIT}")
    log(f"Import web suit jacket from {WEB_SUIT.name}")
    imported = import_gltf(WEB_SUIT)
    mesh_names = [n for n in imported if n in bpy.data.objects and obj(n).type == "MESH"]
    delete_names([n for n in imported if n in bpy.data.objects and obj(n).type != "MESH"])
    convert_imported_y_up_to_z_up(mesh_names)

    selected: list[str] = []
    for name in mesh_names:
        if name not in bpy.data.objects:
            continue
        o = obj(name)
        mats = " ".join(
            (slot.material.name if slot.material else slot.name) for slot in o.material_slots
        ).lower()
        if "button" in mats or "button" in name.lower():
            continue
        # Cloth body only — blinn* islands in this GLB are tiny metal/plastic discs.
        if "uniform" not in mats:
            continue
        mn, mx = world_bbox_names([name])
        height = mx.z - mn.z
        # Upper garment island: starts above the shoes, not a full-body tall piece.
        if mn.z > 700 and 50 < height < 900:
            selected.append(name)

    if not selected:
        raise RuntimeError("No upper-body meshes found in suit-web-v2")

    delete_names([n for n in mesh_names if n not in selected and n in bpy.data.objects])
    selected = [n for n in selected if n in bpy.data.objects]
    log(f"  web jacket parts: {len(selected)}")
    join_names(selected, "JACKET_SINGLE_NOTCH")
    normalize(
        "JACKET_SINGLE_NOTCH",
        target_height=JACKET_HEIGHT,
        align_z=JACKET_HEM_Z,
        target_width=CHEST_WIDTH,
        align="torso_hem",
        width_mode="torso",
    )
    assign_fabric("JACKET_SINGLE_NOTCH")


def export_glb() -> None:
    bpy.ops.object.select_all(action="DESELECT")
    for name in ("JACKET_SINGLE_NOTCH", "JACKET_DOUBLE_PEAK", "VEST_SINGLE", "TROUSERS_CLASSIC"):
        if name in bpy.data.objects:
            obj(name).select_set(True)
    bpy.ops.export_scene.gltf(
        filepath=str(OUT),
        export_format="GLB",
        use_selection=True,
        export_apply=True,
        export_yup=True,
    )
    log(f"Wrote {OUT} ({OUT.stat().st_size} bytes)")


def main() -> int:
    clear_scene()
    # Do NOT use assets/3d/donors/suit-jacket.glb — it collapses into a stick torso.
    prepare_single_jacket_from_web_suit()
    prepare(
        "double-breasted-blazer",
        "JACKET_DOUBLE_PEAK",
        target_height=JACKET_HEIGHT,
        align_z=JACKET_HEM_Z,
        target_width=CHEST_WIDTH,
        keep=["black_cloth"],
        largest_only=True,
        align="torso_hem",
        width_mode="torso",
    )
    # Prefer vest from the same classic-suit donor as trousers (matched proportions).
    if find_donor("classic-suit"):
        prepare(
            "classic-suit",
            "VEST_SINGLE",
            target_height=VEST_HEIGHT,
            align_z=VEST_BOTTOM_Z,
            target_width=CHEST_WIDTH * 0.92,
            keep=["vest"],
            largest_only=True,
            align="bbox_min",
            width_mode="torso",
        )
    else:
        prepare(
            "fashionable-waistcoat",
            "VEST_SINGLE",
            target_height=VEST_HEIGHT,
            align_z=VEST_BOTTOM_Z,
            target_width=CHEST_WIDTH * 0.90,
            largest_only=True,
            align="torso_hem",
            width_mode="torso",
        )
    if find_donor("classic-suit"):
        prepare(
            "classic-suit",
            "TROUSERS_CLASSIC",
            target_height=TROUSERS_HEIGHT,
            align_z=TROUSERS_WAIST_Z,
            target_width=0.46,
            keep=["trouser"],
            align="bbox_max",
            width_mode="bbox",
        )
    export_glb()
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:  # noqa: BLE001
        log(f"FAILED: {exc}")
        import traceback

        traceback.print_exc()
        raise SystemExit(1) from exc
