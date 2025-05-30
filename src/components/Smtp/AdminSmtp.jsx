import React, { useEffect, useState, useContext } from 'react';
import PopUp from '../../animations/PopUp';
import AddSmtp from './AddSmtp';
import { useNavigate } from 'react-router-dom';
import { SmtpTokenContext } from '../../context/SmtpTokenContext';
import PopupVerify from '../../animations/PopupVerify';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';

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
  const [passkeyMessage, setPasskeyMessage] = useState('');
  const [passkeyLoading, setPasskeyLoading] = useState(false);
  // const [showDeletePopup, setShowDeletePopup] = useState(false);
  // const [smtpToDeleteId, setSmtpToDeleteId] = useState(null);
  // const [isDeletingSmtp, setIsDeletingSmtp] = useState(false);

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
      const passKey = sessionStorage.getItem('admin_passkey')

      const payload = {
        smtpToken: smtpData.token || adminToken,
        smtpUser: smtpData.user,
        smtpPass: smtpData.pass,
        smtpHost: smtpData.host,
        smtpFrom: smtpData.from,
        passKey: passKey,
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
  const handleDelete = async (smtpToken) => {
    setLoading(true);
    setMessage('');
    try {
      const adminToken = sessionStorage.getItem('admin_smtp_token');
      if (!adminToken) {
        setShowVerify(true);
        setLoading(false);
        return;
      }
      await toast.promise(
        (async () => {
          // const res = await fetch(`http://localhost:4000/config/${smtpToken}`, {
          const res = await fetch(`https://bulk-mail-db-server.onrender.com/config/${smtpToken}`, {
            method: 'DELETE',
            headers: { 'x-admin-token': adminToken }
          });
          if (!res.ok) throw new Error('Failed to delete config');
          setSmtpList(prev => prev.filter(item => item.smtp_token !== smtpToken));
        })(),
        {
          loading: 'Deleting SMTP...',
          success: 'SMTP deleted successfully!',
          error: 'Failed to delete SMTP!'
        }
      );
    } catch (err) {
      setMessage('Failed to delete SMTP config.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logoutSmtp();
    navigate('/dash');
    // sessionStorage.removeItem('admin_passkey');
    // sessionStorage.removeItem('admin_smtp_token');
    // sessionStorage.removeItem('redirect_after_passkey');
  };

  // Add a new passkey
  const handleAddPassKey = async () => {
    // console.log('Passkey was clicked')

    setPasskeyLoading(true);
    // setMessage('');

    if (!passKeyInput.trim()) {
      setPasskeyLoading(false);
      toast.error('Passkey cannot be empty');
      setPasskeyMessage('Passkey cannot be empty');
      setTimeout(() => {
        setPasskeyMessage('');
        // console.log('message cleared!')
      }, 2000);
      return;
    };

    const passkeyExists = passKeys.some(key => key === passKeyInput.trim());
    if (passkeyExists) {
      setPassKeyInput('');
      toast.error('Passkey already exists');
      setPasskeyMessage('Passkey already exists');
      setPasskeyLoading(false);
      setTimeout(() => {
        setPasskeyMessage('');
        // console.log('message cleared!')
      }, 2000);
      return;
    };

    setPasskeyLoading(true);
    setMessage('');
    

    try {
      const adminToken = sessionStorage.getItem('admin_smtp_token');
      if (!adminToken) {
        setShowVerify(true);
        setPasskeyLoading(false);
        return;
      }

      await toast.promise(
        (async () => {
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
          setPasskeyMessage('Passkey added successfully');
          setTimeout(() => {
            setPasskeyMessage('');
            // console.log('message cleared!')
          }, 1000);
        })(), 
        {
          loading: 'Adding passkey...',
          success: 'passkey added successfully!',
          error: 'Failed to add passkey!'
        }
      );

    } catch (err) {
      setPasskeyMessage(err.message || 'Failed to add passkey');
    } finally {
      setPasskeyLoading(false);
    }
  };

  // Delete a passkey
  const handleDeletePassKey = async (key) => {
    setPasskeyLoading(true);
    try {
      const adminToken = sessionStorage.getItem('admin_smtp_token');
      if (!adminToken) {
        setShowVerify(true);
        setPasskeyLoading(false);
        return;
      }

      await toast.promise(
        (async () => {
          const response = await fetch(`https://bulk-mail-db-server.onrender.com/config/passkeys/${encodeURIComponent(key)}`, {
          // const response = await fetch(`http://localhost:4000/config/passkeys/${encodeURIComponent(key)}`, {
            method: 'DELETE',
            headers: { 'x-admin-token': adminToken }
          });

          if (!response.ok) {
            throw new Error('Failed to delete passkey');
          }

          setPassKeys(prev => prev.filter(k => k !== key));
          setPasskeyMessage('Passkey deleted successfully');
        })(),
        {
          loading: 'Deleting passkey...',
          success: 'Passkey deleted successfully!',
          error: 'Failed to delete passkey!'
        }
      );

    } catch (err) {
      setPasskeyMessage(err.message || 'Failed to delete passkey');
    } finally {
      setPasskeyLoading(false);
      setPasskeyMessage('');
    }
  };

  // Map backend fields to AddSmtp fields
  const mapBackendToForm = (item) => ({
    host: item.smtp_host,
    user: item.smtp_user,
    pass: item.smtp_pass,
    from: item.smtp_from,
    smtpToken: item.smtp_token,
  });

  // const handleDeleteConfirmation = (id) => {
  //   setSmtpToDeleteId(id);
  //   setShowDeletePopup(true);
  // };

  // const handleDeleteConfirmationClose = () => {
  //   setSmtpToDeleteId(null);
  //   setShowDeletePopup(false);
  // };

  // const performSmtpDelete = async () => {
  //   if (!smtpToDeleteId) return;

  //   setIsDeletingSmtp(true);

  //   try {
  //     await handleDelete(smtpToDeleteId);
  //   } catch (error) {
  //     // handleDelete() should ideally handle its own errors and set messages
  //     // If not, you might want to set a generic error message here!
  //     console.error('Error during SMTP deletion:', error);
  //     setMessage('An unexpected error occurred while deleting the SMTP.')
  //     toast.error('An unexpected error occurred while deleting the SMTP.');
  //   } finally {
  //     setIsDeletingSmtp(false);
  //     setShowDeletePopup(false);
  //     setSmtpToDeleteId(null);
  //   }
  // };

  // Dynamically render Delete SMTP and Passkey

  const initialDeletePopupConfig = {
    isOpen: false,
    title: '',
    messageBody: '',
    confirmationButtonText: 'Delete',
    onConfirm: async () => {},
    isConfirmBusy: false,
  };
  const [deletePopupConfig, setDeletePopupConfig] = useState(initialDeletePopupConfig);

  // For SMTP Deletion
  const openSmtpDeleteDialog = (smtpToken, smtpUser) => {
    setDeletePopupConfig({
      isOpen: true,
      title: 'Delete SMTP Configuration?',
      messageBody: `Are you sure you want to delete this SMTP? 
      This action cannot be undone.`,
      confirmationButtonText: 'Delete',
      onConfirm: async () => {
        setDeletePopupConfig(prev => ({ ...prev, isConfirmBusy: true }));

        try {
          await handleDelete(smtpToken)
        } catch (err) {
          console.error('Error during SMTP deletion:', err)
        } finally {
          setDeletePopupConfig(initialDeletePopupConfig); // Reset and close
        }
      },
      isConfirmBusy: false,
    });
  };

  // For Passkey Deletion
  const openPasskeyDeleteDialog = (passkey) => {
    setDeletePopupConfig({
      isOpen: true,
      title: 'Delete Passkey?',
      messageBody: `Are you sure you want to delete the passkey "${passkey}"? 
      This action cannot be undone.`,
      confirmationButtonText: 'Delete Passkey',
      onConfirm: async () => {
        setDeletePopupConfig(prev => ({ ...prev, isConfirmBusy: true }));

        try {
          await handleDeletePassKey(passkey);
        } catch (err) {
          console.error('Error during passkey deletion:', err)
        } finally {
          setDeletePopupConfig(initialDeletePopupConfig); // Reset and close
        }
      },
      isConfirmBusy: false,
    });
  };

  // Generic cancel handler for the delete popup
  const handleGenericDeleteCancel = () => {
    // Prevent closing if an action is in progress
    if (!deletePopupConfig.isConfirmBusy) {
      setDeletePopupConfig(initialDeletePopupConfig);
    }
  };

  // Helper function to truncate credentials
  const truncateCredential = (value) => {
    if (!value || typeof value !== 'string') return '';
    // Remove spaces for credentials, treat as a single string
    const str = value.trim();
    if (str.length <= 6) return str;
    const first = str.slice(0, 4);
    const last = str.slice(-3);
    let asterisks = str.length - 7;
    if (asterisks > 8) asterisks = 8;
    if (asterisks < 1) asterisks = 1;
    return first + '*'.repeat(asterisks) + last;
  };

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
            className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 md:py-3 px-4 md:px-8 rounded-xl transition duration-200 text-center shadow-md shadow-indigo-200 text-base md:text-lg cursor-pointer"
          >
            Add SMTP
          </button>
          <button
            onClick={() => setShowPasskeyPopup(true)}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 md:py-3 px-4 md:px-8 rounded-xl transition duration-200 text-center shadow-md shadow-green-200 text-base md:text-lg cursor-pointer"
          >
            Add Passkey
          </button>
        </div>
        {/* Passkey list */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Existing Passkeys</h3>
          <div className="flex flex-wrap gap-2">
            {passkeyLoading ? (
              <div>Deleting...</div>
            )
            : (
              passKeys.length === 0 ? (
              <span className="text-gray-500">No passkeys yet.</span>
            ) : (
              passKeys.map((key, idx) => (
                <span key={idx} className="bg-gray-200 px-3 py-1 rounded-xl text-gray-700 text-base flex items-center gap-1">
                  {key}
                  <button
                    onClick={() => openPasskeyDeleteDialog(key)}
                    className="ml-1 text-red-500 hover:text-red-700 focus:outline-none cursor-pointer"
                    title="Delete passkey"
                    disabled={passkeyLoading}
                  >
                    <X size={20} />
                  </button>
                </span>
              ))
            )
            )}
          </div>
        </div>
        {loading ? (
          <div className="text-center text-gray-500 py-0">Loading...</div>
        ) : smtpList.length === 0 ? (
          <div className="bg-gray-100 rounded-xl p-6 text-center text-gray-500 text-base">
            No SMTP accounts found.
          </div>
        ) : (
          <div className="space-y-4">
            {smtpList.map((smtp, idx) => (
              <div key={smtp.id || idx} className="flex flex-col md:flex-row items-center justify-between bg-gray-300 rounded-xl p-4 shadow">
                {/* SMTP credentials */}
                <div className="flex-1 text-left">
                  <div className="font-semibold text-gray-800">Pass Key: {smtp.pass_key}</div>
                  <div className="text-gray-600 text-sm">Token: {truncateCredential(smtp.smtp_token)}</div>
                  <div className="text-gray-600 text-sm">User: {truncateCredential(smtp.smtp_user)}</div>
                  <div className="text-gray-600 text-sm">From: {smtp.smtp_from}</div>
                  <div className="text-gray-600 text-sm">Pass: {truncateCredential(smtp.smtp_pass)}</div>
                  <div className="text-gray-600 text-sm">Host: {truncateCredential(smtp.smtp_host)}</div>
                </div>
                <div className="flex flex-row gap-2 mt-3 md:mt-0 md:ml-4">
                  <button
                    onClick={() => handleEditClick(mapBackendToForm(smtp), idx)}
                    className="bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-2 px-6 rounded-xl transition duration-200 text-center shadow-md shadow-yellow-100 text-base cursor-pointer"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => openSmtpDeleteDialog(smtp.smtp_token, smtp.smtp_user)}
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
                  disabled={passkeyLoading}
                  className={`flex items-center w-full px-5 py-4 text-base font-medium outline-none mb-6 placeholder:text-gray-500 rounded-2xl ${
                    passkeyLoading
                      ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                      : 'focus:bg-gray-400 bg-gray-200 text-gray-900'
                  }`}
                />
                <button
                  onClick={handleAddPassKey}
                  disabled={passkeyLoading}
                  className={`w-full cursor-pointer px-6 py-4 mb-3 text-sm font-bold leading-none text-white transition duration-300 rounded-2xl ${
                    passkeyLoading
                      ? 'bg-green-400 cursor-not-allowed opacity-70'
                      : 'bg-green-500 hover:bg-green-600'
                  } focus:ring-4 focus:ring-green-300`}
                >
                  <span>{passkeyLoading ? 'Adding...' : 'Add Passkey'}</span>
                </button>
                {passkeyMessage && (
                  <p className={`text-base mx-auto my-2 ${passkeyMessage.includes('added') ? 'text-green-600' : 'text-red-600'}`}>{passkeyMessage}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </PopUp>

      {/* Generic Delete Confirmation Popup */}
      <PopUp isOpen={deletePopupConfig.isOpen} onClose={handleGenericDeleteCancel}>
        {/* Overlay and centering */}
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
          <div className='bg-white rounded-2xl shadow-2xl p-6 w-full max-w-[350px] relative flex flex-col items-center'>
            <button
              className="absolute top-3 right-2 text-gray-200 hover:text-red-700 focus:outline-none disabled:opacity-50 cursor-pointer hover:bg-gray-400 transition duration-200 bg-gray-700 rounded-full p-0.5"
              onClick={handleGenericDeleteCancel}
              disabled={deletePopupConfig.isConfirmBusy}
              aria-label="Close"
            >
              <X size={26} />
            </button>
            <h3 className='text-xl font-semibold mb-4 text-gray-800 text-center'>{deletePopupConfig.title}</h3>
            {deletePopupConfig.messageBody && (
              <p className="text-sm text-gray-700 mb-6 text-center whitespace-pre-wrap">{deletePopupConfig.messageBody}</p>
            )}
            <div className='w-full flex items-center justify-center gap-4'>
              <button
                className="bg-green-600 hover:bg-green-700 text-gray-200 font-semibold py-2 px-6 rounded-lg transition duration-200 text-center shadow-sm text-base cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleGenericDeleteCancel}
                disabled={deletePopupConfig.isConfirmBusy}
              >
                {deletePopupConfig.cancelButtonText || 'Cancel'}
              </button>
              <button
                className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-6 rounded-lg transition duration-200 text-center shadow-sm text-base cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={deletePopupConfig.onConfirm}
                disabled={deletePopupConfig.isConfirmBusy}
              >
                {deletePopupConfig.isConfirmBusy ? 'Processing...' : (deletePopupConfig.confirmationButtonText)}
              </button>
            </div>
          </div>
        </div>
      </PopUp>

      <PopupVerify isOpen={showVerify} onClose={() => setShowVerify(false)} />
    </div>
  );
};

export default AdminSmtp;