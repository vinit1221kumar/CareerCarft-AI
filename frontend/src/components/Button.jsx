import React from 'react';

export default function Button({ children, className = '', loading = false, variant = 'primary', ...props }) {
  const base = 'cc-button inline-flex items-center justify-center rounded-md px-5 py-3 text-sm font-semibold focus:outline-none';
  const variants = {
    primary: '',
    ghost: 'cc-button-ghost',
    outline: 'cc-button-outline'
  };

  return (
    <button className={`${base} ${variants[variant] || variants.primary} ${className}`} {...props} disabled={loading || props.disabled}>
      {loading ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
        </svg>
      ) : null}
      <span>{children}</span>
    </button>
  );
}
