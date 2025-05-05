import React, { useState, useEffect } from 'react';
import { CheckCircle, Mail } from 'lucide-react';

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
          <CheckCircle className="text-green-500 w-20 h-20" />
          <span className="text-sm text-green-600 mt-1">Mail Sent</span>
        </div>
      ) : (
        <Mail
          className={`absolute top-5 left-5 text-blue-500 transition-all duration-500 ${animate ? 'transform translate-x-0 translate-y-0 opacity-70 scale-90' : 'transform translate-x-0 translate-y-0 opacity-100 scale-100'}`}
          style={{ zIndex: 2 }}
          size={40}
        />
      )}
      {!isSent && (
        <div
          className={`absolute top-0 left-0 w-20 h-20 rounded-full border-2 border-dashed border-blue-500 animate-spin-slow ${isSending ? '' : 'opacity-0'}`}
          style={{ zIndex: 1 }}
        />
      )}
    </div>
  );
};

export default MailAnimation;