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
          // Store the attempted route
          sessionStorage.setItem('intended_route', location.pathname);
          navigate('/', { replace: true });
          return;
        }

        const isValid = await validateToken();
        if (!isValid) {
          sessionStorage.setItem('intended_route', location.pathname);
          navigate('/', { replace: true });
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        sessionStorage.setItem('intended_route', location.pathname);
        navigate('/', { replace: true });
      } finally {
        setIsValidating(false);
      }
    };

    checkAuth();
  }, [navigate, location, validateToken]);

  if (isValidating) {
    return <LoadToSIte loadText="Verifying your session..." />;
  }

  return isLoggedIn ? children : <Navigate to="/" replace />;
};

export default ProtectedRoute;