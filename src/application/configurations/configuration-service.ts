import type { ConfigurationCreate, ConfigurationRepository } from "@/application/ports/configuration-repository";
import { ApiProblem } from "@/lib/api-response";
import { configurationInputSchema } from "@/schemas/configuration";
import type { ConfigurationGroup } from "@/types/domain";

export class ConfigurationService {
  constructor(private readonly repository: ConfigurationRepository, private readonly loadGroups: () => Promise<ConfigurationGroup[]>) {}

  list(actorId?: string) {
    return this.repository.list(actorId);
  }

  async create(input: ConfigurationCreate, actorId: string) {
    const parsed = configurationInputSchema.parse(input);
    const groups = (await this.loadGroups()).filter((group) => group.isActive);
    const groupMap = new Map(groups.map((group) => [group.key, group]));
    const settings: Record<string, string> = {};
    for (const [key, value] of Object.entries(parsed.settings)) {
      const group = groupMap.get(key);
      if (!group) continue;
      if (!group.options.some((option) => option.isActive && option.key === value)) {
        throw new ApiProblem("configuration_option_invalid", `Недоступная опция для группы ${group.name}`, 422);
      }
      settings[key] = value;
    }
    return this.repository.create({ ...parsed, settings }, actorId);
  }
}
