import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TeacherSidebar } from '../components/TeacherSidebar';
import { TeacherHeader } from '../components/TeacherHeader';
import { GroupCard } from '../components/GroupCard';
import { TaskManager } from '../components/TaskManager';
import { CreateGroupModal } from '../components/CreateGroupModal';
import { SubmissionsView } from '../components/SubmissionsView';
import { supabase } from '../lib/supabase';
import { Loader2, ArrowLeft, Plus } from 'lucide-react';

export function ProjectDetail() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<'groups' | 'tasks' | 'submissions'>('groups');
  const [project, setProject] = useState<any>(null);
  const [groups, setGroups] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);

  const loadProjectDetails = async () => {
    if (!projectId) return;
    setLoading(true);
      
      // Fetch project details
      const { data: projData } = await supabase
        .from('projects')
        .select(`
          *,
          batches:batch_id (name)
        `)
        .eq('id', projectId)
        .single();
        
      if (projData) setProject(projData);

      // Fetch groups with members
      const { data: groupsData } = await supabase
        .from('groups')
        .select(`
          *,
          group_members (
            profiles ( * )
          )
        `)
        .eq('project_id', projectId);
        
      if (groupsData) {
        // Flatten the members for easy UI consumption
        const formattedGroups = groupsData.map((g: any) => ({
          ...g,
          members: g.group_members?.map((gm: any) => gm.profiles) || [],
          tech_stack: typeof g.tech_stack === 'string' ? g.tech_stack.split(',').map((s: string) => s.trim()).filter(Boolean) : g.tech_stack
        }));
        setGroups(formattedGroups);
      }
      
      // Tasks fetching
      const { data: tasksData } = await supabase
        .from('tasks')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });
        
      if (tasksData) setTasks(tasksData);

      // Submissions fetching (where group_id is in the fetched groups)
      if (groupsData && groupsData.length > 0) {
        const groupIds = groupsData.map((g: any) => g.id);
        const { data: subsData } = await supabase
          .from('submissions')
          .select('*, tasks(title), groups(problem_statement), profiles:submitted_by(full_name)')
          .in('group_id', groupIds)
          .order('submitted_at', { ascending: false });
          
        if (subsData) setSubmissions(subsData);
      } else {
        setSubmissions([]);
      }

      setLoading(false);
    }

  useEffect(() => {
    loadProjectDetails();
  }, [projectId]);

  if (loading) {
    return (
      <div className="bg-surface font-body text-on-surface antialiased min-h-screen">
        <TeacherSidebar />
        <TeacherHeader />
        <main className="pl-56 pt-24 px-8 max-w-7xl pb-12 flex justify-center items-center h-full">
          <Loader2 className="animate-spin text-primary mt-20" size={32} />
        </main>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="bg-surface font-body text-on-surface antialiased min-h-screen">
        <TeacherSidebar />
        <TeacherHeader />
        <main className="pl-56 pt-24 px-8 max-w-7xl pb-12">
          <p className="text-error">Project not found or you lack permission to view it.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="bg-surface font-body text-on-surface antialiased min-h-screen">
      <TeacherSidebar />
      <TeacherHeader />
      <main className="pl-56 pt-24 px-8 max-w-7xl pb-12 transition-all">
        
        {/* Header Section */}
        <header className="mb-10">
          <div className="flex items-center gap-4 mb-4">
            <button 
              onClick={() => navigate('/teacher')}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest transition-colors"
            >
              <ArrowLeft size={16} />
            </button>
            <h1 className="text-3xl font-extrabold tracking-tight text-on-surface">
              {project.title}
            </h1>
          </div>
          <div className="flex items-center gap-4 font-label text-[11px] tracking-tighter text-on-surface-variant">
            <span className="bg-surface-container-high px-2 py-0.5 rounded uppercase">ID: {project.id.substring(0,8)}</span>
            <span className="flex items-center gap-1 font-mono uppercase bg-primary-fixed text-primary px-2 py-0.5 rounded">
              Batch: {project.batches?.name || 'Unassigned'}
            </span>
            <span className="flex items-center gap-1 font-mono bg-surface-container-high px-2 py-0.5 rounded">
              Created: {new Date(project.created_at).toLocaleDateString()}
            </span>
          </div>
        </header>

        {/* Tab Navigation */}
        <div className="flex gap-12 mb-8 border-b border-outline-variant/20">
          <button 
            onClick={() => setActiveTab('groups')}
            className={`pb-2 font-semibold text-sm transition-colors relative ${activeTab === 'groups' ? 'text-primary' : 'text-on-surface-variant hover:text-primary'}`}
          >
            Groups
            {activeTab === 'groups' && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-primary" />}
          </button>
          <button 
            onClick={() => setActiveTab('tasks')}
            className={`pb-2 font-semibold text-sm transition-colors relative ${activeTab === 'tasks' ? 'text-primary' : 'text-on-surface-variant hover:text-primary'}`}
          >
            Tasks
            {activeTab === 'tasks' && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-primary" />}
          </button>
          <button 
            onClick={() => setActiveTab('submissions')}
            className={`pb-2 font-semibold text-sm transition-colors relative ${activeTab === 'submissions' ? 'text-primary' : 'text-on-surface-variant hover:text-primary'}`}
          >
            Submissions
            {activeTab === 'submissions' && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-primary" />}
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'groups' && (
          <section className="animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-on-surface">Project Groups</h2>
              <button 
                onClick={() => setIsGroupModalOpen(true)}
                className="bg-gradient-to-br from-primary to-primary-container text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 hover:brightness-110 shadow-sm ghost-shadow transition-transform active:scale-95"
              >
                <Plus size={16} /> Create Group
              </button>
            </div>
            
            {groups.length === 0 ? (
               <div className="p-12 text-center text-sm text-on-surface-variant bg-surface-container-lowest rounded-lg border border-outline-variant/30">
                 No groups organized yet. Click "Create Group" to start forming teams.
               </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groups.map((g: any) => <GroupCard key={g.id} group={g} />)}
              </div>
            )}
          </section>
        )}

        {activeTab === 'tasks' && (
          <div className="animate-fade-in border border-outline-variant/20 rounded-xl bg-surface p-1 shadow-sm mt-4">
             <TaskManager projectId={project.id} tasks={tasks} onTaskChange={loadProjectDetails} />
          </div>
        )}

        {activeTab === 'submissions' && (
          <SubmissionsView tasks={tasks} groups={groups} submissions={submissions} />
        )}

      </main>

      {/* Modals */}
      <CreateGroupModal 
        isOpen={isGroupModalOpen} 
        onClose={() => setIsGroupModalOpen(false)} 
        project={project}
        onSuccess={loadProjectDetails}
      />
    </div>
  );
}
