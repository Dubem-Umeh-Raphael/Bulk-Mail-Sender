import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const AddSmtp = ({ onClose, onSave, editData, editIndex, showTokenField = true }) => {
  const [host, setHost] = useState('');
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [from, setFrom] = useState('');
  const [token, setToken] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  // Remove passKey state
  // const [passKey, setPassKey] = useState('');

  // const compact = showTokenField || false;

  useEffect(() => {
    if (editData) {
      setHost(editData.host || '');
      setUser(editData.user || '');
      setPass(editData.pass || '');
      setFrom(editData.from || '');
      setToken(editData.token || '');
      // Remove setPassKey(editData.passKey || '');
    } else {
      setHost(''); setUser(''); setPass(''); setFrom(''); setToken('');
      // Remove setPassKey('');
    }
  }, [editData]);

  const handleAddSmtp = async () => {
    // Remove passKey check
    if (!host.trim() || !user.trim() || !pass.trim() || !from.trim() || (showTokenField && !token.trim())) {
      setMessage('Please fill in all fields.');
      return;
    }
    setIsSubmitting(true);
    setMessage(editIndex !== null ? 'Updating SMTP credentials...' : 'Adding SMTP credentials...');
    try {
      const smtp_token = localStorage.getItem('smtp_token');
      const payload = {
        smtpToken: token || smtp_token,
        smtpUser: user,
        smtpPass: pass,
        smtpHost: host,
        smtpFrom: from,
      };
      console.log('Payload being sent:', payload);
      const response = await fetch('https://bulk-mail-db-server.onrender.com/config/save-config', {
      // const response = await fetch('http://localhost:4000/config/save-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save SMTP credentials');
      }

      const responseData = await response.json();
      console.log('Response from backend:', responseData);

      setMessage(responseData.message || 'SMTP credentials saved successfully!');
      if (onSave) {
        onSave({ host, user, pass, from, token }, editIndex);
      }
    } catch (err) {
      console.error('Error saving SMTP credentials:', err);
      setMessage(err.message || 'Failed to save SMTP credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`w-full h-full overflow-y-auto bg-white rounded-3xl px-6 py-2 shadow-2xl flex flex-col items-center justify-center relative`}>
      {/* <div className={`${ compact ? 'pb-5' : '' }`}> */}
      <div>
        <button
          className={`absolute top-4 right-4 text-gray-200 hover:text-gray-50 font-bold focus:outline-none cursor-pointer rounded-full bg-gray-600 hover:bg-red-600 transition duration-200`}
          onClick={onClose}
          aria-label="Close"
          type="button"
        >
          <X size={30} />
        </button>
      </div>
      <div className='w-full h-full mt-5 overflow-y-auto'>
        <h3 className={`mb-3 text-lg md:text-3xl font-bold text-gray-900 text-center`}>{editIndex !== null ? 'Edit SMTP' : 'Add SMTP'}</h3>
        <div className="w-full">
          {showTokenField && (
            <>
              <label htmlFor="token" className={`mb-2 text-lg text-start font-semibold text-gray-900`}>
                Token <span className="text-red-700 font-bold">*</span> <span className='text-xs md:text-sm ml-1.5 text-gray-600'>This Will Be Your Send Mail Token</span>
              </label>
              <input
                id="token"
                required
                type="text"
                placeholder="Unique token for this SMTP"
                value={token}
                onChange={e => setToken(e.target.value)}
                disabled={isSubmitting}
                className={`flex items-center w-full px-5 py-3 text-base font-medium outline-none mb-3 placeholder:text-gray-500 rounded-2xl ${
                  isSubmitting ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'focus:bg-gray-400 bg-gray-200 text-gray-900'
                }`}
              />
            </>
          )}
          <label htmlFor="host" className={`mb-2 text-lg text-start font-semibold text-gray-900`}>
            Host <span className="text-red-700 font-bold">*</span>
          </label>
          <input
            id="host"
            required
            type="text"
            placeholder="smtp.example.com"
            value={host}
            onChange={e => setHost(e.target.value)}
            disabled={isSubmitting}
            className={`flex items-center w-full px-5 py-3 text-base font-medium outline-none mb-3 placeholder:text-gray-500 rounded-2xl ${
              isSubmitting ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'focus:bg-gray-400 bg-gray-200 text-gray-900'
            }`}
          />
          <label htmlFor="user" className={`mb-2 text-lg text-start font-semibold text-gray-900`}>
            User <span className="text-red-700 font-bold">*</span>
          </label>
          <input
            id="user"
            required
            type="text"
            placeholder="user@example.com"
            value={user}
            onChange={e => setUser(e.target.value)}
            disabled={isSubmitting}
            className={`flex items-center w-full px-5 py-3 text-base font-medium outline-none mb-3 placeholder:text-gray-500 rounded-2xl ${
              isSubmitting ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'focus:bg-gray-400 bg-gray-200 text-gray-900'
            }`}
          />
          <label htmlFor="pass" className={`mb-2 text-lg text-start font-semibold text-gray-900`}>
            Pass <span className="text-red-700 font-bold">*</span>
          </label>
          <input
            id="pass"
            required
            type="text"
            placeholder="SMTP password"
            value={pass}
            onChange={e => setPass(e.target.value)}
            disabled={isSubmitting}
            className={`flex items-center w-full px-5 py-3 text-base font-medium outline-none mb-3 placeholder:text-gray-500 rounded-2xl ${
              isSubmitting ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'focus:bg-gray-400 bg-gray-200 text-gray-900'
            }`}
          />
          <label htmlFor="from" className={`mb-2 text-lg text-start font-semibold text-gray-900`}>
            From <span className="text-red-700 font-bold">*</span>
          </label>
          <input
            id="from"
            required
            type="text"
            placeholder="from@example.com"
            value={from}
            onChange={e => setFrom(e.target.value)}
            disabled={isSubmitting}
            className={`flex items-center w-full px-5 py-3 text-base font-medium outline-none mb-5 placeholder:text-gray-500 rounded-2xl ${
              isSubmitting ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'focus:bg-gray-400 bg-gray-200 text-gray-900'
            }`}
          />
          {/* Removed Add Passkey UI */}
          {/* Removed passkey input */}
          <button
            onClick={handleAddSmtp}
            type="button"
            disabled={isSubmitting}
            className={`w-full cursor-pointer mx-auto px-6 py-4 mb-2 text-sm font-bold leading-none text-white transition duration-300 rounded-2xl
              ${isSubmitting ? 'bg-indigo-400 cursor-not-allowed opacity-70' : 'bg-indigo-500 hover:bg-indigo-700'}
              focus:ring-4 focus:ring-indigo-300`}
          >
            <span>{isSubmitting ? (editIndex !== null ? 'Updating...' : 'Adding...') : (editIndex !== null ? 'Update SMTP' : 'Add SMTP')}</span>
          </button>
          <span>
            {message && <p className="text-base text-red-600 mx-auto">{message}</p>}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AddSmtp;