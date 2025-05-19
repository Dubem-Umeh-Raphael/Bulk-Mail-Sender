import React, { useContext, useEffect, useState } from 'react';
import { Navigate, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import LoadToSIte from '../animations/LoadToSIte';

const ProtectedRoute = ({ children }) => {
  const { isLoggedIn, validateToken } = useContext(AuthContext);
  const [isValidating, setIsValidating] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggingOut, setIsLoggingOut] = useState(false); // Track logout state

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) {
          // Save current location before redirect
          sessionStorage.setItem('redirect_after_login', location.pathname);
          navigate('/dash', { replace: true });
          return;
        }

        const isValid = validateToken();
        if (!isValid) {
          sessionStorage.setItem('redirect_after_login', location.pathname);
          navigate('/dash', { replace: true });
        }
        setIsValidating(false);
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsValidating(false);
      }
    };

    checkAuth();
  }, [navigate, location, validateToken]);

  if (isValidating) {
    return <LoadToSIte loadText="Validating session..." />;
  }

  if (!isLoggedIn && !isLoggingOut) {
    return <Navigate to="/dash" state={{ from: location.pathname }} replace />;
  }

  return children;
};

export default ProtectedRoute;