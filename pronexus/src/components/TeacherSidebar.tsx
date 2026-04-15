import { LayoutDashboard, ClipboardList, Users, Calendar, Settings, LogOut, Terminal } from 'lucide-react';
import { useAuthContext } from '../contexts/AuthContext';

export function TeacherSidebar() {
  const { signOut } = useAuthContext();

  return (
    <aside className="h-screen w-56 fixed left-0 top-0 border-r border-outline-variant/20 bg-surface-container-low z-50 flex flex-col py-6 transition-colors duration-300">
      <div className="px-5 mb-10 flex items-center gap-3">
        <div className="w-8 h-8 rounded bg-primary-container flex items-center justify-center shrink-0">
          <Terminal className="text-white w-4 h-4" />
        </div>
        <div>
          <h1 className="font-headline font-bold text-primary tracking-tighter text-base">ProNexus</h1>
          <p className="text-[9px] uppercase tracking-widest text-on-surface-variant font-mono">Management</p>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-0.5">
        <a className="flex items-center gap-3 h-10 px-3 rounded-md text-primary bg-primary/8 font-semibold transition-colors cursor-pointer">
          <LayoutDashboard className="w-[18px] h-[18px] shrink-0" />
          <span className="text-[13px]">Dashboard</span>
        </a>
        <a className="flex items-center gap-3 h-10 px-3 rounded-md text-on-surface-variant hover:bg-surface-container-high transition-colors cursor-pointer">
          <ClipboardList className="w-[18px] h-[18px] shrink-0" />
          <span className="text-[13px]">Projects</span>
        </a>
        <a className="flex items-center gap-3 h-10 px-3 rounded-md text-on-surface-variant hover:bg-surface-container-high transition-colors cursor-pointer">
          <Users className="w-[18px] h-[18px] shrink-0" />
          <span className="text-[13px]">Teams</span>
        </a>
        <a className="flex items-center gap-3 h-10 px-3 rounded-md text-on-surface-variant hover:bg-surface-container-high transition-colors cursor-pointer">
          <Calendar className="w-[18px] h-[18px] shrink-0" />
          <span className="text-[13px]">Timeline</span>
        </a>
        <a className="flex items-center gap-3 h-10 px-3 rounded-md text-on-surface-variant hover:bg-surface-container-high transition-colors cursor-pointer">
          <Settings className="w-[18px] h-[18px] shrink-0" />
          <span className="text-[13px]">Settings</span>
        </a>
      </nav>

      <div className="px-3 mt-4 border-t border-outline-variant/10 pt-4">
        <button
          onClick={signOut}
          className="flex items-center gap-3 h-10 px-3 rounded-md text-on-surface-variant hover:bg-error-container/30 hover:text-error transition-colors cursor-pointer w-full"
        >
          <LogOut className="w-[18px] h-[18px] shrink-0" />
          <span className="text-[13px] font-medium">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
