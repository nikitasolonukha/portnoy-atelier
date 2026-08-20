"use client";

import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";

type MeshoptCapableLoader = {
  setMeshoptDecoder: (decoder: typeof MeshoptDecoder) => void;
};

export function extendGltfLoader(loader: MeshoptCapableLoader) {
  loader.setMeshoptDecoder(MeshoptDecoder);
}
