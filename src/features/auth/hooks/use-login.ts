"use client";

import { useMutation } from "@tanstack/react-query";
import { authService } from "../api/auth.service";

export function useLogin() {
  return useMutation({
    mutationFn: authService.login.bind(authService),
  });
}
