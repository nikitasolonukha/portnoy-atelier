import { describe, expect, it } from "vitest";
import type { ConfigurationGroupRow } from "./configuration-types";
import { filterAndMapActiveConfigurationGroups } from "./supabase-configuration-repository";

function group(key: string, isActive: boolean, options: ConfigurationGroupRow["configuration_options"]): ConfigurationGroupRow {
  return { id: `group-${key}`, key, name: key, sort_order: 1, is_active: isActive, configuration_options: options };
}

function option(key: string, isActive: boolean) {
  return { id: `option-${key}`, key, name: key, description: null, sort_order: 1, is_active: isActive };
}

describe("active configurator catalog", () => {
  it("excludes inactive groups and inactive options even for an admin-visible result", () => {
    const result = filterAndMapActiveConfigurationGroups([
      group("active", true, [option("available", true), option("retired", false)]),
      group("retired-group", false, [option("still-marked-active", true)]),
    ]);

    expect(result).toHaveLength(1);
    expect(result[0]?.key).toBe("active");
    expect(result[0]?.options.map((item) => item.key)).toEqual(["available"]);
  });
});