import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Loader2 } from 'lucide-react';
import { StudentSidebar } from '../components/StudentSidebar';
import { StudentHeader } from '../components/StudentHeader';
import { ProjectHeroCard } from '../components/ProjectHeroCard';
import { TeamSection } from '../components/TeamSection';
import { SubmissionPortal } from '../components/SubmissionPortal';
import { BentoStats } from '../components/BentoStats';
import { supabase } from '../lib/supabase';
import { useAuthContext } from '../contexts/AuthContext';

// Shape the data to match what the existing child components expect
function buildActiveProject(project: any, tasks: any[], group: any) {
  const completedTasks = tasks.filter((t: any) => !t.is_open).length;
  const totalTasks = tasks.length;
  const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return {
    id: project.id?.substring(0, 8)?.toUpperCase() || 'PRJ-000',
    title: project.title || 'Untitled Project',
    mentor: group?.mentor_name || 'Not assigned',
    progress: {
      percentage,
      steps: tasks.map((t: any) => ({
        title: t.title,
        status: !t.is_open ? 'COMPLETED' : 'IN PROGRESS',
      })),
    },
  };
}

function buildTeam(group: any, members: any[]) {
  return {
    name: group?.name || 'No Group',
    size: members.length,
    members: members.map((m: any) => ({
      id: m.id,
      name: m.full_name || 'Unknown',
      role: m.roll_no || 'Student',
      avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${m.full_name || 'U'}`,
      phone: m.contact || '—',
    })),
  };
}

function buildStats(attendance: any[], submissionCount: number) {
  const present = attendance.filter((a: any) => a.status === 'present').length;
  const total = attendance.length;
  const pct = total > 0 ? Math.round((present / total) * 100) : 0;

  return {
    attendance: {
      percentage: pct,
      present: present,
      total: total,
    },
    submissions: submissionCount,
    gradePoint: '—',
  };
}

export function StudentDashboard() {
  const navigate = useNavigate();
  const { profile } = useAuthContext();
  const [loading, setLoading] = useState(true);
  const [activeProject, setActiveProject] = useState<any>(null);
  const [team, setTeam] = useState<any>({ name: 'No Group', size: 0, members: [] });
  const [stats, setStats] = useState<any>({ attendance: { percentage: 0, present: 0, total: 0 }, submissions: 0, gradePoint: '—' });
  const [projectId, setProjectId] = useState<string | null>(null);

  useEffect(() => {
    if (!profile?.id) return;

    const load = async () => {
      setLoading(true);

      // 1. Find groups the student belongs to
      const { data: memberships, error: membershipError } = await supabase
        .from('group_members')
        .select('group_id, groups!inner(id, name, group_code, problem_statement, mentor_name, tech_stack, project_id, projects(id, title))')
        .eq('student_id', profile.id);

      console.log('[STUDENT] Profile ID:', profile.id, 'Memberships:', memberships, 'Error:', membershipError?.message);

      if (!memberships || memberships.length === 0) {
        setLoading(false);
        return;
      }

      // Use the first membership as the active project
      const membership = memberships[0] as any;
      const group = membership.groups;
      const project = group?.projects;
      const groupId = group?.id;
      const pId = project?.id;
      setProjectId(pId);

      // 2. Get tasks for this project
      const { data: tasks } = await supabase
        .from('tasks')
        .select('*')
        .eq('project_id', pId)
        .order('created_at', { ascending: true });

      setActiveProject(buildActiveProject(project, tasks || [], group));

      // 3. Get group members
      const { data: membersData } = await supabase
        .from('group_members')
        .select('profiles(id, full_name, roll_no, contact)')
        .eq('group_id', groupId);
      const members = membersData?.map((m: any) => m.profiles).filter(Boolean) || [];
      setTeam(buildTeam(group, members));

      // 4. Get attendance + submission counts
      const [{ data: attData }, { data: subData }] = await Promise.all([
        supabase
          .from('attendance_logs')
          .select('status')
          .eq('student_id', profile.id)
          .eq('project_id', pId),
        supabase
          .from('submissions')
          .select('id')
          .eq('group_id', groupId),
      ]);

      setStats(buildStats(attData || [], subData?.length || 0));
      setLoading(false);
    };

    load();
  }, [profile?.id]);

  if (loading) {
    return (
      <div className="bg-surface font-body text-on-surface antialiased min-h-screen">
        <StudentSidebar />
        <StudentHeader />
        <main className="pl-56 pt-14 p-8 w-full flex justify-center items-center">
          <Loader2 className="animate-spin text-primary mt-20" size={32} />
        </main>
      </div>
    );
  }

  return (
    <div className="bg-surface font-body text-on-surface antialiased min-h-screen">
      <StudentSidebar />
      <StudentHeader />
      
      <main className="pl-56 pt-14 p-8 w-full">
        <div className="max-w-[1400px] mx-auto grid grid-cols-12 gap-8 pb-24">
          
          {/* Left Column: Main Dashboard */}
          <div className="col-span-12 lg:col-span-9 space-y-8 animate-slide-up" style={{ animationDelay: '0ms' }}>
            {/* Hero Card: Current Project */}
            {activeProject ? (
              <div onClick={() => projectId && navigate(`/student/project/${projectId}`)} className="cursor-pointer">
                <ProjectHeroCard project={activeProject} />
              </div>
            ) : (
              <section className="bg-surface-container-lowest border border-outline-variant/20 rounded-xl p-8 text-center">
                <p className="text-on-surface-variant">You are not assigned to any project yet.</p>
              </section>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Team Section */}
              <TeamSection team={team} />

              {/* Submission Portal */}
              <SubmissionPortal />
            </div>

            {/* Bento Stats Area */}
            <BentoStats stats={stats} />
          </div>

          {/* Right Column */}
          <div className="col-span-12 lg:col-span-3 space-y-8 animate-slide-up" style={{ animationDelay: '50ms' }}>
            <section className="bg-surface-container-lowest border border-outline-variant/10 rounded-xl p-6">
              <h3 className="font-headline font-bold text-sm mb-4">Quick Links</h3>
              <div className="space-y-3">
                {projectId && (
                  <>
                    <button
                      onClick={() => navigate(`/student/project/${projectId}`)}
                      className="w-full text-left text-sm p-3 rounded hover:bg-surface-container-low transition-colors text-on-surface"
                    >
                      📂 Project Detail
                    </button>
                    <button
                      onClick={() => navigate(`/student/attendance/${projectId}`)}
                      className="w-full text-left text-sm p-3 rounded hover:bg-surface-container-low transition-colors text-on-surface"
                    >
                      📊 Attendance Record
                    </button>
                  </>
                )}
              </div>
            </section>
          </div>

        </div>
      </main>

      {/* Floating Action Button */}
      {projectId && (
        <button
          onClick={() => navigate(`/student/project/${projectId}`)}
          className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-br from-primary to-primary-container text-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform active:scale-95 z-50"
        >
          <Plus size={24} />
        </button>
      )}

    </div>
  );
}
