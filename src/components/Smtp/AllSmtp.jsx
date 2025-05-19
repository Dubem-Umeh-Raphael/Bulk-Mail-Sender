import React, { useState, useContext, useEffect } from 'react';
import PopUp from '../../animations/PopUp';
import AddSmtp from './AddSmtp';
import { useNavigate } from 'react-router-dom';
import { SmtpTokenContext } from '../../context/SmtpTokenContext';

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
        navigate('/verify');
        return;
      }
  
      try {
        console.log('Fetching SMTPs with pass_key (from currentPasskey):', currentPasskey);
        const res = await fetch(`http://localhost:4000/config/smtps?pass_key=${currentPasskey}`);
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Failed to fetch SMTPs');
        }
  
        const data = await res.json();
        console.log('Fetched SMTPs:', data); // Log the fetched data for debugging
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
      const response = await fetch(`http://localhost:4000/config/save-config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(smtpWithToken),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save SMTP');
      }

      const responseData = await response.json();
      console.log('SMTP saved successfully:', responseData);

      // Fetch the updated list from backend to ensure correct keys
      const res = await fetch(`http://localhost:4000/config/smtps?pass_key=${currentPasskey}`);
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

  const handleDelete = (idx) => {
    setSmtpList(prev => prev.filter((_, i) => i !== idx));
  };

  const handleLogout = () => {
    logoutSmtp();
    navigate('/dash');
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
                <div className="flex-1 text-left">
                  <div className="text-gray-800 text-sm">
                    Pass Key: <span className='font-semibold text-gray-600'>{smtp.pass_key}</span>
                  </div>
                  <div className="text-gray-800 text-sm">
                    Token (smtp_token): <span className='font-semibold text-gray-600'>{smtp.smtp_token}</span>
                  </div>
                  <div className="text-gray-800 text-sm">Host: <span className='text-gray-600'>{smtp.smtp_host}</span></div>
                  <div className="text-gray-800 text-sm">User: <span className='text-gray-600'>{smtp.smtp_user}</span></div>
                  <div className="text-gray-800 text-sm">From: <span className='text-gray-600'>{smtp.smtp_from}</span></div>
                  <div className="text-gray-800 text-sm">Password: <span className='text-gray-600'>{smtp.smtp_pass}</span></div>
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
                      navigate('/verify');
                    }}
                  >
                    Use
                  </button>
                  <button
                    onClick={() => handleDelete(idx)}
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
    </div>
  );
};

export default AllSmtp;