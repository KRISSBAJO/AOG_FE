export type ApiErrorBody = {
  message?: string | string[];
  error?: string;
  statusCode?: number;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3101/api";

export class ApiError extends Error {
  status: number;
  body?: ApiErrorBody;

  constructor(status: number, body?: ApiErrorBody) {
    const message = Array.isArray(body?.message)
      ? body?.message.join(" ")
      : body?.message ?? body?.error ?? "Request failed";

    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

export function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}

export async function apiRequest<T>(
  path: string,
  init: RequestInit & { token?: string | null } = {}
): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");

  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (init.token) {
    headers.set("Authorization", `Bearer ${init.token}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers,
  });

  const body = response.headers.get("content-type")?.includes("application/json")
    ? await response.json()
    : undefined;

  if (!response.ok) {
    throw new ApiError(response.status, body);
  }

  return body as T;
}
