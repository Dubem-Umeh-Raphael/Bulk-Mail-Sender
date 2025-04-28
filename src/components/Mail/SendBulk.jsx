import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Send, Mail, Info } from 'lucide-react';

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

  const [formData, setFormData] = useState({
    recipients: '',
    subject: '',
    body: ''
  });
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
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

      const recipients = formData.recipients.split(',').map(email => email.trim());
      
      const response = await fetch('http://localhost:5000/api/send-bulk-mail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({
          recipients,
          subject: formData.subject,
          body: formData.body
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send emails');
      }
      
      setStatus(data.success ? `Emails sent successfully to ${recipients.length} recipients!` : 'Failed to send emails');
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
            Enter multiple email addresses separated by commas. Make sure all recipients have consented to receive emails.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Recipients
            </label>
            <textarea
              name="recipients"
              value={formData.recipients}
              onChange={handleChange}
              className="w-full p-3 border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all placeholder-gray-500 font-mono text-base"
              rows="3"
              placeholder="email1@example.com, email2@example.com, email3@example.com"
              required
            />
            <p className="mt-1 text-xs font-medium text-gray-600">Comma-separated email addresses</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Subject Line
            </label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
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
              value={formData.body}
              onChange={handleChange}
              className="w-full p-3 border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all placeholder-gray-500"
              rows="8"
              placeholder="Type your message here..."
              required
            />
          </div>
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-6 rounded-md font-medium
              ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700 active:bg-blue-800'}
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