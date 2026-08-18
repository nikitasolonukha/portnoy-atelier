export const importFields = [
  "article", "name", "manufacturer", "collection", "composition", "mainColor", "pattern",
  "weightGsm", "widthCm", "pricePerMeter", "currency", "description",
] as const;

export type ImportField = typeof importFields[number];
export type ColumnMapping = Record<string, ImportField | "">;

const aliases: Record<string, ImportField> = {
  "артикул": "article", "sku": "article", "article": "article",
  "название": "name", "наименование": "name", "name": "name", "title": "name",
  "производитель": "manufacturer", "фабрика": "manufacturer", "manufacturer": "manufacturer", "brand": "manufacturer", "mill": "manufacturer",
  "коллекция": "collection", "collection": "collection",
  "состав": "composition", "composition": "composition",
  "цвет": "mainColor", "color": "mainColor", "main color": "mainColor",
  "рисунок": "pattern", "pattern": "pattern",
  "плотность": "weightGsm", "вес": "weightGsm", "weight": "weightGsm", "weight gsm": "weightGsm",
  "ширина": "widthCm", "width": "widthCm",
  "цена": "pricePerMeter", "price": "pricePerMeter", "price per meter": "pricePerMeter",
  "валюта": "currency", "currency": "currency",
  "описание": "description", "description": "description",
};

function normalizedHeader(value: string) {
  return value.trim().toLocaleLowerCase("ru").replace(/[_-]+/g, " ").replace(/\s+/g, " ");
}

export function suggestColumnMapping(headers: string[]): ColumnMapping {
  return Object.fromEntries(headers.map((header) => [header, aliases[normalizedHeader(header)] ?? ""]));
}

export function applyColumnMapping(rows: Record<string, unknown>[], mapping: ColumnMapping) {
  return rows.map((row) => Object.fromEntries(Object.entries(mapping).flatMap(([column, field]) => field ? [[field, row[column]]] : [])));
}
