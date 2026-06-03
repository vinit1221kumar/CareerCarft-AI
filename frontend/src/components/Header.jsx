import React from 'react';
import ThemeToggle from './ThemeToggle';

export default function Header() {
  return (
    <header className="cc-topbar">
      <div className="cc-brand">
        <span className="cc-brand-mark">CC</span>
        <h1 className="cc-header-title">CareerCraft AI</h1>
        <p className="cc-subtitle">Resume Analyzer & Career Roadmap Platform</p>
      </div>
      <div className="flex items-center gap-3">
        <nav className="cc-nav hidden md:block">
          <a className="mr-4" href="#">Dashboard</a>
          <a className="mr-4" href="#">Roadmap</a>
          <a href="#">Analytics</a>
        </nav>
        <ThemeToggle />
      </div>
    </header>
  );
}
