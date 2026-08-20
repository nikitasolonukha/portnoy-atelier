import type { SuitModelManifest } from "./suit-model-types";

export const SUIT_MODEL_MANIFEST: SuitModelManifest = {
  version: "1.0.0",
  materialTargets: {
    mainFabric: [
      "JACKET_BODY",
      "SLEEVE_L",
      "SLEEVE_R",
      "LAPEL_NOTCH_L",
      "LAPEL_NOTCH_R",
      "LAPEL_PEAK_L",
      "LAPEL_PEAK_R",
      "LAPEL_SHAWL_L",
      "LAPEL_SHAWL_R",
      "POCKET_FLAP_L",
      "POCKET_FLAP_R",
      "POCKET_JETTED_L",
      "POCKET_JETTED_R",
      "POCKET_PATCH_L",
      "POCKET_PATCH_R",
      "TROUSERS_BASE",
      "PLEAT_L_1",
      "PLEAT_R_1",
      "PLEAT_L_2",
      "PLEAT_R_2",
      "VEST_SINGLE_BODY",
      "VEST_DOUBLE_BODY",
    ],
    buttons: [
      "BUTTON_FRONT_1",
      "BUTTON_FRONT_2",
      "BUTTON_FRONT_3",
      "BUTTON_DB_ARRAY",
      "BUTTON_CUFF_L",
      "BUTTON_CUFF_R",
      "BUTTON_VEST_ARRAY",
    ],
    lining: ["JACKET_LINING_INTERIOR", "VEST_BACK_SATIN"],
    details: ["COLLAR_FELT", "POCKET_CHEST_WELT"],
  },
  nodes: {
    jacket: {
      single: ["JACKET_SINGLE_BODY", "COLLAR_BASE", "SLEEVE_L", "SLEEVE_R"],
      double: ["JACKET_DOUBLE_BODY", "COLLAR_BASE", "SLEEVE_L", "SLEEVE_R"],
    },
    lapel: {
      notch: ["LAPEL_NOTCH_L", "LAPEL_NOTCH_R"],
      peak: ["LAPEL_PEAK_L", "LAPEL_PEAK_R"],
      shawl: ["LAPEL_SHAWL_L", "LAPEL_SHAWL_R"],
    },
    buttons: {
      one: ["BUTTON_FRONT_1"],
      two: ["BUTTON_FRONT_1", "BUTTON_FRONT_2"],
      "three-roll-two": ["BUTTON_FRONT_1", "BUTTON_FRONT_2", "BUTTON_FRONT_3"],
    },
    pockets: {
      flap: ["POCKET_FLAP_L", "POCKET_FLAP_R", "POCKET_CHEST_WELT"],
      jetted: ["POCKET_JETTED_L", "POCKET_JETTED_R", "POCKET_CHEST_WELT"],
      patch: ["POCKET_PATCH_L", "POCKET_PATCH_R", "POCKET_CHEST_WELT"],
    },
    trousers: {
      classic: ["TROUSERS_BASE"],
      pleated: ["TROUSERS_BASE", "PLEAT_L_1", "PLEAT_R_1"],
      "double-pleat": ["TROUSERS_BASE", "PLEAT_L_1", "PLEAT_R_1", "PLEAT_L_2", "PLEAT_R_2"],
    },
    vest: {
      none: [],
      single: ["VEST_SINGLE_BODY", "BUTTON_VEST_ARRAY", "VEST_BACK_SATIN"],
      double: ["VEST_DOUBLE_BODY", "BUTTON_VEST_ARRAY", "VEST_BACK_SATIN"],
    },
  },
};
