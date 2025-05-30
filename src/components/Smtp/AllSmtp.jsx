import React, { useState, useContext, useEffect } from 'react';
import PopUp from '../../animations/PopUp';
import AddSmtp from './AddSmtp';
import { useNavigate } from 'react-router-dom';
import { SmtpTokenContext } from '../../context/SmtpTokenContext';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';

const AllSmtp = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [smtpList, setSmtpList] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [editData, setEditData] = useState(null);
  const { logoutSmtp } = useContext(SmtpTokenContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSmtps = async () => {
      const currentPasskey = sessionStorage.getItem('current_passkey');
      if (!currentPasskey) {
        console.error('No current_passkey found in sessionStorage. Redirecting to verify.');
        navigate('/dash');
        return;
      }
  
      try {
        // console.log('Fetching SMTPs with pass_key (from currentPasskey):', currentPasskey);
        const res = await fetch(`https://bulk-mail-db-server.onrender.com/config/smtps?pass_key=${currentPasskey}`);
        // const res = await fetch(`http://localhost:4000/config/smtps?pass_key=${currentPasskey}`);
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Failed to fetch SMTPs');
        }
  
        const data = await res.json();
        // console.log('Fetched SMTPs:', data); // Log the fetched data for debugging
        setSmtpList(data || []);
      } catch (err) {
        console.error('Error fetching SMTPs:', err);
      }
    };
  
    fetchSmtps();
  }, [navigate]);
  
  const handleAddClick = () => {
    setEditIndex(null);
    setEditData(null);
    setShowPopup(true);
  };

  const handleEditClick = (data, idx) => {
    const editData = {
      host: data.smtp_host,
      user: data.smtp_user,
      pass: data.smtp_pass,
      from: data.smtp_from,
      token: data.smtp_token, // Ensure the correct token (passkey) is passed
    };
    setEditIndex(idx);
    setEditData(editData);
    setShowPopup(true);
  };

  const handleSave = async (smtpData, idx) => {
    const currentPasskey = sessionStorage.getItem('current_passkey');
    if (!currentPasskey) {
      console.error('No current_passkey found in sessionStorage. Cannot save SMTP.');
      return;
    }

    const smtpWithToken = {
      smtpToken: smtpData.token,
      passKey: currentPasskey, // Use the authenticated user's passkey
      smtpUser: smtpData.user,
      smtpPass: smtpData.pass,
      smtpHost: smtpData.host,
      smtpFrom: smtpData.from,
    };

    try {
      const response = await fetch(`https://bulk-mail-db-server.onrender.com/config/save-config`, {
      // const response = await fetch(`http://localhost:4000/config/save-config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(smtpWithToken),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save SMTP');
      }

      const responseData = await response.json();
      ('SMTP saved successfully:', responseData);

      // Fetch the updated list from backend to ensure correct keys
      const res = await fetch(`https://bulk-mail-db-server.onrender.com/config/smtps?pass_key=${currentPasskey}`);
      // const res = await fetch(`http://localhost:4000/config/smtps?pass_key=${currentPasskey}`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to fetch SMTPs');
      }
      const data = await res.json();
      setSmtpList(data || []);

      setShowPopup(false);
    } catch (err) {
      console.error('Error saving SMTP:', err);
    }
  };

  const handleLogout = () => {
    logoutSmtp();
    navigate('/dash');
  };

  // Remove: setLoading, setMessage, setShowVerify, setLoading(false) from handleDelete
  // Refactor handleDelete to use toast and correct token
  const handleDelete = async (smtp_token) => {
    try {
      const userToken = sessionStorage.getItem('current_passkey');
      if (!userToken) {
        toast.error('No passkey found. Please verify.');
        return;
      }
      await toast.promise(
        (async () => {
          const res = await fetch(`https://bulk-mail-db-server.onrender.com/config/${smtp_token}`, {
          // const res = await fetch(`http://localhost:4000/config/${smtp_token}`, {
            method: 'DELETE',
            headers: { 'x-admin-token': userToken },
          });
          if (!res.ok) throw new Error('Failed to delete config');
          setSmtpList(prev => prev.filter(item => item.smtp_token !== smtp_token));
        })(),
        {
          loading: 'Deleting SMTP...',
          success: 'SMTP deleted successfully!',
          error: 'Failed to delete SMTP!'
        }
      );
    } catch (err) {
      toast.error('Failed to delete SMTP config.');
    }
  };

  // Update openSmtpDeleteDialog to pass smtp_token
  const openSmtpDeleteDialog = (smtp_token) => {
    setDeletePopUpConfig({
      isOpen: true,
      title: 'Delete SMTP Configuration',
      messageBody: `Are you sure you want to delete the SMTP configuration?\n      This action cannot be undone.`,
      confirmationButtonText: 'Delete',
      onConfirm: async () => {
        setDeletePopUpConfig(prev => ({ ...prev, isConfirmBusy: true }));
        try {
          await handleDelete(smtp_token);
        } catch (err) {
          console.error('Error deleting SMTP:', err);
        } finally {
          setDeletePopUpConfig(initialDeletePopUpConfig);
        }
      },
      isConfirmBusy: false,
    });
  };

  const initialDeletePopUpConfig = {
    isOpen: false,
    title: '',
    messageBody: '',
    confirmationButtonText: 'Delete',
    onConfirm: async () => {},
    isConfirmBusy: false,
  };

  const [deletePopUpConfig, setDeletePopUpConfig] = useState(initialDeletePopUpConfig);

  const handleGenericDeleteCancel = () => {
    // Prevent closing if an action is in progress
    if (!deletePopUpConfig.isConfirmBusy) {
      setDeletePopUpConfig(initialDeletePopUpConfig);
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
    <div className="min-h-screen bg-gradient-to-br from-orange-300 to-blue-300 flex flex-col items-center justify-start px-4 py-10 relative">
      <button onClick={handleLogout} className='p-3 bg-red-500 hover:bg-red-600 transition duration-200 w-fit rounded-xl text-base text-gray-50 absolute top-3 left-3 cursor-pointer'>Go Back</button>
      <div className="max-w-2xl min-w-[320px] md:min-w-[500px] bg-white rounded-3xl shadow-2xl p-8 mb-8 relative top-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">All SMTP Accounts</h2>
        <p className="text-lg text-gray-700 mb-5 text-center">
          Manage your SMTP accounts here. Add, view, or remove SMTP credentials as needed.
        </p>
        <div className="flex justify-center mb-6">
          <button
            onClick={handleAddClick}
            className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 px-8 rounded-xl transition duration-200 text-center shadow-md shadow-indigo-200 text-lg cursor-pointer"
          >
            Add SMTP
          </button>
        </div>
        {/* SMTP list */}
        {smtpList.length === 0 ? (
          <div className="bg-gray-100 rounded-xl p-6 text-center text-gray-500 text-base">
            No SMTP accounts found. Add a new one to get started.
          </div>
        ) : (
          <div className="space-y-4">
            {smtpList.map((smtp, idx) => (
              <div key={idx} className="flex flex-col md:flex-row items-center justify-between bg-gray-300 rounded-xl p-4 shadow">
                {/* SMTP credentials */}
                <div className="flex-1 text-left">
                  <div className="text-gray-800 text-sm">
                    Pass Key: <span className='font-semibold text-gray-600'>{smtp.pass_key}</span>
                  </div>
                  <div className="text-gray-800 text-sm">
                    Token (smtp_token): <span className='font-semibold text-gray-600'>{truncateCredential(smtp.smtp_token)}</span>
                  </div>
                  <div className="text-gray-800 text-sm">Host: <span className='text-gray-600'>{truncateCredential(smtp.smtp_host)}</span></div>
                  <div className="text-gray-800 text-sm">User: <span className='text-gray-600'>{truncateCredential(smtp.smtp_user)}</span></div>
                  <div className="text-gray-800 text-sm">From: <span className='text-gray-600'>{smtp.smtp_from}</span></div>
                  <div className="text-gray-800 text-sm">Password: <span className='text-gray-600'>{truncateCredential(smtp.smtp_pass)}</span></div>
                </div>
                <div className="flex flex-row gap-2 mt-3 md:mt-0 md:ml-4">
                  <button
                    onClick={() => handleEditClick(smtp, idx)}
                    className="bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-2 px-6 rounded-xl transition duration-200 text-center shadow-md shadow-yellow-100 text-base cursor-pointer"
                  >
                    Edit
                  </button>
                  <button
                    className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-xl transition duration-200 text-center shadow-md shadow-green-100 text-base cursor-pointer"
                    onClick={() => {
                      navigate('/dash');
                    }}
                  >
                    Use
                  </button>
                  <button
                    onClick={() => openSmtpDeleteDialog(smtp.smtp_token)}
                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-xl transition duration-200 text-center shadow-md shadow-red-100 text-base cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <PopUp isOpen={showPopup} onClose={() => setShowPopup(false)}>
        <div className="w-full flex flex-col items-center justify-center">
          <div className="w-full max-w-[320px] md:max-w-[500px] mt-4">
            <AddSmtp
              onClose={() => setShowPopup(false)}
              onSave={handleSave}
              editData={editData}
              editIndex={editIndex}
            />
          </div>
        </div>
      </PopUp>

      {/* Generic Delete PopUp */}
      <PopUp isOpen={deletePopUpConfig.isOpen} onClose={handleGenericDeleteCancel}>
        {/* Overlay and centering */}
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
          <div className='bg-white rounded-2xl shadow-2xl p-6 w-full max-w-[350px] relative flex flex-col items-center'>
            <button
              className="absolute top-3 right-2 text-gray-200 hover:text-red-700 focus:outline-none disabled:opacity-50 cursor-pointer hover:bg-gray-400 transition duration-200 bg-gray-700 rounded-full p-0.5"
              onClick={handleGenericDeleteCancel}
              disabled={deletePopUpConfig.isConfirmBusy}
              aria-label="Close"
            >
              <X size={26} />
            </button>
            <h3 className='text-xl font-semibold mb-4 text-gray-800 text-center'>{deletePopUpConfig.title}</h3>
            {deletePopUpConfig.messageBody && (
              <p className="text-sm text-gray-700 mb-6 text-center whitespace-pre-wrap">{deletePopUpConfig.messageBody}</p>
            )}
            <div className='w-full flex items-center justify-center gap-4'>
              <button
                className="bg-green-600 hover:bg-green-700 text-gray-200 font-semibold py-2 px-6 rounded-lg transition duration-200 text-center shadow-sm text-base cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleGenericDeleteCancel}
                disabled={deletePopUpConfig.isConfirmBusy}
              >
                {deletePopUpConfig.cancelButtonText || 'Cancel'}
              </button>
              <button
                className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-6 rounded-lg transition duration-200 text-center shadow-sm text-base cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={deletePopUpConfig.onConfirm}
                disabled={deletePopUpConfig.isConfirmBusy}
              >
                {deletePopUpConfig.isConfirmBusy ? 'Processing...' : (deletePopUpConfig.confirmationButtonText)}
              </button>
            </div>
          </div>
        </div>
      </PopUp>
    </div>
  );
};

export default AllSmtp;