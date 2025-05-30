// DemoMail: Demo version of SendBulk without AuthContext, using localStorage for history
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Mail, Info, X, LogOut, History } from 'lucide-react';
import MailAnimation from '../../animations/MailAnimation';
import LoadToSIte from '../../animations/LoadToSIte';
import DemoHistory from '../History/DemoHistory';
import toast from 'react-hot-toast';

const LOCAL_EMAIL_HISTORY_KEY = 'demo_email_history';
const LOCAL_MESSAGE_HISTORY_KEY = 'demo_message_history';

const DemoMail = () => {
  const navigate = useNavigate();
  const emailInputRef = useRef(null);

  const [emails, setEmails] = useState([]);
  const [currentInput, setCurrentInput] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSendingMail, setIsSendingMail] = useState(false);
  const [isMailSent, setIsMailSent] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const isLoggingOutRef = useRef(false);

  // Demo history state
  const [emailHistory, setEmailHistory] = useState([]);
  const [messageHistory, setMessageHistory] = useState([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Load history from localStorage
  useEffect(() => {
    const emails = JSON.parse(localStorage.getItem(LOCAL_EMAIL_HISTORY_KEY) || '[]');
    const messages = JSON.parse(localStorage.getItem(LOCAL_MESSAGE_HISTORY_KEY) || '[]');
    setEmailHistory(emails);
    setMessageHistory(messages);
  }, []);

  // Save history to localStorage
  const saveEmailHistory = (emails) => {
    localStorage.setItem(LOCAL_EMAIL_HISTORY_KEY, JSON.stringify(emails));
    setEmailHistory(emails);
  };
  const saveMessageHistory = (messages) => {
    localStorage.setItem(LOCAL_MESSAGE_HISTORY_KEY, JSON.stringify(messages));
    setMessageHistory(messages);
  };

  const refreshHistory = () => {
    setEmailHistory(JSON.parse(localStorage.getItem(LOCAL_EMAIL_HISTORY_KEY) || '[]'));
    setMessageHistory(JSON.parse(localStorage.getItem(LOCAL_MESSAGE_HISTORY_KEY) || '[]'));
  };

  const handleLogOut = () => {
    setIsLoggingOut(true);
    isLoggingOutRef.current = true;
    setTimeout(() => {
      navigate('/dash', { replace: true });
    }, 2500);
  };

  // Demo: Save message to localStorage
  const saveMessageToDB = (email, subject, body) => {
    const newMessage = {
      id: Date.now() + Math.random(),
      email,
      subject,
      body,
      timestamp: new Date().toISOString(),
    };
    const updated = [newMessage, ...messageHistory];
    saveMessageHistory(updated);
  };

  const toggleHistorySidebar = () => {
    setIsHistoryOpen(!isHistoryOpen);
  };

  const handleEmailSelectFromHistory = (selectedEmails) => {
    setEmails(prevEmails => {
      const updatedEmails = [...prevEmails];
      selectedEmails.forEach(email => {
        if (!updatedEmails.includes(email)) {
          updatedEmails.push(email);
        }
      });
      return updatedEmails;
    });
  };

  const handleMessageSelectFromHistory = (messageOrArray) => {
    const message = Array.isArray(messageOrArray) ? messageOrArray[0] : messageOrArray;
    if (message) {
      setSubject(message.subject);
      setBody(message.body);
    }
  };

  // Input handling
  const handleInputChange = (e) => {
    const value = e.target.value;
    if (value.endsWith(' ')) {
      const newEmail = value.trim();
      if (newEmail && !emails.includes(newEmail)) {
        setEmails(prevEmails => [...prevEmails, newEmail]);
        saveEmailHistory([...emailHistory, newEmail]);
        setCurrentInput('');
      }
    } else {
      setCurrentInput(value);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault();
      const newEmail = currentInput.trim();
      if (newEmail && !emails.includes(newEmail)) {
        setEmails(prevEmails => [...prevEmails, newEmail]);
        saveEmailHistory([...emailHistory, newEmail]);
        setCurrentInput('');
      }
      if (emailInputRef.current) {
        emailInputRef.current.focus();
      }
    }
  };

  const handleTouchEnd = (e) => {
    const value = e.target.value;
    if (value.endsWith(' ')) {
      const newEmail = value.trim();
      if (newEmail && !emails.includes(newEmail)) {
        setEmails(prevEmails => [...prevEmails, newEmail]);
        saveEmailHistory([...emailHistory, newEmail]);
        setCurrentInput('');
      }
    }
  };

  const handleRemoveEmail = (index) => {
    setEmails(emails.filter((_, i) => i !== index));
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    const newEmails = pastedText.split(/\s+/).filter(email => email);
    let updated = [...emails];
    newEmails.forEach(email => {
      if (email && !updated.includes(email)) {
        updated.push(email);
      }
    });
    setEmails(updated);
    saveEmailHistory([...emailHistory, ...newEmails.filter(e => !emailHistory.includes(e))]);
    setCurrentInput('');
  };

  const handleInputBlur = () => {
    if (currentInput.trim()) {
      const newEmails = currentInput.trim().split(/\s+/).filter(email => email);
      let updated = [...emails];
      newEmails.forEach(email => {
        if (!updated.includes(email)) {
          updated.push(email);
        }
      });
      setEmails(updated);
      saveEmailHistory([...emailHistory, ...newEmails.filter(e => !emailHistory.includes(e))]);
    }
    setCurrentInput('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setIsSendingMail(true);
    setStatus('Sending...');
    try {
      if (emails.length === 0) {
        setStatus('Please enter at least one recipient email.');
        setLoading(false);
        setIsSendingMail(false);
        return;
      }
      setIsSendingMail(true);
      await toast.promise(
        (async () =>{
          setTimeout(() => {
            setStatus(`Emails sent successfully to ${emails.length} recipients!`);
          }, 1000);
          setEmails([]);
          setSubject('');
          setBody('');
          setIsMailSent(true);
          // Save each recipient's message to localStorage
          for (const email of emails) {
            saveMessageToDB(email, subject, body);
          }
          refreshHistory();
          setTimeout(() => {
            setIsMailSent(false);
            setStatus('');
          }, 500);
        })(), {
          loading: 'Sending emails...',
          success: `Emails sent to ${emails.length} recipients successfully!`,
          error: 'Error sending emails'
        }
      )
    } catch (error) {
      setStatus('Error sending emails');
      toast.error('Error sending emails');
      console.error('Error:', error);
    } finally {
      setLoading(false);
      setIsSendingMail(false);
    }
  };

  return (
    <section className='w-full h-full min-h-screen bg-gradient-to-br from-orange-300 to-blue-300'>
      <div id="history" className='flex flex-row items-center justify-between'>
        <div className='flex items-center justify-start pt-5 px-5'>
          <button
            className='flex flex-row items-center justify-between space-x-2 font-semibold cursor-pointer px-3 py-2 rounded-lg bg-gradient-to-br from-orange-500 to-blue-500 hover:bg-gradient-to-br hover:from-orange-600 hover:to-blue-600 transition duration-300 ease-in-out shadow-md shadow-gray-700 text-gray-50'
            onClick={toggleHistorySidebar}
          >
            <History size={20} />
            <span className='text-base md:text-lg'>History</span>
          </button>
        </div>
        <div className='flex items-center justify-end pt-5 px-5'>
          <button onClick={handleLogOut} className='flex flex-row items-center justify-between space-x-2 font-semibold cursor-pointer px-3 py-2 rounded-lg bg-gradient-to-br from-orange-500 to-blue-500 hover:bg-gradient-to-br hover:from-orange-600 hover:to-blue-600 transition duration-300 ease-in-out shadow-md shadow-gray-700 text-gray-50'>
            <LogOut size={20} />
            <span className='text-base md:text-lg'>Log out</span>
          </button>
        </div>
      </div>
      {isLoggingOut && (
        <div className='fixed min-h-screen inset-0 w-[100vw] h-[100vh] overflow-y-hidden'>
          <LoadToSIte loadText='Logging Out...' />
        </div>
      )}
      <div className='w-full h-full py-8 px-3' style={isLoggingOut ? { display: 'none' } : { display: 'block' }}>
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-gray-400">
            <Mail className="text-blue-700" size={24} />
            <h2 className="text-2xl font-extrabold text-gray-900 hero-name tracking-wide -mb-2">Bulk Email Sender</h2>
          </div>
          <div className="bg-blue-100 p-4 rounded-lg mb-6 flex items-start gap-3">
            <Info className="text-blue-700 flex-shrink-0 mt-5 md:mt-4" size={18} />
            <p className="text-sm md:text-base font-medium text-blue-900">
              Enter multiple email addresses. Press space after each email. Make sure all recipients have consented to receive emails.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2" htmlFor="email-recipients">
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
                      className="text-gray-500 hover:text-gray-700 focus:outline-none cursor-pointer"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  id='email-recipients'
                  name="recipients"
                  autoComplete="on"
                  ref={emailInputRef}
                  value={currentInput}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  onTouchEnd={handleTouchEnd}
                  onBlur={handleInputBlur}
                  onPaste={handlePaste}
                  className="flex-grow p-3 border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all placeholder-gray-500 text-base"
                  placeholder="Enter email and press space"
                />
              </div>
              <p className="mt-1 text-base font-medium text-blue-600">Enter emails and press space</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2" htmlFor="email-subject">
                Subject Line
              </label>
              <input
                type="text"
                id='email-subject'
                name="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full p-3 border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all placeholder-gray-500 text-lg"
                placeholder="Enter the email subject"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2" htmlFor="email-body">
                Email Content
              </label>
              <textarea
                name="body"
                id='email-body'
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
                disabled={loading || emails.length === 0 || isSendingMail}
                className={`w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-6 rounded-md font-medium
                  ${
                    loading || emails.length === 0 || isSendingMail
                      ? 'opacity-70 cursor-not-allowed'
                      : 'cursor-pointer hover:bg-blue-700 active:bg-blue-800'
                  }
                  transition-all shadow-md`}
              >
                {loading || isSendingMail ? (
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
          </form>
        </div>
      </div>
      {isSendingMail && (
        <div className="z-50 fixed top-0 left-0 w-full h-full bg-transparent">
          <MailAnimation isSending={isSendingMail} isSent={isMailSent} />
        </div>
      )}
      <DemoHistory
        isOpen={isHistoryOpen}
        onClose={toggleHistorySidebar}
        emailHistory={emailHistory}
        messageHistory={messageHistory}
        onEmailSelect={handleEmailSelectFromHistory}
        onMessageSelect={handleMessageSelectFromHistory}
        setEmailHistory={setEmailHistory}
        setMessageHistory={setMessageHistory}
        refreshHistory={refreshHistory}
      />
    </section>
  );
};

export default DemoMail;