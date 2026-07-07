export type ApiErrorBody = {
  message?: string | string[];
  error?: string;
  statusCode?: number;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3101/api";
let refreshPromise: Promise<void> | null = null;

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
  init: RequestInit & { token?: string | null; skipAuthRefresh?: boolean } = {}
): Promise<T> {
  return rawApiRequest<T>(path, init, false);
}

async function rawApiRequest<T>(
  path: string,
  init: RequestInit & { token?: string | null; skipAuthRefresh?: boolean },
  hasRetried: boolean,
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
    credentials: init.credentials ?? "include",
  });

  const body = response.headers.get("content-type")?.includes("application/json")
    ? await response.json()
    : undefined;

  if (
    response.status === 401 &&
    !hasRetried &&
    !init.skipAuthRefresh &&
    shouldRefreshFor(path)
  ) {
    await refreshAuthSession();
    return rawApiRequest<T>(path, init, true);
  }

  if (!response.ok) {
    throw new ApiError(response.status, body);
  }

  return body as T;
}

function shouldRefreshFor(path: string) {
  return ![
    "/auth/sign-in",
    "/auth/sign-up",
    "/auth/invitations",
    "/auth/accept-invite",
    "/auth/refresh",
    "/auth/logout",
    "/auth/forgot-password",
    "/auth/reset-password",
    "/public/",
  ].some((authPath) => path.startsWith(authPath));
}

async function refreshAuthSession() {
  refreshPromise ??= fetch(`${API_URL}/auth/refresh`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({}),
  }).then(async (response) => {
    if (!response.ok) {
      const body = response.headers.get("content-type")?.includes("application/json")
        ? await response.json()
        : undefined;
      throw new ApiError(response.status, body);
    }
  }).finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
}
