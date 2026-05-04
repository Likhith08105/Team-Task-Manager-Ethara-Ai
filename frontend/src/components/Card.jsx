// Card component - for displaying content in a card layout
import React from 'react';

const Card = ({ children, className = '', title = '', subtitle = '', ...props }) => {
  return (
    <div
      className={`
        bg-white border border-gray-200 rounded-lg shadow-sm p-6
        ${className}
      `}
      {...props}
    >
      {title && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
};

export default Card;
