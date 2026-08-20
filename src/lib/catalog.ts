export type CatalogFabric = {
  id: string;
  article: string;
  name: string;
  manufacturer: string;
  composition?: string;
  mainColor: string;
  pattern: string;
  isActive: boolean;
  createdAt?: string;
};

export type CatalogFilters = {
  query?: string;
  manufacturers?: string[];
  compositions?: string[];
  color?: string;
  pattern?: string;
  status?: "active" | "archived" | "all";
};

export function filterFabrics<T extends CatalogFabric>(items: T[], filters: CatalogFilters): T[] {
  const query = filters.query?.trim().toLocaleLowerCase("ru") ?? "";
  const manufacturers = (filters.manufacturers ?? []).filter(Boolean);
  const compositions = (filters.compositions ?? []).filter(Boolean);
  return items.filter((item) => {
    const haystack = [item.article, item.name, item.manufacturer, item.composition ?? ""].join(" ").toLocaleLowerCase("ru");
    const statusMatches = filters.status === "archived" ? !item.isActive : filters.status === "all" ? true : item.isActive;
    const manufacturerMatches = manufacturers.length === 0 || manufacturers.includes(item.manufacturer);
    const compositionMatches = compositions.length === 0 || compositions.includes(item.composition ?? "");
    return (
      (!query || haystack.includes(query)) &&
      manufacturerMatches &&
      compositionMatches &&
      (!filters.color || item.mainColor === filters.color) &&
      (!filters.pattern || item.pattern === filters.pattern) &&
      statusMatches
    );
  });
}

export type CatalogSort = "newest" | "oldest" | "name-asc" | "name-desc" | "article-asc";

export function sortFabrics<T extends CatalogFabric>(items: T[], sort: CatalogSort): T[] {
  const copy = [...items];
  return copy.sort((left, right) => {
    if (sort === "newest" || sort === "oldest") {
      const leftTime = Date.parse(left.createdAt ?? "") || 0;
      const rightTime = Date.parse(right.createdAt ?? "") || 0;
      const comparison = leftTime - rightTime;
      return sort === "newest" ? -comparison : comparison;
    }
    if (sort === "article-asc") return left.article.localeCompare(right.article, "ru");
    const comparison = left.name.localeCompare(right.name, "ru");
    return sort === "name-desc" ? -comparison : comparison;
  });
}

export function uniqueCatalogValues<T extends CatalogFabric>(items: T[], key: "manufacturer" | "composition" | "mainColor" | "pattern"): string[] {
  const values = items
    .map((item) => (key === "composition" ? item.composition : item[key]) ?? "")
    .map((value) => value.trim())
    .filter(Boolean);
  return [...new Set(values)].sort((left, right) => left.localeCompare(right, "ru"));
}
