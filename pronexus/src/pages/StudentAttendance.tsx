import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight, Loader2, Download } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthContext } from '../contexts/AuthContext';
import { StudentSidebar } from '../components/StudentSidebar';

interface AttendanceLog {
  id: string;
  date: string;
  status: string;
  project_id: string;
  profiles_marked_by: { full_name: string } | null;
}

interface ProjectInfo {
  title: string;
  batches: { name: string } | null;
}

export default function StudentAttendance() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { profile } = useAuthContext();

  const [logs, setLogs] = useState<AttendanceLog[]>([]);
  const [project, setProject] = useState<ProjectInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [calendarMonth, setCalendarMonth] = useState(new Date());

  const loadData = useCallback(async () => {
    if (!projectId || !profile?.id) return;
    setLoading(true);

    const [{ data: projData }, { data: attData }] = await Promise.all([
      supabase
        .from('projects')
        .select('title, batches(name)')
        .eq('id', projectId)
        .single(),
      supabase
        .from('attendance_logs')
        .select('id, date, status, project_id, profiles!attendance_logs_marked_by_fkey(full_name)')
        .eq('student_id', profile.id)
        .eq('project_id', projectId)
        .order('date', { ascending: false }),
    ]);

    if (projData) setProject(projData as unknown as ProjectInfo);
    if (attData) {
      setLogs(attData.map((a: any) => ({
        ...a,
        profiles_marked_by: a.profiles,
      })));
    }

    setLoading(false);
  }, [projectId, profile?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Stats
  const totalSessions = logs.length;
  const presentCount = logs.filter(l => l.status === 'present').length;
  const absentCount = logs.filter(l => l.status === 'absent').length;
  const excusedCount = logs.filter(l => l.status === 'excused').length;
  const percentage = totalSessions > 0 ? Math.round((presentCount / totalSessions) * 100) : 0;

  // Streak calculation
  const sortedLogs = [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  let streak = 0;
  for (const log of sortedLogs) {
    if (log.status === 'present') streak++;
    else break;
  }

  // Calendar helpers
  const calYear = calendarMonth.getFullYear();
  const calMonth = calendarMonth.getMonth();
  const firstDay = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const monthName = calendarMonth.toLocaleString('default', { month: 'long', year: 'numeric' });

  const getStatusForDate = (day: number): string | null => {
    const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const log = logs.find(l => l.date === dateStr);
    return log?.status || null;
  };

  const statusDotColor: Record<string, string> = {
    present: 'bg-secondary',
    absent: 'bg-tertiary-container',
    excused: 'bg-surface-container-high',
  };

  const statusBadgeStyles: Record<string, string> = {
    present: 'bg-secondary-fixed text-on-secondary-fixed-variant',
    absent: 'bg-tertiary-fixed text-tertiary',
    excused: 'bg-surface-container-high text-on-surface-variant',
  };

  if (loading) {
    return (
      <div className="bg-surface font-body text-on-surface antialiased min-h-screen">
        <StudentSidebar />
        <main className="pl-56 pt-24 px-8 max-w-7xl pb-12 flex justify-center items-center">
          <Loader2 className="animate-spin text-primary mt-20" size={32} />
        </main>
      </div>
    );
  }

  return (
    <div className="bg-surface font-body text-on-surface antialiased min-h-screen">
      <StudentSidebar />
      <main className="pl-56 pt-10 px-8 max-w-5xl pb-12 transition-all">

        {/* Header */}
        <header className="mb-10">
          <div className="flex items-center gap-4 mb-3">
            <button
              onClick={() => navigate(-1)}
              className="w-8 h-8 flex items-center justify-center rounded bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest transition-colors"
            >
              <ArrowLeft size={16} />
            </button>
            <h1 className="font-headline text-[1.5rem] font-semibold text-on-surface tracking-[-0.02em]">
              Attendance Record
            </h1>
          </div>
          <p className="pl-12 font-mono text-[11px] text-on-surface-variant tracking-tight">
            {project?.batches?.name || 'Batch'} · {project?.title || 'Project'}
          </p>
        </header>

        <div className="space-y-8">
          {/* Summary Stats Row */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-surface-container-lowest p-5 rounded-md shadow-[0_2px_8px_-2px_rgba(25,28,30,0.02)]">
              <p className="text-[10px] font-mono text-on-surface-variant mb-2 uppercase tracking-wider">Overall Attendance</p>
              <div className="flex items-end justify-between">
                <p className="text-3xl font-bold text-on-surface">{percentage}%</p>
                {/* Mini circular progress */}
                <svg width="40" height="40" className="-mr-1">
                  <circle cx="20" cy="20" r="16" fill="none" stroke="#e6e8ea" strokeWidth="3" />
                  <circle
                    cx="20" cy="20" r="16" fill="none" stroke="#2a14b4" strokeWidth="3"
                    strokeDasharray={`${(percentage / 100) * 100.53} 100.53`}
                    strokeLinecap="round"
                    transform="rotate(-90 20 20)"
                  />
                </svg>
              </div>
              <p className="font-mono text-[10px] text-outline mt-1">{presentCount}/{totalSessions} Sessions</p>
            </div>

            <div className="bg-surface-container-lowest p-5 rounded-md shadow-[0_2px_8px_-2px_rgba(25,28,30,0.02)]">
              <p className="text-[10px] font-mono text-on-surface-variant mb-2 uppercase tracking-wider">Current Streak</p>
              <p className="text-3xl font-bold text-on-surface">{streak}</p>
              <p className="font-mono text-[10px] text-outline mt-1">Consecutive Present Sessions</p>
            </div>

            <div className="bg-surface-container-lowest p-5 rounded-md shadow-[0_2px_8px_-2px_rgba(25,28,30,0.02)]">
              <p className="text-[10px] font-mono text-on-surface-variant mb-2 uppercase tracking-wider">Status</p>
              <span className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase rounded font-mono tracking-wider ${percentage >= 75 ? 'bg-secondary-fixed text-on-secondary-fixed-variant' : 'bg-tertiary-fixed text-tertiary'}`}>
                {percentage >= 75 ? 'Good Standing' : 'Low Attendance'}
              </span>
              <p className="font-mono text-[10px] text-outline mt-2">Min. Required: 75%</p>
            </div>
          </div>

          {/* Calendar Grid */}
          <section className="bg-surface-container-lowest p-6 rounded-md shadow-[0_2px_8px_-2px_rgba(25,28,30,0.02)]">
            <div className="flex items-center justify-between mb-5">
              <button onClick={() => setCalendarMonth(new Date(calYear, calMonth - 1))} className="p-1 hover:bg-surface-container-high rounded transition-colors">
                <ChevronLeft size={18} className="text-on-surface-variant" />
              </button>
              <h3 className="font-mono text-sm font-semibold text-on-surface">{monthName}</h3>
              <button onClick={() => setCalendarMonth(new Date(calYear, calMonth + 1))} className="p-1 hover:bg-surface-container-high rounded transition-colors">
                <ChevronRight size={18} className="text-on-surface-variant" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} className="text-[9px] font-mono text-outline uppercase tracking-wider py-1">{d}</div>
              ))}
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const status = getStatusForDate(day);
                return (
                  <div key={day} className="flex flex-col items-center py-1.5 gap-1">
                    <span className="font-mono text-[10px] text-on-surface-variant">{day}</span>
                    {status && (
                      <div className={`w-2 h-2 rounded-full ${statusDotColor[status]}`} />
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-4 mt-4 pt-3">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-secondary" />
                <span className="text-[9px] font-mono text-outline">Present ({presentCount})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-tertiary-container" />
                <span className="text-[9px] font-mono text-outline">Absent ({absentCount})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-surface-container-high" />
                <span className="text-[9px] font-mono text-outline">Excused ({excusedCount})</span>
              </div>
            </div>
          </section>

          {/* Session Log */}
          <section className="bg-surface-container-lowest p-6 rounded-md shadow-[0_2px_8px_-2px_rgba(25,28,30,0.02)]">
            <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-on-surface-variant font-bold mb-4">Session Log</h3>

            <div className="space-y-1">
              {sortedLogs.map((log, idx) => (
                <div key={log.id} className="flex items-center justify-between p-3 rounded hover:bg-surface-container-low transition-colors">
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-[10px] text-outline w-6 text-right">#{totalSessions - idx}</span>
                    <span className="font-mono text-[11px] text-on-surface-variant w-24">
                      {new Date(log.date).toLocaleDateString('en-CA')}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    {log.profiles_marked_by && (
                      <span className="text-[10px] text-on-surface-variant">
                        {log.profiles_marked_by.full_name}
                      </span>
                    )}
                    <span className={`px-2 py-0.5 ${statusBadgeStyles[log.status] || statusBadgeStyles.present} font-mono text-[9px] font-bold rounded uppercase w-20 text-center`}>
                      {log.status}
                    </span>
                  </div>
                </div>
              ))}
              {logs.length === 0 && (
                <p className="text-sm text-on-surface-variant text-center py-6">No attendance records yet.</p>
              )}
            </div>
          </section>

          {/* Export Strip */}
          <div className="flex items-center justify-between px-2">
            <button className="flex items-center gap-2 text-xs text-on-surface-variant hover:text-primary transition-colors">
              <Download size={14} />
              <span className="font-medium">Download Report (PDF)</span>
            </button>
            <span className="font-mono text-[10px] text-outline">
              Last Updated: {logs.length > 0 ? new Date(logs[0].date).toLocaleDateString() : '—'}
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
