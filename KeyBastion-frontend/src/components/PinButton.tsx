import React from 'react';

interface PinButtonProps {
  onClick: () => void;
  children: React.ReactNode;
}

const PinButton: React.FC<PinButtonProps> = ({ onClick, children }) => {
  return (
    <button
      className="inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-sky-700 hover:bg-sky-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default PinButton;
