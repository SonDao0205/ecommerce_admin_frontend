"use client";

import { useSyncExternalStore } from "react";
import { tokenStorage } from "./token-storage";

const subscribe = (listener: () => void) => tokenStorage.subscribe(listener);
const getAdminSnapshot = () => tokenStorage.hasAdminSession();
const getServerSnapshot = () => false;
const getHydratedSnapshot = () => true;

export function useAdminSession() {
  return useSyncExternalStore(subscribe, getAdminSnapshot, getServerSnapshot);
}

export function useHydrated() {
  return useSyncExternalStore(subscribe, getHydratedSnapshot, getServerSnapshot);
}
