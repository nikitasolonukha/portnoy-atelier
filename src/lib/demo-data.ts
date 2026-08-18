import type { ConfigurationGroup, Fabric, SavedConfiguration } from "@/types/domain";

export const demoFabrics: Fabric[] = [
  { id: "f1", article: "VB-2401", name: "Midnight Hopsack", manufacturer: "Vitale Barberis Canonico", collection: "Perennial", composition: "100% шерсть", mainColor: "Синий", pattern: "Однотонная", weightGsm: 280, widthCm: 150, pricePerMeter: 12800, currency: "RUB", description: "Сухая фактура и высокая воздухопроницаемость. Для круглогодичного костюма.", isActive: true, swatch: "navy-weave", createdAt: "2026-07-12T12:00:00Z", updatedAt: "2026-08-16T09:00:00Z" },
  { id: "f2", article: "LP-0772", name: "Prince of Wales", manufacturer: "Loro Piana", collection: "Australis", composition: "100% шерсть Super 150’s", mainColor: "Серый", pattern: "Клетка", weightGsm: 250, widthCm: 150, pricePerMeter: 29600, currency: "RUB", description: "Мягкая костюмная шерсть с неброской бордовой оконной клеткой.", isActive: true, swatch: "grey-check", createdAt: "2026-07-18T12:00:00Z", updatedAt: "2026-08-15T09:00:00Z" },
  { id: "f3", article: "DR-0190", name: "Charcoal Flannel", manufacturer: "Drapers", collection: "Lady Sanfelice", composition: "100% шерсть", mainColor: "Графит", pattern: "Меланж", weightGsm: 340, widthCm: 150, pricePerMeter: 17400, currency: "RUB", description: "Плотная фланель с матовой поверхностью для холодного сезона.", isActive: true, swatch: "charcoal", createdAt: "2026-07-21T12:00:00Z", updatedAt: "2026-08-12T09:00:00Z" },
  { id: "f4", article: "AR-6108", name: "Olive Solaro", manufacturer: "Ariston", collection: "Season", composition: "100% шерсть", mainColor: "Оливковый", pattern: "Диагональ", weightGsm: 270, widthCm: 150, pricePerMeter: 21900, currency: "RUB", description: "Переливчатая диагональ, меняющая тон при движении.", isActive: true, swatch: "olive-twill", createdAt: "2026-07-28T12:00:00Z", updatedAt: "2026-08-10T09:00:00Z" },
  { id: "f5", article: "RE-3320", name: "Brown Chalk Stripe", manufacturer: "Reda", collection: "1865", composition: "100% шерсть", mainColor: "Коричневый", pattern: "Полоска", weightGsm: 290, widthCm: 150, pricePerMeter: 14600, currency: "RUB", description: "Тёплая коричневая основа и тонкая меловая полоска.", isActive: true, swatch: "brown-stripe", createdAt: "2026-08-01T12:00:00Z", updatedAt: "2026-08-09T09:00:00Z" },
  { id: "f6", article: "CAN-1904", name: "Summer Fresco", manufacturer: "Caccioppoli", collection: "Solemare", composition: "100% шерсть", mainColor: "Бежевый", pattern: "Однотонная", weightGsm: 230, widthCm: 150, pricePerMeter: 18200, currency: "RUB", description: "Открытое плетение для летнего непарного пиджака.", isActive: false, swatch: "sand-weave", createdAt: "2026-06-12T12:00:00Z", updatedAt: "2026-08-01T09:00:00Z" },
];

const makeOptions = (groupKey: string, names: Array<[string, string, string?]>) => names.map(([key, name, description], index) => ({ id: `${groupKey}-${key}`, groupKey, key, name, description, sortOrder: index, isActive: true }));

export const demoGroups: ConfigurationGroup[] = [
  { id: "g1", key: "jacket", name: "Пиджак", sortOrder: 1, isActive: true, options: makeOptions("jacket", [["single", "Однобортный", "Чистая линия на каждый день"], ["double", "Двубортный", "Более формальный силуэт"]]) },
  { id: "g2", key: "lapel", name: "Лацканы", sortOrder: 2, isActive: true, options: makeOptions("lapel", [["notch", "Прямые", "Классический английский уступ"], ["peak", "Острые", "Выраженная линия к плечу"], ["shawl", "Шалевые", "Мягкий вечерний контур"]]) },
  { id: "g3", key: "buttons", name: "Пуговицы", sortOrder: 3, isActive: true, options: makeOptions("buttons", [["one", "Одна"], ["two", "Две"], ["three-roll-two", "3 roll 2"]]) },
  { id: "g4", key: "pockets", name: "Карманы", sortOrder: 4, isActive: true, options: makeOptions("pockets", [["flap", "С клапаном"], ["jetted", "В рамку"], ["patch", "Накладные"]]) },
  { id: "g5", key: "trousers", name: "Брюки", sortOrder: 5, isActive: true, options: makeOptions("trousers", [["classic", "Классические"], ["pleated", "С одной складкой"], ["double-pleat", "С двумя складками"]]) },
  { id: "g6", key: "vest", name: "Жилет", sortOrder: 6, isActive: true, options: makeOptions("vest", [["none", "Без жилета"], ["single", "Однобортный"], ["double", "Двубортный"]]) },
];

export const demoConfigurations: SavedConfiguration[] = [
  { id: "c1", name: "Городской синий", fabricId: "f1", settings: { jacket: "single", lapel: "notch", buttons: "two", pockets: "flap", trousers: "classic", vest: "none" }, createdAt: "2026-08-14T11:00:00Z", updatedAt: "2026-08-17T14:20:00Z" },
  { id: "c2", name: "Клетка для приёма", fabricId: "f2", settings: { jacket: "double", lapel: "peak", buttons: "two", pockets: "jetted", trousers: "pleated", vest: "single" }, createdAt: "2026-08-15T11:00:00Z", updatedAt: "2026-08-17T17:45:00Z" },
];
