import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Trash2, FileText, Loader2, Users, User, Calendar, CheckCircle2, Clock, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthContext } from '../contexts/AuthContext';
import { StudentSidebar } from '../components/StudentSidebar';

interface ProjectData {
  id: string;
  title: string;
  batches: { name: string } | null;
}

interface GroupData {
  id: string;
  name: string;
  group_code: string;
  problem_statement: string | null;
  tech_stack: string | null;
  mentor_name: string | null;
}

interface GroupMember {
  id: string;
  full_name: string;
  roll_no: string;
}

interface Task {
  id: string;
  title: string;
  deadline: string | null;
  is_open: boolean;
  created_at: string;
}

interface Submission {
  id: string;
  task_id: string;
  file_url: string;
  file_name: string;
  file_type: string | null;
  submitted_at: string;
}

interface AttendanceSummary {
  total: number;
  present: number;
  percentage: number;
}

export default function StudentProjectDetail() {
  const { id: projectId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useAuthContext();

  const [project, setProject] = useState<ProjectData | null>(null);
  const [group, setGroup] = useState<GroupData | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [attendance, setAttendance] = useState<AttendanceSummary>({ total: 0, present: 0, percentage: 0 });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');

  const loadData = useCallback(async () => {
    if (!projectId || !profile?.id) return;
    setLoading(true);

    // 1. Fetch project
    const { data: proj } = await supabase
      .from('projects')
      .select('id, title, batches(name)')
      .eq('id', projectId)
      .single();
    if (proj) setProject(proj as unknown as ProjectData);

    // 2. Find student's group in this project
    const { data: membershipData } = await supabase
      .from('group_members')
      .select('group_id, groups!inner(id, name, group_code, problem_statement, tech_stack, mentor_name, project_id)')
      .eq('student_id', profile.id);

    const myMembership = membershipData?.find(
      (m: any) => m.groups?.project_id === projectId
    );

    if (myMembership) {
      const g = myMembership.groups as unknown as GroupData;
      setGroup(g);

      // 3. Get all group members
      const { data: membersData } = await supabase
        .from('group_members')
        .select('profiles(id, full_name, roll_no)')
        .eq('group_id', g.id);
      if (membersData) {
        setMembers(membersData.map((m: any) => m.profiles).filter(Boolean));
      }

      // 4. Get group submissions
      const { data: subs } = await supabase
        .from('submissions')
        .select('*')
        .eq('group_id', g.id)
        .order('submitted_at', { ascending: false });
      if (subs) setSubmissions(subs);
    }

    // 5. Get tasks for this project
    const { data: tasksData } = await supabase
      .from('tasks')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true });
    if (tasksData) setTasks(tasksData);

    // 6. Get attendance summary
    const { data: attData } = await supabase
      .from('attendance_logs')
      .select('status')
      .eq('student_id', profile.id)
      .eq('project_id', projectId);
    if (attData) {
      const present = attData.filter(a => a.status === 'present').length;
      setAttendance({
        total: attData.length,
        present,
        percentage: attData.length > 0 ? Math.round((present / attData.length) * 100) : 0,
      });
    }

    setLoading(false);
  }, [projectId, profile?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !group || !selectedTaskId || !profile?.id) return;

    setUploading(true);
    const filePath = `${group.id}/${selectedTaskId}/${Date.now()}_${file.name}`;
    
    const { error: uploadError } = await supabase.storage
      .from('submissions')
      .upload(filePath, file);
    
    if (uploadError) {
      console.error('Upload failed:', uploadError);
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from('submissions')
      .getPublicUrl(filePath);

    await supabase.from('submissions').insert({
      group_id: group.id,
      task_id: selectedTaskId,
      file_url: urlData.publicUrl,
      file_name: file.name,
      file_type: file.type,
      submitted_by: profile.id,
    });

    setUploading(false);
    loadData();
  };

  const handleDeleteSubmission = async (sub: Submission) => {
    const path = sub.file_url.split('/submissions/')[1];
    if (path) {
      await supabase.storage.from('submissions').remove([path]);
    }
    await supabase.from('submissions').delete().eq('id', sub.id);
    loadData();
  };

  const getTaskStatus = (task: Task) => {
    const hasSubmission = submissions.some(s => s.task_id === task.id);
    if (!task.is_open) return 'COMPLETED';
    if (hasSubmission) return 'SUBMITTED';
    return 'ONGOING';
  };

  const statusBadgeStyles: Record<string, string> = {
    COMPLETED: 'bg-secondary-fixed text-on-secondary-fixed-variant',
    SUBMITTED: 'bg-secondary-fixed text-on-secondary-fixed-variant',
    ONGOING: 'bg-tertiary-fixed text-tertiary',
    UPCOMING: 'bg-surface-container-high text-on-surface-variant',
  };

  const completedTasks = tasks.filter(t => !t.is_open).length;
  const progressPercent = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

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
      <main className="pl-56 pt-10 px-8 max-w-6xl pb-12 transition-all">

        {/* Header */}
        <header className="mb-10">
          <div className="flex items-center gap-4 mb-3">
            <button
              onClick={() => navigate('/student')}
              className="w-8 h-8 flex items-center justify-center rounded bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest transition-colors"
            >
              <ArrowLeft size={16} />
            </button>
            <h1 className="font-headline text-[1.5rem] font-semibold text-on-surface tracking-[-0.02em]">
              {project?.title || 'Project Detail'}
            </h1>
          </div>
          <div className="pl-12 flex items-center gap-4">
            <span className="font-mono text-[11px] text-on-surface-variant tracking-tight">
              {project?.batches?.name || 'Batch'}
            </span>
            {group?.mentor_name && (
              <>
                <span className="text-outline-variant">·</span>
                <span className="font-mono text-[11px] text-on-surface-variant">
                  Mentor: {group.mentor_name}
                </span>
              </>
            )}
          </div>
        </header>

        <div className="space-y-8">
          {/* Group Info Card */}
          {group ? (
            <section className="bg-surface-container-lowest p-6 rounded-md shadow-[0_2px_8px_-2px_rgba(25,28,30,0.02)]">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="font-headline font-semibold text-on-surface">{group.name}</h2>
                <span className="px-2 py-0.5 bg-surface-container-high text-on-surface-variant font-mono text-[10px] font-bold rounded tracking-wider">
                  {group.group_code}
                </span>
              </div>

              {group.problem_statement && (
                <p className="text-sm text-on-surface-variant leading-relaxed mb-4 max-w-2xl">
                  {group.problem_statement}
                </p>
              )}

              {group.tech_stack && (
                <div className="flex flex-wrap gap-2 mb-5">
                  {group.tech_stack.split(',').map((tech, i) => (
                    <span key={i} className="px-2 py-1 bg-surface-container-high text-on-surface-variant font-mono text-[10px] font-medium rounded tracking-wide">
                      {tech.trim()}
                    </span>
                  ))}
                </div>
              )}

              {/* Team Members */}
              <div className="flex items-center gap-6 pt-4">
                <span className="text-[10px] font-mono text-outline uppercase tracking-widest">Team</span>
                <div className="flex items-center gap-5">
                  {members.map((member) => (
                    <div key={member.id} className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-surface-container-high flex items-center justify-center">
                        <User size={14} className="text-on-surface-variant" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-on-surface leading-none">
                          {member.full_name}
                          {member.id === profile?.id && (
                            <span className="ml-1 text-primary text-[9px] font-bold">(You)</span>
                          )}
                        </p>
                        <p className="font-mono text-[9px] text-outline">{member.roll_no}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          ) : (
            <section className="bg-surface-container-lowest p-6 rounded-md text-center">
              <Users size={24} className="mx-auto text-outline mb-2" />
              <p className="text-sm text-on-surface-variant">You are not assigned to any group in this project.</p>
            </section>
          )}

          {/* Task Progress */}
          <section className="bg-surface-container-lowest p-6 rounded-md shadow-[0_2px_8px_-2px_rgba(25,28,30,0.02)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-on-surface-variant font-bold">Milestones</h3>
              <span className="font-mono text-[11px] text-on-surface-variant">{progressPercent}% Complete</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-1.5 bg-surface-container-high rounded-sm mb-6 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-primary-container rounded-sm transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="space-y-1">
              {tasks.map((task) => {
                const status = getTaskStatus(task);
                return (
                  <div key={task.id} className="flex items-center justify-between p-3 rounded hover:bg-surface-container-low transition-colors cursor-default">
                    <div className="flex items-center gap-3">
                      {status === 'COMPLETED' || status === 'SUBMITTED' ? (
                        <CheckCircle2 size={16} className="text-secondary" />
                      ) : (
                        <Clock size={16} className="text-outline" />
                      )}
                      <span className={`text-sm font-medium ${status === 'COMPLETED' ? 'text-on-surface/60 line-through' : 'text-on-surface'}`}>
                        {task.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-[10px] text-outline">
                        {task.deadline ? new Date(task.deadline).toLocaleDateString('en-CA') : '—'}
                      </span>
                      <span className={`px-2 py-0.5 ${statusBadgeStyles[status]} font-mono text-[9px] font-bold rounded uppercase`}>
                        {status}
                      </span>
                    </div>
                  </div>
                );
              })}
              {tasks.length === 0 && (
                <p className="text-sm text-on-surface-variant text-center py-6">No tasks assigned yet.</p>
              )}
            </div>
          </section>

          {/* File Submission Zone */}
          {group && (
            <section className="bg-surface-container-lowest p-6 rounded-md shadow-[0_2px_8px_-2px_rgba(25,28,30,0.02)]">
              <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-on-surface-variant font-bold mb-4">File Submission</h3>

              {/* Task selector */}
              <div className="mb-4">
                <select
                  value={selectedTaskId}
                  onChange={(e) => setSelectedTaskId(e.target.value)}
                  className="bg-surface-container-low rounded px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-secondary/20 w-full max-w-xs"
                >
                  <option value="">Select a task to submit for...</option>
                  {tasks.filter(t => t.is_open).map(t => (
                    <option key={t.id} value={t.id}>{t.title}</option>
                  ))}
                </select>
              </div>

              {/* Upload zone */}
              <label className={`block border-2 border-dashed border-outline-variant/20 rounded p-8 text-center cursor-pointer transition-colors hover:border-primary/30 hover:bg-surface-container-low/50 ${!selectedTaskId ? 'opacity-50 pointer-events-none' : ''}`}>
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.ppt,.pptx,.doc,.docx"
                  onChange={handleFileUpload}
                  disabled={uploading || !selectedTaskId}
                />
                {uploading ? (
                  <Loader2 className="mx-auto animate-spin text-primary mb-2" size={28} />
                ) : (
                  <Upload className="mx-auto text-outline mb-2" size={28} />
                )}
                <p className="text-sm font-medium text-on-surface">
                  {uploading ? 'Uploading...' : 'Drag & Drop your file'}
                </p>
                <p className="text-on-surface-variant text-xs mt-1">or click to browse</p>
                <p className="font-mono text-[10px] text-outline mt-2">PDF, PPT, DOC — Max 20MB</p>
              </label>

              {/* Submitted files */}
              {submissions.length > 0 && (
                <div className="mt-6 space-y-2">
                  <p className="text-[10px] font-mono text-outline uppercase tracking-widest mb-2">Previous Submissions</p>
                  {submissions.map((sub) => (
                    <div key={sub.id} className="flex items-center justify-between p-3 bg-surface-container-low rounded hover:bg-surface-container transition-colors">
                      <div className="flex items-center gap-3">
                        <FileText size={16} className="text-on-surface-variant" />
                        <div>
                          <a href={sub.file_url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-on-surface hover:text-primary transition-colors">
                            {sub.file_name}
                          </a>
                          <p className="font-mono text-[9px] text-outline">
                            {new Date(sub.submitted_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteSubmission(sub)}
                        className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error-container/30 rounded transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Attendance Strip */}
          <section className="bg-surface-container-low p-5 rounded-md flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="flex items-center gap-3">
                <Calendar size={18} className="text-on-surface-variant" />
                <span className="text-sm font-semibold text-on-surface">{attendance.percentage}% Attendance</span>
              </div>
              <span className="font-mono text-[11px] text-outline">
                {attendance.present}/{attendance.total} Sessions Present
              </span>
            </div>
            <button
              onClick={() => navigate(`/student/attendance/${projectId}`)}
              className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary-container transition-colors"
            >
              View Full Record
              <ChevronRight size={14} />
            </button>
          </section>
        </div>
      </main>
    </div>
  );
}
