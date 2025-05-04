import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Send, Mail, Info, X } from 'lucide-react'; // Import the X icon for removal

const SendBulk = () => {
  const { isLoggedIn } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Send Mail';
    const token = localStorage.getItem('auth_token');
    if (!token || !isLoggedIn) {
      navigate('/', { replace: true });
    }
  }, [isLoggedIn, navigate]);

  const [emails, setEmails] = useState([]);
  const [currentInput, setCurrentInput] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    setCurrentInput(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === ' ' && currentInput.trim()) {
      const newEmail = currentInput.trim();
      setEmails([...emails, newEmail]);
      setCurrentInput('');
    }
  };

  const handleRemoveEmail = (index) => {
    setEmails(emails.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus('Sending...');

    try {
      const token = localStorage.getItem('auth_token');

      if (!token) {
        setStatus('Token missing. Please verify again.');
        setLoading(false);
        return;
      }

      if (emails.length === 0) {
        setStatus('Please enter at least one recipient email.');
        setLoading(false);
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/send-bulk-mail`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({
          recipients: emails,
          subject: subject,
          body: body
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to send emails: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send emails');
      }

      setStatus(data.success ? `Emails sent successfully to ${emails.length} recipients!` : 'Failed to send emails');
      if (data.success) {
        setEmails([]);
        setSubject('');
        setBody('');
      }
    } catch (error) {
      setStatus('Error sending emails');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className='w-full h-full min-h-screen bg-[#e2d8d8] py-8 px-3'>
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-gray-400">
          <Mail className="text-blue-700" size={24} />
          <h2 className="text-2xl font-bold text-gray-900">Bulk Email Sender</h2>
        </div>

        <div className="bg-blue-100 p-4 rounded-lg mb-6 flex items-start gap-3">
          <Info className="text-blue-700 flex-shrink-0" size={18} />
          <p className="text-sm font-medium text-blue-900">
            Enter multiple email addresses. Press space after each email. Make sure all recipients have consented to receive emails.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Recipients
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {emails.map((email, index) => (
                <span
                  key={index}
                  className="bg-gray-200 text-gray-800 rounded-full px-3 py-1 text-sm font-medium flex items-center gap-1"
                >
                  {email}
                  <button
                    type="button"
                    onClick={() => handleRemoveEmail(index)}
                    className="text-gray-500 hover:text-gray-700 focus:outline-none"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={currentInput}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                className="flex-grow p-3 border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all placeholder-gray-500 text-base"
                placeholder="Enter email and press space"
              />
            </div>
            <p className="mt-1 text-xs font-medium text-gray-600">Enter emails and press space</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Subject Line
            </label>
            <input
              type="text"
              name="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full p-3 border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all placeholder-gray-500 text-lg"
              placeholder="Enter the email subject"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Email Content
            </label>
            <textarea
              name="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full p-3 border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all placeholder-gray-500"
              rows="8"
              placeholder="Type your message here..."
              required
            />
          </div>
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading || emails.length === 0}
              className={`w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-6 rounded-md font-medium
              ${loading || emails.length === 0 ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700 active:bg-blue-800'}
              transition-all shadow-md`}
            >
              {loading ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Send size={18} />
                  <span>Send Bulk Emails</span>
                </>
              )}
            </button>
          </div>
          {status && (
            <div className={`mt-4 p-4 rounded-md flex items-center gap-3 ${
              status.includes('success')
                ? 'bg-green-100 text-green-800 border-2 border-green-300'
                : 'bg-red-100 text-red-800 border-2 border-red-300'
            }`}>
              <div className={`rounded-full p-1 ${status.includes('success') ? 'bg-green-300' : 'bg-red-300'}`}>
                {status.includes('success') ? '✓' : '!'}
              </div>
              <div className="font-medium">{status}</div>
            </div>
          )}
        </form>
      </div>
    </section>
  );
};

export default SendBulk;