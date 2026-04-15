import React from 'react';
import { Bell, HelpCircle } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

export const AdminHeader: React.FC = () => {
  return (
    <header className="fixed top-0 right-0 left-56 h-14 z-40 bg-surface/85 backdrop-blur-md flex items-center justify-end px-8 border-b border-outline-variant/20 transition-colors duration-300">
      <div className="flex items-center gap-3 text-on-surface-variant">
        <ThemeToggle />
        <button className="hover:text-primary transition-colors flex items-center justify-center">
          <Bell size={18} />
        </button>
        <button className="hover:text-primary transition-colors flex items-center justify-center">
          <HelpCircle size={18} />
        </button>
        
        <div className="w-8 h-8 rounded-full bg-surface-container-high overflow-hidden border border-outline-variant/30 flex items-center justify-center">
          <span className="text-xs font-bold font-mono">AD</span>
        </div>
      </div>
    </header>
  );
};
