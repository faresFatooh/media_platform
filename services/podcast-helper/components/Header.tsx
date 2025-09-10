import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="text-center">
      <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand-secondary to-brand-light">
        مساعد أتمتة البودكاست
      </h1>
      <p className="mt-3 text-lg text-gray-400 max-w-2xl mx-auto">
        حوّل أي نص أو مقال أو مستند إلى حلقة بودكاست متكاملة وجاهزة للنشر.
      </p>
    </header>
  );
};

export default Header;