import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers, GraduationCap, UserSearch, UserPlus } from 'lucide-react';

interface DashboardStatsProps {
  stats: {
    batchesCount: number;
    studentsCount: number;
    mentorsCount: number;
  };
  onCreateUser?: () => void;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ stats, onCreateUser }) => {
  const navigate = useNavigate();

  const getIcon = (iconName: string, color: string) => {
    const props = { size: 18, className: color };
    switch(iconName) {
      case 'Layers': return <Layers {...props} />;
      case 'GraduationCap': return <GraduationCap {...props} />;
      case 'UserSearch': return <UserSearch {...props} />;
      default: return null;
    }
  };

  const dashboardStats = [
    {
      id: "BT-TOTAL",
      label: "Active Batches",
      count: stats.batchesCount,
      subtext: "cohorts",
      icon: "Layers",
      colorBg: "bg-surface-container-high",
      colorText: "text-on-surface",
      isNeutral: true,
      clickable: true,
      href: "/admin/batches",
    },
    {
      id: "ST-ENROLLED",
      label: "Total Students",
      count: stats.studentsCount,
      subtext: "enrolled",
      icon: "GraduationCap",
      colorBg: "bg-secondary-fixed",
      colorText: "text-on-secondary-fixed-variant",
      isNeutral: false,
      clickable: true,
      href: "/admin/students",
    },
    {
      id: "FC-ACTIVE",
      label: "Active Faculty",
      count: stats.mentorsCount,
      subtext: "assigned",
      icon: "UserSearch",
      colorBg: "bg-tertiary-fixed",
      colorText: "text-tertiary",
      isNeutral: false,
      clickable: true,
      href: "/admin/faculty",
    }
  ];

  return (
    <>
      <div className="flex items-end justify-between mb-10">
        <div>
          <h2 className="text-[1.5rem] font-headline font-bold tracking-tight text-on-surface mb-1">
            Global Analytics
          </h2>
          <p className="text-on-surface-variant text-sm">
            Overview of batches, student enrollment, and active faculty.
          </p>
        </div>
        {onCreateUser && (
          <button
            onClick={onCreateUser}
            className="primary-gradient text-white px-5 py-2.5 rounded-md text-sm font-medium flex items-center gap-2 ghost-shadow active:scale-95 transition-transform"
          >
            <UserPlus size={16} />
            Provision User
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {dashboardStats.map((stat, idx) => (
          <div
            key={idx}
            onClick={() => stat.clickable && stat.href && navigate(stat.href)}
            className={`bg-surface-container-lowest p-6 rounded-lg border border-outline-variant/10 ghost-shadow transition-all ${
              stat.clickable
                ? 'cursor-pointer hover:border-primary/30 hover:shadow-md active:scale-[0.98]'
                : ''
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 rounded ${stat.colorBg}`}>
                {getIcon(stat.icon, stat.colorText)}
              </div>
              <div className="flex items-center gap-2">
                {stat.clickable && (
                  <span className="text-[9px] font-mono text-primary bg-primary-fixed/20 px-1.5 py-0.5 rounded tracking-wider">
                    VIEW →
                  </span>
                )}
                <span className="font-mono text-[0.6rem] text-on-surface-variant bg-surface-container-low px-2 py-1 rounded">
                  {stat.id}
                </span>
              </div>
            </div>
            <h3 className="text-on-surface-variant text-xs uppercase tracking-widest font-semibold mb-1">
              {stat.label}
            </h3>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-on-surface tracking-tighter">{stat.count}</span>
              <span className={`text-xs font-medium ${stat.isNeutral ? 'text-on-surface-variant' : stat.colorText}`}>
                {stat.subtext}
              </span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};
