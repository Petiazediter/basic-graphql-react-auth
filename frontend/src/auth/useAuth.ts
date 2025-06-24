import { useApolloClient } from "@apollo/client";
import { useCallback } from "react";

export function useAuth() {
  const client = useApolloClient();

  const login = useCallback((token: string) => {
    localStorage.setItem("accessToken", token);
    client.clearStore();
  }, [client]);

  const logout = useCallback(() => {
    localStorage.removeItem("accessToken");
    client.clearStore();
  }, [client]);

  const isAuthenticated = useCallback(() => {
    return !!localStorage.getItem("accessToken");
  }, []);

  return {
    login,
    logout,
    isAuthenticated
  }
}