import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const VerifyToken = () => {
  const [token, setToken] = useState('');
  const [message, setMessage] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleContinue = async () => {
    if (!token.trim()) {
      setMessage('Please enter a valid token');
      return;
    }
    
    try {
      setIsVerifying(true);
      setMessage('Verifying token...');
      
      const response = await fetch('http://localhost:5000/api/verify', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        }
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        login(token);
        setMessage('Token verified! Redirecting...');
        setTimeout(() => navigate('/send-mail'), 1000);
      } else {
        throw new Error(data.error || 'Invalid token');
      }
    } catch (error) {
      setMessage(error.message || 'Token verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen w-full overflow-y-auto px-4 bg-[#e2d8d8]"> {/* Modified container */}
      <div className="container mx-auto py-[146px] h-full">
        <div className="flex justify-center items-center w-full">
          <div className="w-full max-w-lg">
            <section id='Token-verification' className="flex flex-col w-full bg-white rounded-3xl p-6">
              <h3 className="mb-3 text-4xl font-bold text-gray-900">Verify Token</h3>

              <div>
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
                  onKeyDown={(e) => e.key === 'Enter' && handleContinue()}
                  className="flex items-center w-full px-5 py-4 mr-2 text-base font-medium outline-none focus:bg-gray-400 mb-7 placeholder:text-gray-500 bg-gray-200 text-gray-900 rounded-2xl" />

                <button 
                  onClick={handleContinue}
                  type="button"
                  disabled={isVerifying}
                  className={`w-full cursor-pointer mx-auto px-6 py-5 mb-5 text-sm font-bold leading-none text-white transition duration-300 rounded-2xl 
                    ${isVerifying ? 'bg-purple-400 cursor-not-allowed' : 'bg-purple-500 hover:bg-purple-600'} 
                    focus:ring-4 focus:ring-purple-300`}>
                  <span>{isVerifying ? 'Verifying...' : 'Continue'}</span>
                </button>
                
                <span>
                  {message && <p className='text-base text-red-600 mx-auto my-3'>{message}</p>}
                </span>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VerifyToken;