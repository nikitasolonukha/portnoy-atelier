export type AppRole = "admin" | "tailor" | "employee";

export type CurrentUser = {
  id: string;
  fullName: string;
  role: AppRole;
};
