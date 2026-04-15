import { Bell, HelpCircle } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

export function StudentHeader() {
  return (
    <header className="fixed top-0 right-0 left-56 h-14 z-40 bg-surface/85 backdrop-blur-md border-b border-outline-variant/30 flex items-center justify-end px-8 transition-colors duration-300">
      <div className="flex items-center gap-3 text-on-surface-variant">
        <ThemeToggle />
        <Bell className="w-[18px] h-[18px] cursor-pointer hover:text-primary transition-colors" />
        <HelpCircle className="w-[18px] h-[18px] cursor-pointer hover:text-primary transition-colors" />
        <div className="w-8 h-8 rounded-full bg-surface-container-high overflow-hidden border border-outline-variant/30 flex items-center justify-center">
          <span className="text-xs font-bold font-mono">ST</span>
        </div>
      </div>
    </header>
  );
}
