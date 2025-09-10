import React from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      aria-modal="true"
      role="dialog"
    >
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-white mb-3">{title}</h2>
          <p className="text-gray-300">{message}</p>
        </div>
        <div className="bg-gray-700/50 p-4 flex justify-end space-x-3 rtl:space-x-reverse rounded-b-lg">
          <button
            onClick={onCancel}
            className="px-5 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-500 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-500 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};