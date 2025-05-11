import React from "react";
import { CheckCircle } from 'lucide-react';

const MailAnimation = ({ isSent }) => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-200 z-[60] min-h-screen">
      {isSent ? (
        <>
          <CheckCircle className="text-green-500 w-12 h-12 animate-pulse" />
          <p className="mt-2 text-gray-900 font-medium text-lg">Mail Sent!</p>
        </>
      ) : (
        <>
          <div className="relative flex items-center justify-center h-16 w-16">
            <div className="absolute animate-spin rounded-full h-full w-full border-4 border-t-transparent border-purple-500 shadow-lg"></div>
            <div className="h-8 w-8 bg-purple-500 rounded-full shadow-inner"></div>
          </div>
          <p className="mt-2 text-gray-900 font-medium text-lg animate-pulse">Sending Mail...</p>
        </>
      )}
    </div>
  );
};

export default MailAnimation;