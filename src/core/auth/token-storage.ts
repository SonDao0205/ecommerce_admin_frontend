const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const USER_KEY = "auth_user";
const AUTH_CHANGE_EVENT = "shopnow:auth-change";

/**
 * Browser-only token adapter. Replace this implementation with a BFF/httpOnly
 * cookie flow later without changing any API service or page.
 */
export class TokenStorage {
  getAccessToken(): string | null {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  setAccessToken(token: string): void {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
      this.notifyChange();
    }
  }

  setSession(accessToken: string, refreshToken: string, user: unknown): void {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    window.localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    window.localStorage.setItem(USER_KEY, JSON.stringify(user));
    this.notifyChange();
  }

  hasAdminSession(): boolean {
    const token = this.getAccessToken();
    if (!token || this.isExpired(token) || typeof window === "undefined") return false;

    try {
      const user = JSON.parse(window.localStorage.getItem(USER_KEY) ?? "null") as {
        roles?: string[];
      } | null;
      return Boolean(user?.roles?.includes("admin"));
    } catch {
      return false;
    }
  }

  subscribe(listener: () => void): () => void {
    if (typeof window === "undefined") return () => undefined;
    window.addEventListener("storage", listener);
    window.addEventListener(AUTH_CHANGE_EVENT, listener);
    return () => {
      window.removeEventListener("storage", listener);
      window.removeEventListener(AUTH_CHANGE_EVENT, listener);
    };
  }

  clear(): void {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(ACCESS_TOKEN_KEY);
      window.localStorage.removeItem(REFRESH_TOKEN_KEY);
      window.localStorage.removeItem(USER_KEY);
      this.notifyChange();
    }
  }

  private notifyChange(): void {
    window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
  }

  private isExpired(token: string): boolean {
    try {
      const payload = JSON.parse(
        window.atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")),
      ) as { exp?: number };
      return typeof payload.exp === "number" && payload.exp * 1000 <= Date.now();
    } catch {
      return true;
    }
  }
}

export const tokenStorage = new TokenStorage();
