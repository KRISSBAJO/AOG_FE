import { apiRequest } from "./api";

const LEGACY_ACCESS_TOKEN_KEY = "aog.accessToken";
const LEGACY_REFRESH_TOKEN_KEY = "aog.refreshToken";
const WORKSPACE_ID_KEY = "aog.activeWorkspaceId";

export type AuthUser = {
  id: string;
  email: string;
  displayName: string;
  phone?: string | null;
  isSiteAdmin: boolean;
  memberships?: Array<{
    workspaceId: string;
    workspace?: { id: string; name: string; slug?: string | null };
  }>;
};

export type AuthResponse = {
  accessTokenExpiresAt?: string;
  refreshTokenExpiresAt?: string;
  activeWorkspaceId?: string;
  user: AuthUser;
};

export type ForgotPasswordResponse = {
  message: string;
  resetToken?: string;
};

export function getActiveWorkspaceId() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(WORKSPACE_ID_KEY);
}

export function saveAuthSession(session: AuthResponse) {
  window.localStorage.removeItem(LEGACY_ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(LEGACY_REFRESH_TOKEN_KEY);

  const workspaceId = resolveWorkspaceId(session);

  if (workspaceId) {
    window.localStorage.setItem(WORKSPACE_ID_KEY, workspaceId);
  }
}

export function clearAuthSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(LEGACY_ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(LEGACY_REFRESH_TOKEN_KEY);
  window.localStorage.removeItem(WORKSPACE_ID_KEY);
}

export function signIn(email: string, password: string) {
  return apiRequest<AuthResponse>("/auth/sign-in", {
    method: "POST",
    body: JSON.stringify({ email, password }),
    skipAuthRefresh: true,
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
    skipAuthRefresh: true,
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

export function getMe(token?: string | null) {
  return apiRequest<AuthUser>("/auth/me", {
    token,
  });
}

export async function logout() {
  clearAuthSession();

  await apiRequest("/auth/logout", {
    method: "POST",
    body: JSON.stringify({}),
    skipAuthRefresh: true,
  }).catch(() => undefined);
}

export function saveWorkspaceFromUser(user: AuthUser) {
  if (typeof window === "undefined") return;
  const workspaceId = user.memberships?.[0]?.workspaceId;
  if (workspaceId && !window.localStorage.getItem(WORKSPACE_ID_KEY)) {
    window.localStorage.setItem(WORKSPACE_ID_KEY, workspaceId);
  }
}

function resolveWorkspaceId(session: AuthResponse) {
  return session.activeWorkspaceId ?? session.user.memberships?.[0]?.workspaceId;
}
