import { BaseApiService, httpClient } from "@/src/core/api";
import { tokenStorage } from "@/src/core/auth/token-storage";
import type { LoginPayload, LoginResponse } from "../types/auth";

export class AuthService extends BaseApiService {
  constructor() {
    super(httpClient, "/auth");
  }

  async login(payload: LoginPayload): Promise<LoginResponse> {
    const session = await this.post<LoginResponse>("login", payload, {
      skipAuth: true,
    });

    tokenStorage.setSession(
      session.accessToken,
      session.refreshToken,
      session.user,
    );

    return session;
  }

  logout(): void {
    tokenStorage.clear();
  }
}

export const authService = new AuthService();
