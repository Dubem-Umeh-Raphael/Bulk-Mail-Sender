import { createContext, useState, useMemo, useEffect } from "react";

export const SmtpTokenContext = createContext({
    isLoggedIn: false,
    loginSmtp: () => {},
    logoutSmtp: () => {},
    validateSmtpToken: () => {}
});

export const SmtpTokenProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(() => {
        const adminToken = sessionStorage.getItem("admin_smtp_token");
        const passkey = sessionStorage.getItem("current_passkey");
        return !!(adminToken || passkey);
    });

    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === 'admin_smtp_token' || e.key === 'current_passkey') {
                setIsLoggedIn(!!e.newValue);
            }
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const validateSmtpToken = async () => {
        try {
            const storedAdminToken = sessionStorage.getItem("admin_smtp_token");
            const passkey = sessionStorage.getItem("current_passkey");

            // console.log('🔄 validateSmtpToken - checking tokens:', { storedAdminToken, passkey });

            let isValid = false;

            // Check passkey first
            if (passkey) {
                const response = await fetch('https://bulk-mail-db-server.onrender.com/config/verify-passkey', {
                // const response = await fetch('http://localhost:4000/config/verify-passkey', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ passKey: passkey })
                });

                const data = await response.json();
                // console.log('📥 Passkey validation response:', data);

                if (response.ok && data.success) {
                    console.log('✅ Passkey validated successfully');
                    return isValid = true;
                }
            }

            // Then check admin token
            if (storedAdminToken && storedAdminToken === import.meta.env.VITE_ADMIN_TOKEN) {
                console.log('✅ Admin token validated successfully');
                return isValid = true;
            } else {
                console.log('❌ No valid tokens found');
                return isValid = false;
            }

        } catch (err) {
            console.error('💥 Token validation error:', err);
        }
    };    const loginSmtp = (token, asPasskey = false) => {
        if (asPasskey) {
            // console.log('💾 Storing passkey:', token);
            sessionStorage.setItem("current_passkey", token);
            setIsLoggedIn(true);
        } else if (token === import.meta.env.VITE_ADMIN_TOKEN) {
            console.log('💾 Storing admin token');
            // sessionStorage.setItem("admin_smtp_token", token);
            setIsLoggedIn(true);
        } else {
            console.error('❌ Invalid token type');
            return false;
        }
    };

    const logoutSmtp = () => {
        sessionStorage.removeItem("admin_smtp_token");
        sessionStorage.removeItem("current_passkey");
        setIsLoggedIn(false);
    };

    const value = useMemo(() => ({
        isLoggedIn,
        loginSmtp,
        logoutSmtp,
        validateSmtpToken,
    }), [isLoggedIn]);

    return (
        <SmtpTokenContext.Provider value={value}>
            {children}
        </SmtpTokenContext.Provider>
    );
};

export default SmtpTokenProvider;