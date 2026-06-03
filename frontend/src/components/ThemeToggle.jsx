import React, { useEffect, useState } from 'react';

export default function ThemeToggle() {
<<<<<<< HEAD
  const [theme, setTheme] = useState('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Get initial theme from localStorage or data-theme attribute
    const savedTheme = localStorage.getItem('cc-theme') || 
                       document.documentElement.getAttribute('data-theme') || 
                       'light';
    setTheme(savedTheme);
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('cc-theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <button className="theme-toggle" disabled>
        ☀️
      </button>
    );
  }

  return (
    <button 
      className={`theme-toggle ${theme}`}
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? '🌙' : '☀️'}
=======
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
>>>>>>> 911aeed (new commit)
    </button>
  );
}
