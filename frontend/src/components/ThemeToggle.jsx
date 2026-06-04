import React, { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [mode, setMode] = useState(() => {
    if (typeof window === 'undefined') return 'light';
    return localStorage.getItem('cc-theme') || 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (mode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('cc-theme', mode);
  }, [mode]);

  return (
    <button
      aria-label="Toggle theme"
      onClick={() => setMode((m) => (m === 'dark' ? 'light' : 'dark'))}
      className="cc-theme-toggle"
    >
      {mode === 'dark' ? '🌙' : '☀️'}
    </button>
  );
}
