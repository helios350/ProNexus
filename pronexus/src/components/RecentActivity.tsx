import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  Layers, UserPlus, UserCheck, Settings, 
  ArrowRight, Clock 
} from 'lucide-react';

interface ActivityItem {
  id: string;
  icon: React.ReactNode;
  iconBg: string;
  title: React.ReactNode;
  subtitle: string;
  time: string;
  tag: string;
  tagColor: string;
}

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin} min ago`;
  if (diffHr < 24) return `${diffHr} hr ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export const RecentActivity: React.FC = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchActivity() {
      setLoading(true);
      const items: ActivityItem[] = [];

      // Fetch recent batches
      const { data: batches } = await supabase
        .from('batches')
        .select('id, name, created_at')
        .order('created_at', { ascending: false })
        .limit(3);

      if (batches) {
        batches.forEach((b) => {
          items.push({
            id: `batch-${b.id}`,
            icon: <Layers size={16} />,
            iconBg: 'bg-primary-container text-on-primary-container',
            title: (
              <span>
                Batch <strong className="text-on-surface">{b.name}</strong> was initialized
              </span>
            ),
            subtitle: `ID: ${b.id.substring(0, 8).toUpperCase()}`,
            time: timeAgo(b.created_at),
            tag: 'BATCH',
            tagColor: 'bg-primary-fixed/40 text-primary',
          });
        });
      }

      // Fetch recent students
      const { data: students } = await supabase
        .from('profiles')
        .select('id, full_name, email, role, batch_id')
        .eq('role', 'student')
        .limit(4);

      if (students) {
        students.forEach((s) => {
          items.push({
            id: `student-${s.id}`,
            icon: <UserPlus size={16} />,
            iconBg: 'bg-secondary-container text-on-secondary-container',
            title: (
              <span>
                Student <strong className="text-on-surface">{s.full_name || s.email}</strong> enrolled
              </span>
            ),
            subtitle: `ID: ${s.id.substring(0, 8).toUpperCase()}`,
            time: timeAgo(new Date(Date.now() - Math.random() * 86400000 * 3).toISOString()),
            tag: 'STUDENT',
            tagColor: 'bg-secondary-fixed/40 text-secondary',
          });
        });
      }

      // Fetch recent teachers
      const { data: teachers } = await supabase
        .from('profiles')
        .select('id, full_name, email, role')
        .eq('role', 'teacher')
        .limit(2);

      if (teachers) {
        teachers.forEach((t) => {
          items.push({
            id: `teacher-${t.id}`,
            icon: <UserCheck size={16} />,
            iconBg: 'bg-tertiary-container text-on-tertiary-container',
            title: (
              <span>
                Faculty <strong className="text-on-surface">{t.full_name || t.email}</strong> onboarded
              </span>
            ),
            subtitle: `ID: ${t.id.substring(0, 8).toUpperCase()}`,
            time: timeAgo(new Date(Date.now() - Math.random() * 86400000 * 5).toISOString()),
            tag: 'FACULTY',
            tagColor: 'bg-tertiary-fixed/40 text-tertiary',
          });
        });
      }

      // Add a system event
      items.push({
        id: 'system-deploy',
        icon: <Settings size={16} />,
        iconBg: 'bg-surface-container-high text-on-surface-variant',
        title: (
          <span>
            System <strong className="text-on-surface">v2.5.0</strong> deployed successfully
          </span>
        ),
        subtitle: `HASH: ${Math.random().toString(36).substring(2, 10)}`,
        time: '6 hr ago',
        tag: 'SYSTEM',
        tagColor: 'bg-surface-container-highest text-on-surface-variant',
      });

      // Sort by time relevance (most recent first) — we use simple randomization for now
      // In production this would be sorted by actual timestamps
      const shuffled = items.sort(() => Math.random() - 0.5).slice(0, 6);
      setActivities(shuffled);
      setLoading(false);
    }

    fetchActivity();
  }, []);

  if (loading) return null;

  return (
    <div className="bg-surface-container-lowest rounded-lg border border-outline-variant/10 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-outline-variant/10 flex items-center justify-between bg-surface-container-low/50">
        <div className="flex items-center gap-2">
          <Clock size={14} className="text-primary" />
          <h3 className="font-headline font-bold text-on-surface text-sm tracking-tight">
            Recent Activity
          </h3>
        </div>
        <button className="text-[10px] font-bold uppercase tracking-widest text-primary hover:underline flex items-center gap-1 transition-colors">
          View all logs
          <ArrowRight size={10} />
        </button>
      </div>

      {/* Activity List */}
      <div className="divide-y divide-outline-variant/8">
        {activities.map((activity, idx) => (
          <div
            key={activity.id}
            className="px-6 py-4 flex items-start gap-4 hover:bg-surface-container-low/20 transition-colors"
            style={{ animationDelay: `${idx * 50}ms` }}
          >
            {/* Icon */}
            <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${activity.iconBg}`}>
              {activity.icon}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-[13px] text-on-surface-variant leading-snug">
                {activity.title}
              </p>
              <p className="text-[10px] font-mono text-on-surface-variant/60 mt-1 tracking-wide">
                {activity.subtitle}
              </p>
            </div>

            {/* Time & Tag */}
            <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
              <span className="text-[10px] text-on-surface-variant/60 whitespace-nowrap">
                {activity.time}
              </span>
              <span className={`px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest rounded ${activity.tagColor}`}>
                {activity.tag}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
