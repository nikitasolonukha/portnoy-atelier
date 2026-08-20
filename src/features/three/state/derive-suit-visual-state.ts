import type { SuitVisualState } from "../model/suit-model-types";

const VALID_JACKETS = new Set(["single", "double"]);
const VALID_LAPELS = new Set(["notch", "peak", "shawl"]);
const VALID_BUTTONS = new Set(["one", "two", "three-roll-two"]);
const VALID_POCKETS = new Set(["flap", "jetted", "patch"]);
const VALID_TROUSERS = new Set(["classic", "pleated", "double-pleat"]);
const VALID_VESTS = new Set(["none", "single", "double"]);

export const DEFAULT_SUIT_VISUAL_STATE: SuitVisualState = {
  jacket: "single",
  lapel: "notch",
  buttons: "two",
  pockets: "flap",
  trousers: "classic",
  vest: "none",
};

/**
 * Pure function to safely derive 3D visual state from arbitrary settings dictionary.
 * Catches missing/unknown options and falls back to deterministic defaults.
 */
export function deriveSuitVisualState(
  settings?: Record<string, string> | null
): SuitVisualState {
  if (!settings || typeof settings !== "object") {
    return { ...DEFAULT_SUIT_VISUAL_STATE };
  }

  const rawJacket = settings.jacket || settings["jacket-type"] || settings["silhouette"];
  const rawLapel = settings.lapel || settings["lapel-type"];
  const rawButtons = settings.buttons || settings["button-layout"];
  const rawPockets = settings.pockets || settings["pocket-type"];
  const rawTrousers = settings.trousers || settings["trousers-pleats"] || settings["pleats"];
  const rawVest = settings.vest || settings["waistcoat"];

  return {
    jacket: VALID_JACKETS.has(rawJacket)
      ? (rawJacket as SuitVisualState["jacket"])
      : DEFAULT_SUIT_VISUAL_STATE.jacket,
    lapel: VALID_LAPELS.has(rawLapel)
      ? (rawLapel as SuitVisualState["lapel"])
      : DEFAULT_SUIT_VISUAL_STATE.lapel,
    buttons: VALID_BUTTONS.has(rawButtons)
      ? (rawButtons as SuitVisualState["buttons"])
      : DEFAULT_SUIT_VISUAL_STATE.buttons,
    pockets: VALID_POCKETS.has(rawPockets)
      ? (rawPockets as SuitVisualState["pockets"])
      : DEFAULT_SUIT_VISUAL_STATE.pockets,
    trousers: VALID_TROUSERS.has(rawTrousers)
      ? (rawTrousers as SuitVisualState["trousers"])
      : DEFAULT_SUIT_VISUAL_STATE.trousers,
    vest: VALID_VESTS.has(rawVest)
      ? (rawVest as SuitVisualState["vest"])
      : DEFAULT_SUIT_VISUAL_STATE.vest,
  };
}
