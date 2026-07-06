import { apiRequest } from "./api";

const ACCESS_TOKEN_KEY = "aog.accessToken";
const REFRESH_TOKEN_KEY = "aog.refreshToken";
const WORKSPACE_ID_KEY = "aog.activeWorkspaceId";

export type AuthUser = {
  id: string;
  email: string;
  displayName: string;
  phone?: string | null;
  isSiteAdmin: boolean;
};

export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  activeWorkspaceId?: string;
  user: AuthUser;
};

export type ForgotPasswordResponse = {
  message: string;
  resetToken?: string;
};

export function getAccessToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function getActiveWorkspaceId() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(WORKSPACE_ID_KEY);
}

export function saveAuthSession(session: AuthResponse) {
  window.localStorage.setItem(ACCESS_TOKEN_KEY, session.accessToken);
  window.localStorage.setItem(REFRESH_TOKEN_KEY, session.refreshToken);

  if (session.activeWorkspaceId) {
    window.localStorage.setItem(WORKSPACE_ID_KEY, session.activeWorkspaceId);
  }
}

export function clearAuthSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  window.localStorage.removeItem(WORKSPACE_ID_KEY);
}

export function signIn(email: string, password: string) {
  return apiRequest<AuthResponse>("/auth/sign-in", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function signUp(input: {
  email: string;
  displayName: string;
  workspaceName: string;
  password: string;
}) {
  return apiRequest<AuthResponse>("/auth/sign-up", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function forgotPassword(email: string) {
  return apiRequest<ForgotPasswordResponse>("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export function resetPassword(token: string, password: string) {
  return apiRequest<{ success: boolean }>("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, password }),
  });
}

export function getMe(token: string) {
  return apiRequest<AuthUser>("/auth/me", {
    token,
  });
}

export async function logout() {
  const refreshToken = getRefreshToken();
  clearAuthSession();

  if (!refreshToken) return;

  await apiRequest("/auth/logout", {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
  }).catch(() => undefined);
}

