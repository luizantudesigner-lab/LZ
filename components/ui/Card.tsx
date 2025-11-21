import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = '', noPadding = false }) => {
  return (
    <div className={`bg-zinc-900/60 backdrop-blur-md border border-white/5 rounded-xl shadow-xl ${noPadding ? '' : 'p-6'} ${className}`}>
      {children}
    </div>
  );
};