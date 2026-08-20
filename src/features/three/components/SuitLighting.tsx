import React from "react";
import { ContactShadows } from "@react-three/drei";

export function SuitLighting() {
  return (
    <>
      {/* 1. Subtle Ambient Base */}
      <hemisphereLight args={["#F4F1EA", "#3A414C", 0.7]} />
      <ambientLight intensity={1.05} color="#F7F6F2" />

      {/* 2. Key Light (Soft High-End Studio Directional Light) */}
      <directionalLight
        position={[2.5, 3.5, 3.2]}
        intensity={2.05}
        color="#FFFFFF"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0001}
      />

      {/* 3. Fill Light (Soft cool fill from opposite side) */}
      <directionalLight
        position={[-3.0, 2.0, 2.0]}
        intensity={1.05}
        color="#E4E9F2"
      />

      {/* 4. Back Rim Light (Highlights shoulders, lapel contour & silhouette) */}
      <directionalLight
        position={[0, 3.0, -3.5]}
        intensity={1.2}
        color="#FAF8F5"
      />

      {/* 5. Under Fill */}
      <directionalLight
        position={[0, -2.5, 1.5]}
        intensity={0.3}
        color="#C8CCD4"
      />

      {/* 6. Soft Ground Contact Shadow */}
      <ContactShadows
        position={[0, 0, 0]}
        opacity={0.65}
        scale={3.2}
        blur={2.0}
        far={2.5}
        color="#0A0D10"
      />
    </>
  );
}
