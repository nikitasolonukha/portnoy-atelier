export type CatalogFabric = {
  id: string;
  article: string;
  name: string;
  manufacturer: string;
  mainColor: string;
  pattern: string;
  isActive: boolean;
};

export type CatalogFilters = {
  query?: string;
  color?: string;
  pattern?: string;
  status?: "active" | "archived" | "all";
};

export function filterFabrics<T extends CatalogFabric>(items: T[], filters: CatalogFilters): T[] {
  const query = filters.query?.trim().toLocaleLowerCase("ru") ?? "";
  return items.filter((item) => {
    const haystack = [item.article, item.name, item.manufacturer].join(" ").toLocaleLowerCase("ru");
    const statusMatches = filters.status === "archived" ? !item.isActive : filters.status === "all" ? true : item.isActive;
    return (!query || haystack.includes(query)) && (!filters.color || item.mainColor === filters.color) && (!filters.pattern || item.pattern === filters.pattern) && statusMatches;
  });
}

export type CatalogSort = "name-asc" | "name-desc" | "article-asc";

export function sortFabrics<T extends CatalogFabric>(items: T[], sort: CatalogSort): T[] {
  const copy = [...items];
  return copy.sort((left, right) => {
    if (sort === "article-asc") return left.article.localeCompare(right.article, "ru");
    const comparison = left.name.localeCompare(right.name, "ru");
    return sort === "name-desc" ? -comparison : comparison;
  });
}
