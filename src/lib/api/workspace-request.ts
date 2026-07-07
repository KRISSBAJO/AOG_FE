import { ApiError, apiRequest } from "../api";
import { getActiveWorkspaceId } from "../auth";

export type QueryValue = string | number | boolean | null | undefined;
export type Query = Record<string, QueryValue>;

export type ListResponse<T> = {
  data: T[];
  meta: {
    skip: number;
    take: number;
    total: number;
  };
};

export function withQuery(path: string, query?: Query) {
  const params = new URLSearchParams();

  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  });

  const queryString = params.toString();
  return queryString ? `${path}?${queryString}` : path;
}

export function workspaceRequest<T>(path: string, init: RequestInit = {}) {
  const workspaceId = getActiveWorkspaceId();

  if (!workspaceId) {
    throw new ApiError(401, { message: "Sign in again to choose a workspace." });
  }

  const headers = new Headers(init.headers);
  headers.set("x-workspace-id", workspaceId);

  return apiRequest<T>(path, {
    ...init,
    headers,
  });
}

export function jsonBody(input: unknown) {
  return JSON.stringify(input);
}
