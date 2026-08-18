import type { Database } from "./database.types";

type GroupRow = Database["public"]["Tables"]["configuration_groups"]["Row"];
type OptionRow = Database["public"]["Tables"]["configuration_options"]["Row"];
type CanonicalConfigurationRow = Database["public"]["Tables"]["configurations"]["Row"];

export type ConfigurationRow = Omit<CanonicalConfigurationRow, "settings"> & {
  settings: Record<string, string>;
};

export type ConfigurationGroupRow = GroupRow & {
  configuration_options: Array<Pick<OptionRow, "id" | "key" | "name" | "description" | "sort_order" | "is_active">>;
};