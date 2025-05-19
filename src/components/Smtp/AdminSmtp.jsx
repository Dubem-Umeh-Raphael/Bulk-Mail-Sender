import React, { useEffect, useState, useContext } from 'react';
import PopUp from '../../animations/PopUp';
import AddSmtp from './AddSmtp';
import { useNavigate } from 'react-router-dom';
import { SmtpTokenContext } from '../../context/SmtpTokenContext';
import PopupVerify from '../../animations/PopupVerify';
import { X } from 'lucide-react';

const AdminSmtp = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [smtpList, setSmtpList] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [editData, setEditData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showVerify, setShowVerify] = useState(false);
  const [message, setMessage] = useState('');
  const { logoutSmtp } = useContext(SmtpTokenContext);
  const navigate = useNavigate();
  const [showPasskeyPopup, setShowPasskeyPopup] = useState(false);
  const [passKeyInput, setPassKeyInput] = useState('');
  const [passKeys, setPassKeys] = useState([]);

  // Fetch all SMTP configs (admin only)
  useEffect(() => {
    const fetchConfigs = async () => {
      setLoading(true);
      setMessage('');
      try {
        // Backend endpoint returns [{smtp_user, smtp_pass, smtp_host, smtp_from, smtpToken}]
        const adminToken = sessionStorage.getItem('admin_smtp_token');
        if (!adminToken) {
          setShowVerify(true);
          setLoading(false);
          return;
        }
        const res = await fetch(`https://bulk-mail-db-server.onrender.com/config/all`, {
        // const res = await fetch(`http://localhost:4000/config/all`, {
          headers: { 'x-admin-token': adminToken }
        });
        if (!res.ok) throw new Error('Failed to fetch configs');
        const data = await res.json();
        setSmtpList(data.data || []);
      } catch (err) {
        setMessage('Failed to load SMTP configs.');
      } finally {
        setLoading(false);
      }
    };
    fetchConfigs();
  }, []);

  // Fetch passkeys from the dedicated passkeys table
  useEffect(() => {
    const fetchPassKeys = async () => {
      try {
        const adminToken = sessionStorage.getItem('admin_smtp_token');
        if (!adminToken) return;
        
        const res = await fetch('https://bulk-mail-db-server.onrender.com/config/passkeys', {
        // const res = await fetch('http://localhost:4000/config/passkeys', {
          headers: { 'x-admin-token': adminToken }
        });
        
        if (!res.ok) throw new Error('Failed to fetch passkeys');
        const data = await res.json();
        setPassKeys(data.passkeys || []);
      } catch (err) {
        console.error('Error fetching passkeys:', err);
        setMessage('Failed to load passkeys');
      }
    };
    fetchPassKeys();
  }, []);

  const handleAddClick = () => {
    setEditIndex(null);
    setEditData(null);
    setShowPopup(true);
  };

  const handleEditClick = (data, idx) => {
    setEditIndex(idx);
    setEditData(data);
    setShowPopup(true);
  };

  // Save handler for AddSmtp
  const handleSave = async (smtpData, idx) => {
    setLoading(true);
    setMessage('');
    try {
      const adminToken = sessionStorage.getItem('admin_smtp_token');
      if (!adminToken) {
        setShowVerify(true);
        setLoading(false);
        return;
      }
      // Save or update config
      const payload = {
        smtpToken: smtpData.token || adminToken,
        smtpUser: smtpData.user,
        smtpPass: smtpData.pass,
        smtpHost: smtpData.host,
        smtpFrom: smtpData.from
      };
      const url = `https://bulk-mail-db-server.onrender.com/config/save-config`;
      // const url = `http://localhost:4000/config/save-config`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': adminToken },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Failed to save config');
      // Refresh list
      const refreshed = await fetch(`https://bulk-mail-db-server.onrender.com/config/all`, {
      // const refreshed = await fetch(`http://localhost:4000/config/all`, {
        headers: { 'x-admin-token': adminToken }
      });
      const data = await refreshed.json();
      setSmtpList(data.data || []);
      setShowPopup(false);
    } catch (err) {
      setMessage('Failed to save SMTP config.');
    } finally {
      setLoading(false);
    }
    setShowPopup(false);
  };

  // Delete SMTP config
  const handleDelete = async (id) => {
    setLoading(true);
    setMessage('');
    try {
      const adminToken = sessionStorage.getItem('admin_smtp_token');
      if (!adminToken) {
        setShowVerify(true);
        setLoading(false);
        return;
      }
      const res = await fetch(`https://bulk-mail-db-server.onrender.com/config/${id}`, {
      // const res = await fetch(`http://localhost:4000/config/${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-token': adminToken }
      });
      if (!res.ok) throw new Error('Failed to delete config');
      setSmtpList(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      setMessage('Failed to delete SMTP config.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logoutSmtp();
    navigate('/dash');
  };

  // Add a new passkey
  const handleAddPassKey = async () => {
    if (!passKeyInput.trim()) return;
    setMessage('');
    setLoading(true);
    try {
      const adminToken = sessionStorage.getItem('admin_smtp_token');
      if (!adminToken) {
        setShowVerify(true);
        setLoading(false);
        return;
      }

      const response = await fetch('https://bulk-mail-db-server.onrender.com/config/passkeys', {
      // const response = await fetch('http://localhost:4000/config/passkeys', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-admin-token': adminToken 
        },
        body: JSON.stringify({ passKey: passKeyInput.trim() })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add passkey');
      }

      // Refresh passkeys list
      const refreshed = await fetch('https://bulk-mail-db-server.onrender.com/config/passkeys', {
      // const refreshed = await fetch('http://localhost:4000/config/passkeys', {
        headers: { 'x-admin-token': adminToken }
      });
      const data = await refreshed.json();
      setPassKeys(data.passkeys || []);
      
      setPassKeyInput('');
      setShowPasskeyPopup(false);
      setMessage('Passkey added successfully');
    } catch (err) {
      setMessage(err.message || 'Failed to add passkey');
    } finally {
      setLoading(false);
    }
  };

  // Delete a passkey
  const handleDeletePassKey = async (key) => {
    setLoading(true);
    try {
      const adminToken = sessionStorage.getItem('admin_smtp_token');
      if (!adminToken) {
        setShowVerify(true);
        setLoading(false);
        return;
      }

      const response = await fetch(`https://bulk-mail-db-server.onrender.com/config/passkeys/${encodeURIComponent(key)}`, {
      // const response = await fetch(`http://localhost:4000/config/passkeys/${encodeURIComponent(key)}`, {
        method: 'DELETE',
        headers: { 'x-admin-token': adminToken }
      });

      if (!response.ok) {
        throw new Error('Failed to delete passkey');
      }

      setPassKeys(prev => prev.filter(k => k !== key));
      setMessage('Passkey deleted successfully');
    } catch (err) {
      setMessage(err.message || 'Failed to delete passkey');
    } finally {
      setLoading(false);
      setMessage('');
    }
  };

  // Map backend fields to AddSmtp fields
  const mapBackendToForm = (item) => ({
    host: item.smtp_host,
    user: item.smtp_user,
    pass: item.smtp_pass,
    from: item.smtp_from,
    smtpToken: item.token,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-300 to-blue-300 flex flex-col items-center justify-center px-4 py-10 relative">
      <button onClick={handleLogout} className='p-3 bg-red-500 hover:bg-red-600 transition duration-200 w-fit rounded-xl text-base text-gray-50 absolute top-3 left-3 cursor-pointer'>Go Back</button>
      <div className="max-w-2xl min-w-[320px] md:min-w-[500px] bg-white rounded-3xl shadow-2xl p-8 mb-8 relative top-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">Admin: All SMTP Accounts</h2>
        <p className="text-lg text-gray-700 mb-5 text-center">
          View, add, edit, or remove any SMTP credentials in the system.
        </p>
        <div className="flex justify-center mb-6 gap-4">
          <button
            onClick={handleAddClick}
            className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 px-8 rounded-xl transition duration-200 text-center shadow-md shadow-indigo-200 text-lg cursor-pointer"
          >
            Add SMTP
          </button>
          <button
            onClick={() => setShowPasskeyPopup(true)}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-xl transition duration-200 text-center shadow-md shadow-green-200 text-lg cursor-pointer"
          >
            Add Passkey
          </button>
        </div>
        {/* Passkey list */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Existing Passkeys</h3>
          <div className="flex flex-wrap gap-2">
            {passKeys.length === 0 ? (
              <span className="text-gray-500">No passkeys yet.</span>
            ) : (
              passKeys.map((key, idx) => (
                <span key={idx} className="bg-gray-200 px-3 py-1 rounded-xl text-gray-700 text-sm flex items-center gap-1">
                  {key}
                  <button
                    onClick={() => handleDeletePassKey(key)}
                    className="ml-1 text-red-500 hover:text-red-700 focus:outline-none"
                    title="Delete passkey"
                    disabled={loading}
                  >
                    <X size={16} />
                  </button>
                </span>
              ))
            )}
          </div>
        </div>
        {loading ? (
          <div className="text-center text-gray-500 py-8">Loading...</div>
        ) : smtpList.length === 0 ? (
          <div className="bg-gray-100 rounded-xl p-6 text-center text-gray-500 text-base">
            No SMTP accounts found.
          </div>
        ) : (
          <div className="space-y-4">
            {smtpList.map((smtp, idx) => (
              <div key={smtp.id || idx} className="flex flex-col md:flex-row items-center justify-between bg-gray-300 rounded-xl p-4 shadow">
                <div className="flex-1 text-left">
                  <div className="font-semibold text-gray-800">Pass Key: {smtp.pass_key}</div>
                  <div className="text-gray-600 text-sm">Token: {smtp.smtp_token}</div>
                  <div className="text-gray-600 text-sm">User: {smtp.smtp_user}</div>
                  <div className="text-gray-600 text-sm">From: {smtp.smtp_from}</div>
                  <div className="text-gray-600 text-sm">Pass: {smtp.smtp_pass}</div>
                  <div className="text-gray-600 text-sm">Host: {smtp.smtp_host}</div>
                </div>
                <div className="flex flex-row gap-2 mt-3 md:mt-0 md:ml-4">
                  <button
                    onClick={() => handleEditClick(mapBackendToForm(smtp), idx)}
                    className="bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-2 px-6 rounded-xl transition duration-200 text-center shadow-md shadow-yellow-100 text-base cursor-pointer"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(smtp.id)}
                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-xl transition duration-200 text-center shadow-md shadow-red-100 text-base cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        {message && <div className="text-center text-red-600">{message}</div>}
      </div>
      <PopUp isOpen={showPopup} onClose={() => setShowPopup(false)}>
        <div className="w-full flex flex-col items-center justify-center">
          <div className="w-full max-w-[320px] md:max-w-[500px] mt-4">
            <AddSmtp
              onClose={() => setShowPopup(false)}
              onSave={handleSave}
              editData={editData}
              editIndex={editIndex}
              showTokenField={true}
            />
          </div>
        </div>
      </PopUp>
      {/* Passkey popup */}
      <PopUp isOpen={showPasskeyPopup} onClose={() => setShowPasskeyPopup(false)}>
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-[350px] relative flex flex-col items-center"
          >
            <div className="w-full">
              <button
                className="absolute top-4 right-4 text-gray-900 hover:text-red-500 font-bold focus:outline-none cursor-pointer"
                onClick={() => setShowPasskeyPopup(false)}
                aria-label="Close"
                type="button"
                disabled={loading}
              >
                <X size={30} />
              </button>
              <div className='relative top-2'>
                <h3 className="mb-3 text-2xl md:text-3xl font-bold text-gray-900 text-center">Add New Passkey</h3>
                <label htmlFor="passkey" className="mb-2 text-lg font-semibold text-gray-900 w-full text-left">
                  Enter a new passkey <span className="text-red-700 font-bold">*</span>
                </label>
                <input
                  id="passkey"
                  required
                  type="text"
                  placeholder="Enter new passkey"
                  value={passKeyInput}
                  onChange={e => setPassKeyInput(e.target.value)}
                  disabled={loading}
                  className={`flex items-center w-full px-5 py-4 text-base font-medium outline-none mb-6 placeholder:text-gray-500 rounded-2xl ${
                    loading
                      ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                      : 'focus:bg-gray-400 bg-gray-200 text-gray-900'
                  }`}
                />
                <button
                  onClick={handleAddPassKey}
                  disabled={loading || !passKeyInput.trim()}
                  className={`w-full cursor-pointer px-6 py-4 mb-3 text-sm font-bold leading-none text-white transition duration-300 rounded-2xl ${
                    loading
                      ? 'bg-green-400 cursor-not-allowed opacity-70'
                      : 'bg-green-500 hover:bg-green-600'
                  } focus:ring-4 focus:ring-green-300`}
                >
                  <span>{loading ? 'Adding...' : 'Add Passkey'}</span>
                </button>
                {message && (
                  <p className={`text-base mx-auto my-2 ${message.includes('added') ? 'text-green-600' : 'text-red-600'}`}>{message}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </PopUp>
      <PopupVerify isOpen={showVerify} onClose={() => setShowVerify(false)} />
    </div>
  );
};

export default AdminSmtp;