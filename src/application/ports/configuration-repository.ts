import type { SavedConfiguration } from "@/types/domain";

export type ConfigurationCreate = Pick<SavedConfiguration, "name" | "fabricId" | "settings">;

export interface ConfigurationRepository {
  list(actorId?: string): Promise<SavedConfiguration[]>;
  findById(id: string): Promise<SavedConfiguration | null>;
  create(input: ConfigurationCreate, actorId: string): Promise<SavedConfiguration>;
  update(id: string, input: Partial<ConfigurationCreate>, actorId: string): Promise<SavedConfiguration | null>;
  remove(id: string): Promise<boolean>;
}
