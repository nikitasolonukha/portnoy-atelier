export type ApiErrorBody = {
  error: { code: string; message: string; details?: Array<{ field: string; message: string; code: string }> };
};

export class ApiProblem extends Error {
  constructor(public readonly code: string, message: string, public readonly status: number, public readonly details?: ApiErrorBody["error"]["details"]) {
    super(message);
    this.name = "ApiProblem";
  }
}

export function apiSuccess<T>(data: T, meta?: Record<string, unknown>) {
  return meta ? { data, meta } : { data };
}

export function apiError(problem: ApiProblem): ApiErrorBody {
  return { error: { code: problem.code, message: problem.message, ...(problem.details?.length ? { details: problem.details } : {}) } };
}

export function fromUnknownError(error: unknown): { status: number; body: ApiErrorBody } {
  const problem = error instanceof ApiProblem ? error : new ApiProblem("internal_error", "Внутренняя ошибка сервера", 500);
  return { status: problem.status, body: apiError(problem) };
}
