import { describe, expect, it } from "vitest";
import { ApiProblem, apiError, apiSuccess, fromUnknownError } from "./api-response";

describe("API response contract", () => {
  it("wraps successful resources in a data envelope", () => {
    expect(apiSuccess({ id: "f1" })).toEqual({ data: { id: "f1" } });
  });

  it("returns stable public error codes without internal details", () => {
    expect(apiError(new ApiProblem("fabric_not_found", "Ткань не найдена", 404))).toEqual({
      error: { code: "fabric_not_found", message: "Ткань не найдена" },
    });
  });

  it("normalizes unknown errors to a safe internal error", () => {
    const result = fromUnknownError(new Error("postgres password leaked"));
    expect(result.status).toBe(500);
    expect(result.body.error).toEqual({ code: "internal_error", message: "Внутренняя ошибка сервера" });
    expect(JSON.stringify(result.body)).not.toContain("password");
  });
});
