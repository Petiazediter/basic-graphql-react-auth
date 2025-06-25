import { createContext, useContext, useEffect, useState } from "react"

type AuthContextParams = {
  isAuthenticated: boolean;
  login: (token: string) => void;
}

const AuthContext = createContext<AuthContextParams | null>(null);

export const AuthContextProvider = (props: React.PropsWithChildren) => {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('accessToken'));
  
  useEffect( () => {
    window.addEventListener('accessTokenChanged', handleLocalStorageChange)
    return () => {
      window.removeEventListener('accessTokenChanged', handleLocalStorageChange)
    }
  }, []);

  const login = (token: string) => {
    localStorage.setItem('accessToken', token);
    window.dispatchEvent(new Event('accessTokenChanged'));
  }

  const handleLocalStorageChange = () => {
    setIsAuthenticated(!!localStorage.getItem('accessToken'));
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login }}>
      {props.children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthContextProvider');
  }
  return context;
}

export default AuthContext;