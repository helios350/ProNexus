import { LayoutDashboard, ClipboardList, Users, Calendar, Settings, LogOut, Network } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';

export function StudentSidebar() {
  const { signOut } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/student' },
    { icon: ClipboardList, label: 'Projects', path: '' },
    { icon: Users, label: 'Teams', path: '' },
    { icon: Calendar, label: 'Timeline', path: '' },
    { icon: Settings, label: 'Settings', path: '/student/settings' },
  ];

  return (
    <aside className="h-screen w-56 fixed left-0 top-0 border-r border-outline-variant/20 bg-surface-container-low z-50 flex flex-col py-6 transition-colors duration-300">
      <div className="px-5 mb-10 flex items-center gap-3">
        <div className="w-8 h-8 rounded bg-primary-container flex items-center justify-center shrink-0">
          <Network className="text-white w-4 h-4" />
        </div>
        <div>
          <h1 className="font-headline font-bold text-primary tracking-tighter text-base">ProNexus</h1>
          <p className="text-[9px] uppercase tracking-widest text-on-surface-variant font-mono">Student Space</p>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-0.5">
        {navItems.map(({ icon: Icon, label, path }) => {
          const isActive = path && location.pathname === path;
          return (
            <button
              key={label}
              onClick={() => path && navigate(path)}
              className={`flex items-center gap-3 h-10 px-3 rounded-md transition-colors cursor-pointer w-full ${
                isActive
                  ? 'text-primary bg-primary/8 font-semibold'
                  : 'text-on-surface-variant hover:bg-surface-container-high'
              } ${!path ? 'opacity-50 cursor-default' : ''}`}
              disabled={!path}
            >
              <Icon className="w-[18px] h-[18px] shrink-0" />
              <span className="text-[13px]">{label}</span>
            </button>
          );
        })}
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
