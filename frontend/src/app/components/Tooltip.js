"use client"

import React, { useState } from 'react';

const Tooltip = ({ content, children, position = 'top' }) => {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: 'bottom-full mb-2',
    bottom: 'top-full mt-2',
    left: 'right-full mr-2',
    right: 'left-full ml-2'
  };

  const arrowClasses = {
    top: 'top-full border-t-gray-800 border-l-transparent border-r-transparent border-b-transparent',
    bottom: 'bottom-full border-b-gray-800 border-l-transparent border-r-transparent border-t-transparent',
    left: 'left-full border-l-gray-800 border-t-transparent border-b-transparent border-r-transparent',
    right: 'right-full border-r-gray-800 border-t-transparent border-b-transparent border-l-transparent'
  };

  return (
    <div className="relative inline-block w-full">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="w-full"
      >
        {children}
      </div>
      
      {isVisible && content && (
        <div
          className={`absolute ${positionClasses[position]} left-1/2 transform -translate-x-1/2 z-50 
                      bg-gray-800 text-white px-3 py-2 rounded text-xs whitespace-nowrap max-w-xs break-words`}
          style={{ pointerEvents: 'none' }}
        >
          {content}
          <div
            className={`absolute ${arrowClasses[position]} border-4`}
            style={{
              [position === 'top' || position === 'bottom' 
                ? 'left' 
                : 'top']: '50%',
              [position === 'top' || position === 'bottom' 
                ? 'transform' 
                : 'transform']: 'translateX(-50%)'
            }}
          />
        </div>
      )}
    </div>
  );
};

export default Tooltip;
