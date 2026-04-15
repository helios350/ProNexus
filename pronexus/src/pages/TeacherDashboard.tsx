import { useState, useEffect } from 'react';
import { TeacherSidebar } from '../components/TeacherSidebar';
import { TeacherHeader } from '../components/TeacherHeader';
import { ProjectOverviewCard } from '../components/ProjectOverviewCard';
import { AttendanceLedger } from '../components/AttendanceLedger';
import { CreateProjectModal } from '../components/CreateProjectModal';
import { Terminal, FileText, BarChart2, Plus, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthContext } from '../contexts/AuthContext';

export function TeacherDashboard() {
  const { user } = useAuthContext();
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from('projects')
      .select('*, batches(name), groups(count)')
      .eq('created_by', user.id)
      .order('created_at', { ascending: false });
    if (data) setProjects(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const activeGroups = projects.reduce((acc, p) => acc + (p.groups?.[0]?.count || 0), 0);

  return (
    <div className="bg-surface font-body text-on-surface antialiased min-h-screen">
      <TeacherSidebar />
      <TeacherHeader />
      
      <main className="pl-56 pt-14 min-h-screen">
        <div className="p-8 max-w-7xl mx-auto grid grid-cols-12 gap-8 pb-24">
          
          {/* Welcome Header */}
          <div className="col-span-12 flex justify-between items-end mb-4">
            <div>
              <h2 className="text-2xl font-headline font-bold tracking-tight text-on-surface">Academic Overview</h2>
              <p className="text-on-surface-variant text-sm mt-1">
                Managing {projects.length} academic projects and {activeGroups} active project groups.
              </p>
            </div>
            <button 
              onClick={() => setIsProjectModalOpen(true)}
              className="bg-gradient-to-br from-primary to-primary-container text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 hover:brightness-110 transition-all shadow-sm ghost-shadow active:scale-95"
            >
              <Plus className="w-4 h-4" /> Create Project
            </button>
          </div>

          {/* Left Column: Project Overview Cards */}
          <div className="col-span-12 lg:col-span-8 space-y-6 animate-slide-up" style={{ animationDelay: '0ms' }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {loading ? (
                 <div className="col-span-2 flex justify-center py-10">
                   <Loader2 className="animate-spin text-primary" size={24} />
                 </div>
              ) : projects.length === 0 ? (
                 <div className="col-span-2 text-center text-sm text-on-surface-variant py-10">
                   No projects created yet. Click "Create Project" to start.
                 </div>
              ) : (
                projects.map(project => (
                  <ProjectOverviewCard key={project.id} project={project} />
                ))
              )}
            </div>
          </div>

          {/* Right Column: Attendance Module */}
          <div className="col-span-12 lg:col-span-4 h-[600px] animate-slide-up" style={{ animationDelay: '50ms' }}>
            <AttendanceLedger projects={projects} />
          </div>

        </div>
      </main>

      {/* Floating Command Bar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-surface-container-lowest/80 backdrop-blur-xl border border-outline-variant/30 px-4 py-2 rounded-full shadow-2xl flex items-center gap-4 z-40 animate-fade-in delay-200">
        <button className="p-2 hover:bg-surface-container-high rounded-full transition-colors flex items-center gap-2">
          <Terminal className="text-on-surface-variant w-4 h-4" />
          <span className="text-[10px] font-mono text-on-surface-variant font-bold">⌘K</span>
        </button>
        <div className="h-4 w-[1px] bg-outline-variant/30"></div>
        <button className="flex items-center gap-2 px-3 py-1.5 hover:bg-surface-container-high rounded-full transition-colors group">
          <FileText className="text-on-surface-variant group-hover:text-primary transition-colors w-4 h-4" />
          <span className="text-xs font-medium text-on-surface-variant group-hover:text-on-surface">Reports</span>
        </button>
        <button className="flex items-center gap-2 px-3 py-1.5 hover:bg-surface-container-high rounded-full transition-colors group">
          <BarChart2 className="text-on-surface-variant group-hover:text-primary transition-colors w-4 h-4" />
          <span className="text-xs font-medium text-on-surface-variant group-hover:text-on-surface">Analytics</span>
        </button>
      </div>

      {isProjectModalOpen && (
        <CreateProjectModal 
          onClose={() => setIsProjectModalOpen(false)} 
          onSuccess={() => fetchData()}
        />
      )}
    </div>
  );
}
