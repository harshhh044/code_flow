import React from 'react';
import { Link } from 'react-router-dom';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  to,
  href,
  onClick,
  type = 'button',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  className = '',
  ...props
}) => {
  // Base styles from your HTML files
  const baseStyles = "inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-300 ease-out disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none";
  
  const variants = {
    // Primary - Orange accent from your HTML
    primary: "bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0",
    
    // Secondary - Gray outline
    secondary: "bg-gray-100 text-gray-700 border-2 border-gray-200 hover:border-blue-900 hover:text-blue-900 hover:bg-gray-50",
    
    // Outline
    outline: "bg-transparent border-2 border-gray-200 text-gray-700 hover:border-blue-900 hover:text-blue-900",
    
    // Ghost
    ghost: "bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900",
    
    // Danger
    danger: "bg-gradient-to-r from-red-500 to-red-600 text-white hover:shadow-lg hover:-translate-y-0.5",
    
    // Success
    success: "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:shadow-lg hover:-translate-y-0.5",
    
    // Blue/Primary from navbar
    blue: "bg-blue-900 text-white hover:bg-blue-800 hover:shadow-lg",
    
    // Anonymous purple
    anonymous: "bg-gradient-to-r from-violet-600 to-purple-700 text-white hover:shadow-lg hover:-translate-y-0.5 shadow-violet-500/30",
  };

  const sizes = {
    sm: "px-3 py-2 text-xs",
    md: "px-4 py-2.5 text-sm",
    lg: "px-6 py-3 text-base",
    xl: "px-8 py-4 text-lg",
  };

  const classes = `${baseStyles} ${variants[variant]} ${sizes[size]} ${loading ? 'relative !text-transparent' : ''} ${className}`;

  const content = (
    <>
      {loading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <svg className="w-5 h-5 text-current animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </span>
      )}
      {icon && iconPosition === 'left' && <i className={`fas ${icon}`}></i>}
      {children}
      {icon && iconPosition === 'right' && <i className={`fas ${icon}`}></i>}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {content}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={classes} {...props}>
        {content}
      </a>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={classes}
      {...props}
    >
      {content}
    </button>
  );
};

export default Button;