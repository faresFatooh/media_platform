
import React from 'react';

interface LoaderProps {
  message: string;
}

const Loader: React.FC<LoaderProps> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 bg-base-200 rounded-lg">
      <div className="w-16 h-16 border-4 border-t-brand-primary border-r-brand-primary border-b-brand-primary border-l-base-200 rounded-full animate-spin"></div>
      <p className="mt-6 text-lg font-semibold text-content animate-pulse">
        {message}
      </p>
    </div>
  );
};

export default Loader;
