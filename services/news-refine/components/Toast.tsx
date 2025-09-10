import React, { useEffect } from 'react';
import type { ToastData } from '../types';

interface ToastProps extends ToastData {
  onClose: () => void;
}

const SuccessIcon: React.FC = () => (
    <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
);

const ErrorIcon: React.FC = () => (
    <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
    </svg>
);

export const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const isSuccess = type === 'success';
  const bgColor = isSuccess ? 'bg-green-500' : 'bg-red-500';
  const Icon = isSuccess ? SuccessIcon : ErrorIcon;

  return (
    <div
      className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center w-full max-w-xs p-4 text-white ${bgColor} rounded-lg shadow-lg animate-fade-in-down`}
      role="alert"
    >
        <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-lg bg-white/20">
            <Icon />
        </div>
        <div className="mr-3 text-sm font-normal">{message}</div>
        <button
            type="button"
            className="mr-auto -mx-1.5 -my-1.5 bg-white/20 text-white hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-white/40 inline-flex h-8 w-8"
            onClick={onClose}
            aria-label="Close"
        >
            <span className="sr-only">Close</span>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
        </button>
        <style>{`
            @keyframes fade-in-down {
                0% {
                    opacity: 0;
                    transform: translate(-50%, -20px);
                }
                100% {
                    opacity: 1;
                    transform: translate(-50%, 0);
                }
            }
            .animate-fade-in-down {
                animation: fade-in-down 0.5s ease-out forwards;
            }
        `}</style>
    </div>
  );
};