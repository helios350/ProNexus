import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';
import { 
  Network, LayoutDashboard, Layers, GraduationCap, UserSearch, LogOut 
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/admin' },
  { label: 'Batches', icon: Layers, to: '/admin/batches' },
  { label: 'Students', icon: GraduationCap, to: '/admin/students' },
  { label: 'Faculty', icon: UserSearch, to: '/admin/faculty' },
];

export const AdminSidebar: React.FC = () => {
  const { signOut } = useAuthContext();

  return (
    <aside className="h-screen w-56 fixed left-0 top-0 border-r border-outline-variant/20 bg-surface-container-low flex flex-col py-6 z-50 transition-colors duration-300">
      <div className="px-5 mb-10 flex items-center gap-3">
        <div className="w-8 h-8 rounded bg-primary flex items-center justify-center flex-shrink-0">
          <Network className="text-white" size={16} />
        </div>
        <div>
          <h1 className="font-headline font-bold text-primary text-base tracking-tighter">
            ProNexus
          </h1>
          <p className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant">
            Administration
          </p>
        </div>
      </div>
      
      <nav className="flex-1 px-3 space-y-0.5">
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            end={item.to === '/admin'}
            className={({ isActive }) =>
              `flex items-center gap-3 h-10 px-3 rounded-md transition-colors ${
                isActive
                  ? 'text-primary bg-primary-fixed/40 font-semibold'
                  : 'text-on-surface-variant hover:bg-surface-container'
              }`
            }
          >
            <item.icon size={18} className="flex-shrink-0" />
            <span className="text-[13px]">{item.label}</span>
          </NavLink>
        ))}
      </nav>
      
      <div className="mt-auto px-3 border-t border-outline-variant/10 pt-4">
        <button
          onClick={signOut}
          className="flex items-center gap-3 h-10 px-3 w-full rounded-md text-on-surface-variant hover:bg-error-container/30 hover:text-error transition-colors cursor-pointer"
        >
          <LogOut size={18} className="flex-shrink-0" />
          <span className="text-[13px] font-medium">Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
