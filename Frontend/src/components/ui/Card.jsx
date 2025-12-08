import React from 'react';

const Card = ({ 
  children, 
  className = '', 
  hover = false,
  padding = 'p-6'
}) => {
  return (
    <div className={`
      bg-white dark:bg-gray-800
      border border-gray-200 dark:border-gray-700
      rounded-xl
      ${padding}
      transition-all duration-200
      ${hover ? 'hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-600' : ''}
      ${className}
    `}>
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '' }) => (
  <div className={`mb-4 ${className}`}>
    {children}
  </div>
);

export const CardTitle = ({ children, className = '' }) => (
  <h3 className={`
    text-lg font-semibold 
    text-gray-900 dark:text-white
    ${className}
  `}>
    {children}
  </h3>
);

export const CardDescription = ({ children, className = '' }) => (
  <p className={`
    text-sm 
    text-gray-600 dark:text-gray-400
    ${className}
  `}>
    {children}
  </p>
);

export const CardContent = ({ children, className = '' }) => (
  <div className={className}>
    {children}
  </div>
);

export const CardFooter = ({ children, className = '' }) => (
  <div className={`mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 ${className}`}>
    {children}
  </div>
);

export default Card;