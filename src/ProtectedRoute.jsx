import React, { useContext, useEffect, useState } from 'react'
import { Navigate, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";
import LoadToSIte from './animations/LoadToSIte';

const ProtectedRoute = ({ children }) => {
  const { isLoggedIn, validateToken } = useContext(AuthContext);
  const [isValidating, setIsValidating] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) {
          // Save current location before redirect
          sessionStorage.setItem('redirect_after_login', location.pathname);
          navigate('/verify', { replace: true });
          return;
        }

        const isValid = await validateToken();
        if (!isValid) {
          sessionStorage.setItem('redirect_after_login', location.pathname);
          navigate('/verify', { replace: true });
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

  if (!isLoggedIn) {
    return <Navigate to="/verify" state={{ from: location.pathname }} replace />;
  }

  return children;
};

export default ProtectedRoute;