import { createContext, useState, useMemo } from "react";

export const AuthContext = createContext({
  isLoggedIn: false,
  login: () => {},
  logout: () => {}
});

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return !!localStorage.getItem("auth_token");
  });

  const login = (token) => {
    localStorage.setItem("auth_token", token);
    setIsLoggedIn(true);
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    setIsLoggedIn(false);
  };

  const value = useMemo(() => ({
    isLoggedIn,
    login,
    logout
  }), [isLoggedIn]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;