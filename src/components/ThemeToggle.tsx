import React, { useEffect, useState } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';

export type ThemeMode = 'light' | 'dark' | 'auto';

export const ThemeToggle: React.FC = () => {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    return (localStorage.getItem('lucky_theme') as ThemeMode) || 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    const isDark =
      theme === 'dark' ||
      (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('lucky_theme', theme);
  }, [theme]);

  return (
    <div className="inline-flex items-center p-0.5 rounded-full border border-border bg-card shadow-xs">
      <button
        onClick={() => setTheme('light')}
        aria-label="Light mode"
        className={`px-3 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
          theme === 'light'
            ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs'
            : 'text-text-secondary hover:text-text-primary'
        }`}
      >
        <Sun className="w-3.5 h-3.5" />
        <span>Light</span>
      </button>
      <button
        onClick={() => setTheme('dark')}
        aria-label="Dark mode"
        className={`px-3 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
          theme === 'dark'
            ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs'
            : 'text-text-secondary hover:text-text-primary'
        }`}
      >
        <Moon className="w-3.5 h-3.5" />
        <span>Dark</span>
      </button>
      <button
        onClick={() => setTheme('auto')}
        aria-label="Auto mode"
        className={`px-3 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
          theme === 'auto'
            ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs'
            : 'text-text-secondary hover:text-text-primary'
        }`}
      >
        <Monitor className="w-3.5 h-3.5" />
        <span>Auto</span>
      </button>
    </div>
  );
};
