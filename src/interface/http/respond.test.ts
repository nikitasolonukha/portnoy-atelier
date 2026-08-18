import { describe, expect, it } from "vitest";
import { z } from "zod";
import { toErrorResponse } from "./respond";

describe("HTTP error response", () => {
  it("maps Zod errors to 422 field details", () => {
    const error = z.object({ name: z.string().min(2) }).safeParse({ name: "" }).error;
    const response = toErrorResponse(error);
    expect(response.status).toBe(422);
    expect(response.body.error.code).toBe("validation_error");
    expect(response.body.error.details?.[0]?.field).toBe("name");
  });
});
