
import React from 'react';

interface CardProps {
  children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ children }) => {
  return (
    <div className="bg-base-200 rounded-xl shadow-lg border border-base-300 overflow-hidden">
      {children}
    </div>
  );
};

export default Card;
