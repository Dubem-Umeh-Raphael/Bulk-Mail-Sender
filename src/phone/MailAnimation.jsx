import React, { useState, useEffect } from 'react';
import { Mail, CheckCircle } from 'lucide-react';

const MailAnimation = ({ isSending, isSent }) => {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (isSending) {
      setAnimate(true);
    } else {
      setAnimate(false);
    }
  }, [isSending]);

  return (
    <div className="relative w-16 h-16">
      {isSent ? (
        <div className="flex flex-col items-center justify-center">
          <CheckCircle className="text-green-500 w-10 h-10" />
          <span className="text-sm text-green-600 mt-1">Mail Sent</span>
        </div>
      ) : (
        <Mail
          className={`absolute top-0 left-0 w-16 h-16 text-blue-500 transition-all duration-500 ${animate ? 'transform translate-x-4 translate-y-4 opacity-70 scale-90' : 'transform translate-x-0 translate-y-0 opacity-100 scale-100'}`}
          style={{ zIndex: 2 }}
        />
      )}
      {!isSent && (
        <div
          className={`absolute top-0 left-0 w-16 h-16 rounded-full border-2 border-dashed border-blue-500 animate-spin ${isSending ? '' : 'opacity-0'}`}
          style={{ zIndex: 1 }}
        />
      )}
    </div>
  );
};

const UsageExample = () => {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = () => {
    setSending(true);
    // Simulate sending process
    setTimeout(() => {
      setSending(false);
      setSent(true);
      // Optionally reset after a short delay
      setTimeout(() => {
        setSent(false);
      }, 1500);
    }, 2000);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <MailAnimation isSending={sending} isSent={sent} />
      <button
        onClick={handleSend}
        disabled={sending || sent}
        className="mt-6 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
      >
        {sending ? 'Sending...' : sent ? 'Sent!' : 'Send Mail'}
      </button>
    </div>
  );
};

export default UsageExample;
