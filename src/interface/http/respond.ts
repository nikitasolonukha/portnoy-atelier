import { ZodError } from "zod";
import { ApiProblem, fromUnknownError } from "@/lib/api-response";

export function toErrorResponse(error: unknown) {
  if (error instanceof ZodError) {
    const problem = new ApiProblem("validation_error", "Запрос не прошёл проверку", 422, error.issues.map((issue) => ({ field: issue.path.join("."), message: issue.message, code: issue.code })));
    return fromUnknownError(problem);
  }
  return fromUnknownError(error);
}
