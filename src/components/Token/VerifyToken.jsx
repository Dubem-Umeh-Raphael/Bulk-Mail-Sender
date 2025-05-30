import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const VerifyToken = () => {
  const [token, setToken] = useState('');
  const [message, setMessage] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleContinue = async () => {
    if (!token.trim()) {
      toast.error('Please enter a valid token');
      setMessage('Please enter a valid token');
      setTimeout(() => {
        setMessage('')
      }, 2000);
      return;
    }
    
    try {
      await toast.promise(
        (async () => {
          setIsVerifying(true);
          setMessage('Verifying token...');
          
          const response = await fetch(`https://bulk-mail-server-qa9a.onrender.com/api/verify`, {
          // const response = await fetch('http://localhost:5000/api/verify', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'x-auth-token': token
            },
            mode: 'cors'
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          
          if (data.success) {
            login(token);
            setMessage('Token verified! Redirecting...');
            
            // Get saved redirect path or default to /send-mail
            const redirectPath = sessionStorage.getItem('redirect_after_login') || '/send-mail';
            sessionStorage.removeItem('redirect_after_login'); // Clean up
            navigate(redirectPath, { replace: true });
          } else {
            throw new Error(data.error || 'Invalid token');
          }
        })(),
        {
          loading: 'Verifying token...',
          success: 'Token verified! Redirecting...',
          error: 'Token verification failed. Please try again.',
        }
      );
    } catch (error) {
      console.error('Verification error:', error);
      // setMessage(
      //   error.message === 'Failed to fetch'
      //     ? 'Failed to connect to the server. Please check your network connection and the server status.'
      //     : error.message || 'Token verification failed'
      // );
      setMessage('Token verification Failed');
      setTimeout(() => {
        setToken('');
      }, 2000);
    } finally {
      setIsVerifying(false);
      setTimeout(() => {
        setMessage('');
        // setToken('')
      }, 2000)
    }
  };

  return (
    <div className="w-full h-full overflow-y-hidden mt-1">
      <div className="flex justify-center items-center w-full">
        <section id='Token-verification' className="flex flex-col w-full bg-white rounded-3xl">
          <h3 className="mb-3 text-3xl text-center font-bold text-gray-900">Verify Token</h3>
          {/* <div> */}
            <label htmlFor="text" className='mb-2 text-lg text-start font-semibold text-gray-900'>
              Enter token to verify <span className='text-red-700 font-bold'>*</span>
            </label>
            <input 
              id='token' 
              style={{ marginTop: '5px' }}
              required 
              type="text" 
              placeholder='1234567890abcdefghij...' 
              value={token}
              onChange={(e) => setToken(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !isVerifying && handleContinue()}
              disabled={isVerifying}
              className={`flex items-center w-full px-5 py-4 mr-2 text-base font-medium outline-none mb-5 placeholder:text-gray-500 rounded-2xl ${
                isVerifying ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'focus:bg-gray-400 bg-gray-200 text-gray-900'
              }`} />

            <button 
              onClick={handleContinue}
              type="button"
              disabled={isVerifying}
              className={`w-full cursor-pointer mx-auto px-6 py-5 mb-2 text-sm font-bold leading-none text-white transition duration-300 rounded-2xl 
                ${isVerifying ? 'bg-indigo-400 cursor-not-allowed opacity-70' : 'bg-indigo-500 hover:bg-indigo-600'} 
                focus:ring-4 focus:ring-indigo-300`}>
              <span>{isVerifying ? 'Verifying...' : 'Continue'}</span>
            </button>
            
            <span>
              {message && <p className='text-base text-red-600 mx-auto mt-2'>{message}</p>}
            </span>
            {isVerifying && (
              <div className="mt-2 flex justify-center">
                  <span className="w-6 h-6 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin"></span>
              </div>
            )}
          {/* </div> */}
        </section>
      </div>
    </div>
  )
}

export default VerifyToken;