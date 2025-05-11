import React, { useState, useEffect } from 'react';
import LoadToSIte from './LoadToSIte';

const LoadingWrapper = ({ children, loadText }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000); // 2.5 seconds minimum loading time

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadToSIte loadText={loadText} />;
  }

  return children;
};

export default LoadingWrapper;
