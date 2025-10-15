
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-gray-800 text-white shadow-md">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-4 space-x-reverse">
          <i className="fas fa-cogs fa-2x"></i>
          <h1 className="text-2xl font-bold">
            نظام أتمتة مركز الإعلام
          </h1>
        </div>
        <div className="flex items-center space-x-4 space-x-reverse">
            <button className="text-gray-300 hover:text-white">
                <i className="fas fa-bell"></i>
            </button>
            <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">غ</span>
            </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
