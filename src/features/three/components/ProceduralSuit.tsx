import React, { useMemo } from "react";
import * as THREE from "three";
import type { SuitVisualState } from "../model/suit-model-types";
import type { SuitMaterialsMap } from "../materials/useFabricMaterial";

interface ProceduralSuitProps {
  visualState: SuitVisualState;
  materials: SuitMaterialsMap;
}

export function ProceduralSuit({ visualState, materials }: ProceduralSuitProps) {
  const { fabricMaterial, buttonMaterial, feltMaterial } = materials;

  // 1. Torso Geometry: Single-breasted vs Double-breasted
  const isDoubleBreasted = visualState.jacket === "double";

  // Tailored Torso profile
  const torsoGeom = useMemo(() => {
    // High-segment cylinder to allow vertex deformation
    const geom = new THREE.CylinderGeometry(0.35, 0.36, 0.88, 32, 16, false);
    geom.scale(1.18, 1, 0.82); 
    
    // Deform vertices for tailored fit (chest swell, waist suppression, skirt flare)
    const pos = geom.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i);
      const x = pos.getX(i);
      const z = pos.getZ(i);
      
      // Normalized height from -1 (bottom) to +1 (top)
      const ny = y / 0.44; 
      
      let scaleX = 1.0;
      let scaleZ = 1.0;
      
      // Waist suppression (around ny = -0.3)
      if (ny > -0.7 && ny < 0.5) {
        const waistFactor = Math.cos((ny + 0.1) * Math.PI) * 0.5 + 0.5;
        scaleX -= waistFactor * 0.12;
        scaleZ -= waistFactor * 0.15;
      }
      
      // Chest swell
      if (ny > 0.2 && z > 0) {
        scaleZ += (ny - 0.2) * 0.15;
      }
      
      // Shoulders broadness
      if (ny > 0.5) {
        scaleX += (ny - 0.5) * 0.1;
      }

      pos.setXYZ(i, x * scaleX, y, z * scaleZ);
    }
    geom.computeVertexNormals();
    return geom;
  }, []);

  // Sleeves with natural arm pitch and elbow curve
  const sleeveLGeom = useMemo(() => {
    const geom = new THREE.CylinderGeometry(0.13, 0.10, 0.74, 24, 12);
    const pos = geom.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i);
      const z = pos.getZ(i);
      // Curve elbow slightly forward
      const ny = y / 0.37;
      const curve = Math.sin((ny + 1) * Math.PI * 0.5) * 0.04;
      pos.setZ(i, z + curve);
    }
    geom.computeVertexNormals();
    return geom;
  }, []);

  const sleeveRGeom = useMemo(() => {
    const geom = new THREE.CylinderGeometry(0.13, 0.10, 0.74, 24, 12);
    const pos = geom.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i);
      const z = pos.getZ(i);
      const ny = y / 0.37;
      const curve = Math.sin((ny + 1) * Math.PI * 0.5) * 0.04;
      pos.setZ(i, z + curve);
    }
    geom.computeVertexNormals();
    return geom;
  }, []);

  // Collar Base
  const collarGeom = useMemo(() => {
    const geom = new THREE.TorusGeometry(0.16, 0.04, 16, 32, Math.PI);
    geom.rotateX(Math.PI / 2);
    geom.scale(1.1, 0.9, 1);
    return geom;
  }, []);

  // Trousers Base Geometry (Left & Right legs)
  const legGeom = useMemo(() => {
    const geom = new THREE.CylinderGeometry(0.15, 0.10, 1.0, 24, 16);
    const pos = geom.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = pos.getZ(i);
      
      const ny = y / 0.5; // -1 to 1
      let scaleX = 1.0;
      let scaleZ = 1.0;
      let zOffset = 0;
      
      // Thigh fullness
      if (ny > 0) {
        scaleX += ny * 0.15;
        scaleZ += ny * 0.2;
      }
      
      // Knee bend / drape
      if (ny < 0.2 && ny > -0.5) {
        zOffset = Math.sin((ny + 0.5) * Math.PI) * 0.03;
      }
      
      // Ankle taper
      if (ny < -0.6) {
        scaleX -= (ny + 0.6) * 0.05;
      }
      
      // Front crease pinch
      if (z > 0 && Math.abs(x) < 0.05) {
        scaleZ += 0.05;
      }

      pos.setXYZ(i, x * scaleX, y, z * scaleZ + zOffset);
    }
    geom.computeVertexNormals();
    return geom;
  }, []);

  // Mannequin Head/Neck Finial
  const neckFinialGeom = useMemo(() => {
    return new THREE.CylinderGeometry(0.09, 0.11, 0.22, 24);
  }, []);

  const standBaseGeom = useMemo(() => {
    return new THREE.CylinderGeometry(0.28, 0.32, 0.06, 32);
  }, []);

  const standPoleGeom = useMemo(() => {
    return new THREE.CylinderGeometry(0.02, 0.02, 2.2, 16);
  }, []);

  // Organic Lapel Geometries
  const notchLapelLGeom = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0.16); // top near collar
    shape.quadraticCurveTo(0.08, 0.12, 0.08, 0.06); // top edge
    shape.lineTo(0.02, 0.04); // notch step in
    shape.lineTo(0.09, 0.02); // notch step out
    shape.quadraticCurveTo(0.06, -0.15, -0.04, -0.22); // curve down to button
    shape.lineTo(-0.06, -0.22); // bottom inner
    shape.quadraticCurveTo(-0.04, 0, 0, 0.16); // inner edge back to top
    const geom = new THREE.ExtrudeGeometry(shape, { depth: 0.015, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: 0.004, bevelThickness: 0.004 });
    geom.center();
    return geom;
  }, []);
  const notchLapelRGeom = useMemo(() => { const g = notchLapelLGeom.clone(); g.scale(-1, 1, 1); return g; }, [notchLapelLGeom]);

  const peakLapelLGeom = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0.18); 
    shape.quadraticCurveTo(0.06, 0.14, 0.06, 0.08); 
    shape.lineTo(0.03, 0.05); 
    shape.quadraticCurveTo(0.12, 0.1, 0.14, 0.12); // peak points up and out
    shape.quadraticCurveTo(0.08, -0.1, -0.04, -0.24); // swoop down to button
    shape.lineTo(-0.06, -0.24); 
    shape.quadraticCurveTo(-0.04, 0, 0, 0.18); 
    const geom = new THREE.ExtrudeGeometry(shape, { depth: 0.015, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: 0.004, bevelThickness: 0.004 });
    geom.center();
    return geom;
  }, []);
  const peakLapelRGeom = useMemo(() => { const g = peakLapelLGeom.clone(); g.scale(-1, 1, 1); return g; }, [peakLapelLGeom]);

  const shawlLapelLGeom = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0.18); 
    shape.quadraticCurveTo(0.12, 0.1, 0.08, -0.05); // smooth continuous outer curve
    shape.quadraticCurveTo(0.04, -0.15, -0.04, -0.24); 
    shape.lineTo(-0.06, -0.24); 
    shape.quadraticCurveTo(-0.04, 0, 0, 0.18); 
    const geom = new THREE.ExtrudeGeometry(shape, { depth: 0.015, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: 0.004, bevelThickness: 0.004 });
    geom.center();
    return geom;
  }, []);
  const shawlLapelRGeom = useMemo(() => { const g = shawlLapelLGeom.clone(); g.scale(-1, 1, 1); return g; }, [shawlLapelLGeom]);
  const frontPlateGeom = useMemo(() => {
    const isDouble = visualState.jacket === "double";
    const width = isDouble ? 0.38 : 0.32;
    const height = 0.76;
    const depth = isDouble ? 0.04 : 0.03;
    
    // High segments to allow bending
    const geom = new THREE.BoxGeometry(width, height, depth, 16, 16, 2);
    const pos = geom.attributes.position;
    
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      let z = pos.getZ(i);
      
      // Bend the plate around the chest
      const ny = y / (height / 2);
      const nx = x / (width / 2);
      
      // Curve horizontally around chest
      const zOffset = (1 - Math.cos(nx * Math.PI * 0.25)) * 0.08;
      
      // Taper at the waist
      let scaleX = 1.0;
      if (ny < 0.4 && ny > -0.6) {
        scaleX -= Math.cos((ny + 0.1) * Math.PI) * 0.08;
      }
      
      // Bottom edge rounding (cutaway)
      if (ny < -0.8 && !isDouble) {
        const cutaway = Math.max(0, Math.abs(nx) - 0.5) * 0.1;
        z -= cutaway;
      }
      
      pos.setXYZ(i, x * scaleX, y, z - zOffset);
    }
    geom.computeVertexNormals();
    return geom;
  }, [visualState.jacket]);

  return (
    <group position={[0, 0, 0]}>
      {/* 1. Mannequin Stand & Pedestal */}
      <group position={[0, -0.1, 0]}>
        {/* Neck Finial */}
        <mesh position={[0, 1.44, 0]} geometry={neckFinialGeom} material={feltMaterial} castShadow />
        {/* Stand Pole */}
        <mesh position={[0, 0.2, 0]} geometry={standPoleGeom} material={buttonMaterial} />
        {/* Stand Base */}
        <mesh position={[0, -0.98, 0]} geometry={standBaseGeom} material={buttonMaterial} receiveShadow />
      </group>

      {/* 2. Vest Layer (under jacket) */}
      {visualState.vest !== "none" && (
        <group position={[0, 0.88, 0.02]}>
          <mesh material={fabricMaterial} castShadow>
            <cylinderGeometry args={[0.31, 0.29, 0.58, 24]} />
          </mesh>
          {/* Vest Front Buttons */}
          <group position={[0, 0, 0.23]}>
            {[-0.18, -0.09, 0.0, 0.09, 0.18].map((y, idx) => (
              <mesh
                key={idx}
                position={[0, y, 0]}
                rotation={[Math.PI / 2, 0, 0]}
                material={buttonMaterial}
              >
                <cylinderGeometry args={[0.012, 0.012, 0.008, 16]} />
              </mesh>
            ))}
          </group>
        </group>
      )}

      {/* 3. Jacket Main Body */}
      <group position={[0, 0.86, 0]}>
        <mesh
          geometry={torsoGeom}
          material={fabricMaterial}
          castShadow
          receiveShadow
          position={[0, 0, 0]}
        />

        {/* Collar Stand */}
        <mesh
          geometry={collarGeom}
          material={fabricMaterial}
          position={[0, 0.44, -0.02]}
          castShadow
        />

        {/* Single vs Double Breasted Front Closure Plate */}
        <mesh position={[0, -0.05, 0.22]} material={fabricMaterial} castShadow geometry={frontPlateGeom} />

        {/* 4. Lapels */}
        <group position={[0, 0.22, 0.24]}>
          {visualState.lapel === "notch" && (
            <>
              {/* Left Notch Lapel */}
              <group position={[-0.09, 0.05, 0]} rotation={[0.1, -0.2, 0.2]}>
                <mesh geometry={notchLapelLGeom} material={fabricMaterial} castShadow />
              </group>
              {/* Right Notch Lapel */}
              <group position={[0.09, 0.05, 0]} rotation={[0.1, 0.2, -0.2]}>
                <mesh geometry={notchLapelRGeom} material={fabricMaterial} castShadow />
              </group>
            </>
          )}

          {visualState.lapel === "peak" && (
            <>
              {/* Left Peak Lapel */}
              <group position={[-0.10, 0.05, 0]} rotation={[0.1, -0.2, 0.2]}>
                <mesh geometry={peakLapelLGeom} material={fabricMaterial} castShadow />
              </group>
              {/* Right Peak Lapel */}
              <group position={[0.10, 0.05, 0]} rotation={[0.1, 0.2, -0.2]}>
                <mesh geometry={peakLapelRGeom} material={fabricMaterial} castShadow />
              </group>
            </>
          )}

          {visualState.lapel === "shawl" && (
            <>
              {/* Left Shawl Lapel */}
              <group position={[-0.08, 0.05, 0]} rotation={[0.1, -0.2, 0.2]}>
                <mesh geometry={shawlLapelLGeom} material={fabricMaterial} castShadow />
              </group>
              {/* Right Shawl Lapel */}
              <group position={[0.08, 0.05, 0]} rotation={[0.1, 0.2, -0.2]}>
                <mesh geometry={shawlLapelRGeom} material={fabricMaterial} castShadow />
              </group>
            </>
          )}
        </group>

        {/* 5. Chest Welt Pocket (Barchetta) */}
        <group position={[-0.15, 0.18, 0.23]} rotation={[0, 0, 0.06]}>
          <mesh material={fabricMaterial} castShadow>
            <boxGeometry args={[0.10, 0.022, 0.015]} />
          </mesh>
        </group>

        {/* 6. Lower Pockets */}
        <group position={[0, -0.22, 0.22]}>
          {visualState.pockets === "flap" && (
            <>
              {/* Left Flap */}
              <mesh position={[-0.18, 0, 0]} rotation={[0.1, 0, 0.04]} material={fabricMaterial} castShadow>
                <boxGeometry args={[0.14, 0.05, 0.02]} />
              </mesh>
              {/* Right Flap */}
              <mesh position={[0.18, 0, 0]} rotation={[0.1, 0, -0.04]} material={fabricMaterial} castShadow>
                <boxGeometry args={[0.14, 0.05, 0.02]} />
              </mesh>
            </>
          )}

          {visualState.pockets === "jetted" && (
            <>
              {/* Left Jetted Welt */}
              <mesh position={[-0.18, 0, 0]} material={fabricMaterial} castShadow>
                <boxGeometry args={[0.13, 0.016, 0.008]} />
              </mesh>
              {/* Right Jetted Welt */}
              <mesh position={[0.18, 0, 0]} material={fabricMaterial} castShadow>
                <boxGeometry args={[0.13, 0.016, 0.008]} />
              </mesh>
            </>
          )}

          {visualState.pockets === "patch" && (
            <>
              {/* Left Rounded Patch Pocket */}
              <mesh position={[-0.18, -0.04, 0.01]} material={fabricMaterial} castShadow>
                <boxGeometry args={[0.15, 0.17, 0.025]} />
              </mesh>
              {/* Right Rounded Patch Pocket */}
              <mesh position={[0.18, -0.04, 0.01]} material={fabricMaterial} castShadow>
                <boxGeometry args={[0.15, 0.17, 0.025]} />
              </mesh>
            </>
          )}
        </group>

        {/* 7. Front Buttons Layout */}
        <group position={[0, 0, 0.24]}>
          {isDoubleBreasted ? (
            // 6x2 Double Breasted Matrix
            <group position={[0, -0.06, 0]}>
              {[-0.09, 0.0, 0.09].map((y, rIdx) => (
                <React.Fragment key={rIdx}>
                  <mesh
                    position={[-0.085, y, 0]}
                    rotation={[Math.PI / 2, 0, 0]}
                    material={buttonMaterial}
                    castShadow
                  >
                    <cylinderGeometry args={[0.016, 0.016, 0.012, 16]} />
                  </mesh>
                  <mesh
                    position={[0.085, y, 0]}
                    rotation={[Math.PI / 2, 0, 0]}
                    material={buttonMaterial}
                    castShadow
                  >
                    <cylinderGeometry args={[0.016, 0.016, 0.012, 16]} />
                  </mesh>
                </React.Fragment>
              ))}
            </group>
          ) : (
            // Single Breasted Buttons: one, two, or three-roll-two
            <>
              {visualState.buttons === "one" && (
                <mesh
                  position={[0, -0.06, 0]}
                  rotation={[Math.PI / 2, 0, 0]}
                  material={buttonMaterial}
                  castShadow
                >
                  <cylinderGeometry args={[0.016, 0.016, 0.012, 16]} />
                </mesh>
              )}

              {visualState.buttons === "two" && (
                <>
                  <mesh
                    position={[0, -0.02, 0]}
                    rotation={[Math.PI / 2, 0, 0]}
                    material={buttonMaterial}
                    castShadow
                  >
                    <cylinderGeometry args={[0.016, 0.016, 0.012, 16]} />
                  </mesh>
                  <mesh
                    position={[0, -0.15, 0]}
                    rotation={[Math.PI / 2, 0, 0]}
                    material={buttonMaterial}
                    castShadow
                  >
                    <cylinderGeometry args={[0.016, 0.016, 0.012, 16]} />
                  </mesh>
                </>
              )}

              {visualState.buttons === "three-roll-two" && (
                <>
                  <mesh
                    position={[0, 0.08, 0]}
                    rotation={[Math.PI / 2, 0, 0]}
                    material={buttonMaterial}
                    castShadow
                  >
                    <cylinderGeometry args={[0.015, 0.015, 0.011, 16]} />
                  </mesh>
                  <mesh
                    position={[0, -0.04, 0]}
                    rotation={[Math.PI / 2, 0, 0]}
                    material={buttonMaterial}
                    castShadow
                  >
                    <cylinderGeometry args={[0.016, 0.016, 0.012, 16]} />
                  </mesh>
                  <mesh
                    position={[0, -0.16, 0]}
                    rotation={[Math.PI / 2, 0, 0]}
                    material={buttonMaterial}
                    castShadow
                  >
                    <cylinderGeometry args={[0.016, 0.016, 0.012, 16]} />
                  </mesh>
                </>
              )}
            </>
          )}
        </group>

        {/* 8. Articulated Sleeves */}
        {/* Left Sleeve */}
        <group position={[-0.44, 0.05, 0]} rotation={[0, 0, -0.22]}>
          <mesh geometry={sleeveLGeom} material={fabricMaterial} castShadow />
          {/* Cuff Buttons */}
          {[-0.28, -0.31, -0.34, -0.37].map((y, idx) => (
            <mesh
              key={idx}
              position={[-0.085, y, 0]}
              rotation={[0, 0, Math.PI / 2]}
              material={buttonMaterial}
            >
              <cylinderGeometry args={[0.009, 0.009, 0.006, 12]} />
            </mesh>
          ))}
        </group>

        {/* Right Sleeve */}
        <group position={[0.44, 0.05, 0]} rotation={[0, 0, 0.22]}>
          <mesh geometry={sleeveRGeom} material={fabricMaterial} castShadow />
          {/* Cuff Buttons */}
          {[-0.28, -0.31, -0.34, -0.37].map((y, idx) => (
            <mesh
              key={idx}
              position={[0.085, y, 0]}
              rotation={[0, 0, Math.PI / 2]}
              material={buttonMaterial}
            >
              <cylinderGeometry args={[0.009, 0.009, 0.006, 12]} />
            </mesh>
          ))}
        </group>
      </group>

      {/* 9. Trousers Layer */}
      <group position={[0, -0.05, 0]}>
        {/* Waistband & Belt Loops */}
        <mesh position={[0, 0.44, 0]} material={fabricMaterial} castShadow>
          <cylinderGeometry args={[0.29, 0.28, 0.09, 24]} />
        </mesh>

        {/* Left Leg */}
        <group position={[-0.145, 0, 0]} rotation={[0, 0, -0.025]}>
          <mesh geometry={legGeom} material={fabricMaterial} castShadow receiveShadow />
          {/* Pleats on Left Leg */}
          {(visualState.trousers === "pleated" || visualState.trousers === "double-pleat") && (
            <mesh position={[0, 0.26, 0.12]} rotation={[0, 0, 0]} material={fabricMaterial}>
              <boxGeometry args={[0.015, 0.32, 0.02]} />
            </mesh>
          )}
          {visualState.trousers === "double-pleat" && (
            <mesh position={[-0.04, 0.24, 0.11]} rotation={[0, 0, 0.02]} material={fabricMaterial}>
              <boxGeometry args={[0.012, 0.26, 0.018]} />
            </mesh>
          )}
        </group>

        {/* Right Leg */}
        <group position={[0.145, 0, 0]} rotation={[0, 0, 0.025]}>
          <mesh geometry={legGeom} material={fabricMaterial} castShadow receiveShadow />
          {/* Pleats on Right Leg */}
          {(visualState.trousers === "pleated" || visualState.trousers === "double-pleat") && (
            <mesh position={[0, 0.26, 0.12]} rotation={[0, 0, 0]} material={fabricMaterial}>
              <boxGeometry args={[0.015, 0.32, 0.02]} />
            </mesh>
          )}
          {visualState.trousers === "double-pleat" && (
            <mesh position={[0.04, 0.24, 0.11]} rotation={[0, 0, -0.02]} material={fabricMaterial}>
              <boxGeometry args={[0.012, 0.26, 0.018]} />
            </mesh>
          )}
        </group>
      </group>
    </group>
  );
}
