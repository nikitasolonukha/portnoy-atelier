export type Fabric = {
  id: string;
  article: string;
  name: string;
  manufacturer: string;
  collection?: string;
  composition: string;
  mainColor: string;
  pattern: string;
  weightGsm: number;
  widthCm: number;
  pricePerMeter: number;
  currency: "RUB" | "EUR" | "USD";
  description?: string;
  isActive: boolean;
  swatch: string;
  createdAt: string;
  updatedAt: string;
};

export type ConfigurationOption = {
  id: string;
  groupKey: string;
  key: string;
  name: string;
  description?: string;
  sortOrder: number;
  isActive: boolean;
};

export type ConfigurationGroup = {
  id: string;
  key: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
  options: ConfigurationOption[];
};

export type SavedConfiguration = {
  id: string;
  name: string;
  fabricId: string | null;
  settings: Record<string, string>;
  createdAt: string;
  updatedAt: string;
};
