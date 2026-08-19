import type { FabricData, FabricPatchData } from "@/schemas/fabric";
import type { Fabric } from "@/types/domain";

export type FabricListQuery = {
  query?: string;
  status?: "active" | "archived" | "all";
  limit?: number;
  page?: number;
};

export type FabricPage = {
  items: Fabric[];
  total: number;
};

export interface FabricRepository {
  list(query?: FabricListQuery): Promise<FabricPage>;
  findById(id: string): Promise<Fabric | null>;
  findByArticle(article: string): Promise<Fabric | null>;
  create(input: FabricData, actorId: string): Promise<Fabric>;
  update(id: string, input: FabricPatchData, actorId: string): Promise<Fabric | null>;
  archive(id: string, actorId?: string): Promise<boolean>;
  remove(id: string): Promise<boolean>;
}
