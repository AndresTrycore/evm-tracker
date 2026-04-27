import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export const ThemeToggle: React.FC = () => {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    // 1. Check localStorage
    const saved = localStorage.getItem('evm-theme');
    if (saved === 'dark' || saved === 'light') return saved;
    
    // 2. Check system preference
    if (window.matchMedia('(prefers-color-scheme: light)').matches) return 'light';
    
    return 'dark';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    localStorage.setItem('evm-theme', theme);
  }, [theme]);

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="p-2 rounded-full hover:bg-background-elevated text-text-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-accent-subtle"
      aria-label="Alternar tema"
    >
      {theme === 'dark' ? (
        <Sun className="w-5 h-5 text-health-yellow" />
      ) : (
        <Moon className="w-5 h-5 text-accent" />
      )}
    </button>
  );
};
