import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      className="relative w-9 h-9 flex items-center justify-center rounded-lg
        bg-surface-container-high hover:bg-surface-container-highest
        dark:bg-surface-container-low dark:hover:bg-surface-container
        transition-all duration-300 group"
    >
      {/* Sun icon — visible in dark mode */}
      <Sun
        size={17}
        className={`absolute transition-all duration-300 text-amber-400
          ${theme === 'dark' ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 rotate-90 scale-0'}`}
      />
      {/* Moon icon — visible in light mode */}
      <Moon
        size={17}
        className={`absolute transition-all duration-300 text-on-surface-variant
          ${theme === 'light' ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'}`}
      />
    </button>
  );
}
