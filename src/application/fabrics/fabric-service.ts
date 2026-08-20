import type { FabricRepository } from "@/application/ports/fabric-repository";
import { ApiProblem } from "@/lib/api-response";
import { fabricInputSchema, type FabricInput } from "@/schemas/fabric";

export class FabricService {
  constructor(private readonly repository: FabricRepository) {}

  list() {
    return this.repository.list();
  }

  async get(id: string) {
    const fabric = await this.repository.findById(id);
    if (!fabric) throw new ApiProblem("fabric_not_found", "Ткань не найдена", 404);
    return fabric;
  }

  async create(input: FabricInput, actorId: string) {
    const parsed = fabricInputSchema.parse(input);
    if (await this.repository.findByArticle(parsed.article)) {
      throw new ApiProblem("fabric_article_exists", "Ткань с таким артикулом уже существует", 409);
    }
    return this.repository.create(parsed, actorId);
  }

  async archive(id: string, actorId?: string) {
    if (!await this.repository.archive(id, actorId)) throw new ApiProblem("fabric_not_found", "Ткань не найдена", 404);
  }

  async remove(id: string) {
    if (!await this.repository.remove(id)) throw new ApiProblem("fabric_not_found", "Ткань не найдена", 404);
  }
}
