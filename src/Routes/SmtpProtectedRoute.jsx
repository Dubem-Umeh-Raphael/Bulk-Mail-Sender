import React, { useContext, useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { SmtpTokenContext } from "../context/SmtpTokenContext";
import LoadToSIte from '../animations/LoadToSIte';

const SmtpProtectedRoute = ({ children }) => {    const { isLoggedIn, validateSmtpToken } = useContext(SmtpTokenContext);
    const [isValidating, setIsValidating] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const passkey = sessionStorage.getItem('current_passkey');
                const adminPass = sessionStorage.getItem('admin_smtp_token');

                // Need either a passkey or an admin token, not necessarily both
                if (!passkey && !adminPass) {
                    // Save current location before redirect
                    console.log('no passkey provided: ', (passkey, adminPass));
                    sessionStorage.setItem('redirect_after_passkey', location.pathname);
                    navigate('/dash', { replace: true });
                    return;
                }

                const isValid = await validateSmtpToken();

                if (!isValid) {
                    sessionStorage.setItem('redirect_after_passkey', location.pathname);
                    navigate('/dash', { replace: true });
                    return;
                }
                setIsValidating(false);
            } catch (error) {
                console.error('Auth Check failed', error);
            }
        };

        checkAuth();
    }, [navigate, location, validateSmtpToken]);

    if (isValidating) {
        return <LoadToSIte loadText="Validating access..." />;
    }

    if (!isLoggedIn && !isLoggingOut) {
        console.log('Access denied, redirecting to dash');
        return <Navigate to="/dash" state={{ from: location.pathname }} replace />;
    }

    return children;
};

export default SmtpProtectedRoute;