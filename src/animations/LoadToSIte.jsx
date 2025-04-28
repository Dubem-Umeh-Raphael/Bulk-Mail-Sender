import React, { useState, useEffect } from 'react';

const LoadToSIte = ({ loadText }) => {
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    const minLoadingTime = setTimeout(() => {
      setShouldRender(false);
    }, 2500);

    return () => clearTimeout(minLoadingTime);
  }, []);

  if (!shouldRender) {
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
      <div className="relative flex items-center justify-center h-20 w-20">
        <div className="absolute animate-spin rounded-full h-full w-full border-4 border-t-transparent border-purple-500 shadow-lg"></div>
        <div className="h-10 w-10 bg-purple-500 rounded-full shadow-inner"></div>
      </div>
      <p className="mt-4 text-gray-900 font-medium text-lg animate-pulse">{loadText}</p>
    </div>
  );
};

export default LoadToSIte;
