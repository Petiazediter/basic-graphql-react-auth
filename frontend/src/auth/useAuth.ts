import { useApolloClient } from "@apollo/client";
import { useCallback, useEffect, useRef } from "react";

export function useAuth() {
  const client = useApolloClient();
  const isAuthenticated = useRef(!!localStorage.getItem('accessToken'));

  useEffect( () => {
    window.addEventListener('accessTokenChanged', handleLocalStorageChange)
    return () => {
      console.log('RemoveEventListener')
      window.removeEventListener('accessTokenChanged', handleLocalStorageChange)
    }
  }, [])

  const handleLocalStorageChange = () => {
    isAuthenticated.current = !!localStorage.getItem('accessToken');
    console.log('IAuthenticatedChanged', isAuthenticated.current);
  }

  const login = useCallback((token: string) => {
    localStorage.setItem("accessToken", token);
    client.resetStore();
  }, [client]);

  const logout = useCallback(() => {
    localStorage.removeItem("accessToken");
    client.resetStore();
  }, [client]);

  return {
    login,
    logout,
    isAuthenticated
  }
}