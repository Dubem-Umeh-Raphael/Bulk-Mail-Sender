import React, { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { SmtpTokenContext } from '../context/SmtpTokenContext';
import toast from 'react-hot-toast';

const PopupVerify = ({ isOpen, onClose }) => {
    const [token, setToken] = useState('');
    const [message, setMessage] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();
    const adminToken = import.meta.env.VITE_ADMIN_TOKEN;
    const { loginSmtp } = useContext(SmtpTokenContext);

    const handleVerify = async () => {
      setMessage('');
      setSuccess(false);

      if (!token.trim()) {
        toast.error('Please enter a valid token');
        setMessage('Please enter a valid token');
        setTimeout(() => {
          setMessage('')
        }, 2000);
        return;
      }

      setIsVerifying(true);

      try {
        await toast.promise(
          (async () => {
            let successMessage = '';
            setIsVerifying(true);

            // 👑 Admin token

            if (token === adminToken) {
              // console.log('👑 Attempting admin login...');
              loginSmtp(token, true);
              sessionStorage.setItem('admin_smtp_token', token);
              sessionStorage.setItem('admin_passkey', 'adminPass'); // ✅ Store admin passKey
              setSuccess(true);
              setMessage('Admin verified! Loading Dashboard...');
              successMessage = '👑 Admin Verified! Redirecting...';

              const redirectPath = sessionStorage.getItem('redirect_after_passkey') || '/admin';
              sessionStorage.removeItem('redirect_after_passkey');

              setTimeout(() => {
                onClose && onClose();
                navigate(redirectPath, { replace: true });
              }, 2000);

              return successMessage;
            }

            // 🔑 Regular passkey
            // console.log('🔑 Attempting passkey verification...');
            const response = await fetch(`https://bulk-mail-db-server.onrender.com/config/verify-passkey`, {
            // const response = await fetch(`http://localhost:4000/config/verify-passkey`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ passKey: token }),
            });

            if (!response.ok) {
              throw new Error('Server rejected passkey verification');
            }

            const data = await response.json();
            if (!data.success) {
              throw new Error(data.error || 'Invalid Token');
            }

            loginSmtp(token, false);
            sessionStorage.setItem('current_passkey', token);
            setSuccess(true);
            successMessage = '✅ Verified! Redirecting...';

            let intendedRedirect = sessionStorage.getItem('redirect_after_passkey');
            let finalRedirectPath = (intendedRedirect && intendedRedirect !== '/admin') ? intendedRedirect : '/smtps';
            sessionStorage.removeItem('redirect_after_passkey');

            setTimeout(() => {
              setIsVerifying(false);
              onClose && onClose();
              navigate(finalRedirectPath, { replace: true });
            }, 1200);

            return successMessage;
          })(),
          {
            loading: 'Verifying...',
            success: (msg) => msg, // ✅ Show returned success message
            error: (err) => err.message || 'Verification failed',
          }
        );

      } catch (err) {
        console.error('💥 Verification error:', err);
        setMessage(err.message || 'Verification failed');
        setToken('');
      } finally {
        setIsVerifying(false);
      }
  };


    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
          <motion.div
              className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md relative flex flex-col items-center mx-5"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
              <button
                  className="absolute top-4 right-4 text-gray-900 hover:text-red-500 font-bold focus:outline-none cursor-pointer bg-gray-400 p-0.5 rounded-full"
                  onClick={onClose}
                  disabled={isVerifying}
                  aria-label="Close"
              >
                  <X size={30} />
              </button>
              <h3 className="mb-3 text-3xl font-bold text-gray-900 text-center">Verify Access</h3>
              <label htmlFor="token" className="mb-2 text-lg font-semibold text-gray-900 w-full text-left">
                  Enter access passkey <span className="text-red-700 font-bold">*</span>
              </label>
              <input
                id="token"
                required
                type="text"
                placeholder="1234567890abcdefghij..."
                value={token}
                onChange={e => setToken(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !isVerifying && handleVerify()}
                disabled={isVerifying || success}
                className={`flex items-center w-full px-5 py-4 text-base font-medium outline-none mb-6 placeholder:text-gray-500 rounded-2xl ${
                    isVerifying || success
                        ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                        : 'focus:bg-gray-400 bg-gray-200 text-gray-900'
                }`}
              />
              <button
                onClick={handleVerify}
                type="button"
                disabled={isVerifying || success}
                className={`w-full cursor-pointer px-6 py-4 mb-3 text-sm font-bold leading-none text-white transition duration-300 rounded-2xl ${
                  isVerifying || success
                      ? 'bg-indigo-400 cursor-not-allowed opacity-70'
                      : 'bg-indigo-500 hover:bg-indigo-600'
                } focus:ring-4 focus:ring-indigo-300`}
              >
                  <span>{isVerifying ? 'Verifying...' : success ? 'Verified!' : 'Continue'}</span>
              </button>
                {message && (
                    <p className={`text-base mx-auto my-2 ${success ? 'text-green-600' : 'text-red-600'}`}>{message}</p>
                )}
                {isVerifying && (
                  <div className="mt-2 flex justify-center">
                      <span className="w-6 h-6 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin"></span>
                  </div>
                )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
};

export default PopupVerify;