import { createContext, useState, useMemo, useEffect } from "react";
import axios from 'axios';

export const AuthContext = createContext({
  isLoggedIn: false,
  emailHistory: [],
  messageHistory: [],
  login: () => {},
  logout: () => {},
  validateToken: () => {},
  refreshHistory: () => {}
});

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const token = localStorage.getItem("auth_token");
    return !!token;
  });

  // Add localStorage event listener for cross-tab sync
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'auth_token') {
        setIsLoggedIn(!!e.newValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const [emailHistory, setEmailHistory] = useState([]);
  const [messageHistory, setMessageHistory] = useState([]);

  const validateToken = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        setIsLoggedIn(false);
        return false;
      }

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/verify`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        }
      });

      const isValid = response.ok;
      setIsLoggedIn(isValid);
      return isValid;
    } catch (error) {
      console.error('Token validation error:', error);
      setIsLoggedIn(false);
      return false;
    }
  };

  const refreshHistory = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) return;

      const response = await axios.get(`https://bulk-mail-db-server.onrender.com/message-history?token=${token}`);
      const allMessages = response.data;
      const uniqueEmails = [...new Set(allMessages.map(msg => msg.email))];
      setEmailHistory(uniqueEmails);
      setMessageHistory(allMessages);
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  useEffect(() => {
    // Validate token on mount and every 5 minutes
    validateToken();
    const interval = setInterval(validateToken, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

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
    emailHistory,
    messageHistory,
    login,
    logout,
    validateToken,
    refreshHistory
  }), [isLoggedIn, emailHistory, messageHistory]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;