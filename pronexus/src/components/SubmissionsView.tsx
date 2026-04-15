import { FileText, Download } from 'lucide-react';
import { useMemo, useState } from 'react';

export interface SubmissionsViewProps {
  tasks: any[];
  groups: any[];
  submissions: any[];
}

export function SubmissionsView({ tasks, groups, submissions }: SubmissionsViewProps) {
  const [selectedTaskId, setSelectedTaskId] = useState<string>('all');

  // Filter submissions by selected task
  const filteredSubmissions = useMemo(() => {
    if (selectedTaskId === 'all') return submissions;
    return submissions.filter(s => s.task_id === selectedTaskId);
  }, [submissions, selectedTaskId]);

  // Group filtered submissions by group_id
  const groupedSubs = useMemo(() => {
    const result: Record<string, any[]> = {};
    filteredSubmissions.forEach(sub => {
      const gid = sub.group_id;
      if (!result[gid]) result[gid] = [];
      result[gid].push(sub);
    });
    return result;
  }, [filteredSubmissions]);

  // Helper to get group name (using problem statement as a proxy for name if they don't have one)
  const getGroupName = (groupId: string) => {
    const group = groups.find(g => g.id === groupId);
    return group ? (group.problem_statement || group.tech_stack || 'Unnamed Group') : 'Unknown Group';
  };

  const getTaskName = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    return task?.title || 'Unknown Task';
  };

  return (
    <section className="bg-surface-container-low pt-8 pb-12 rounded-xl animate-fade-in mt-4">
      <div className="px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-on-surface-variant font-bold">Submissions</h3>
            <div className="mt-2 text-[11px] font-label text-outline-variant flex items-center gap-2">
              <span>Filter by Task:</span>
              <select 
                className="bg-transparent border-b border-outline-variant/30 text-on-surface font-semibold focus:outline-none"
                value={selectedTaskId}
                onChange={(e) => setSelectedTaskId(e.target.value)}
              >
                <option value="all">All Tasks</option>
                {tasks.map(t => (
                  <option key={t.id} value={t.id}>{t.title}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {filteredSubmissions.length === 0 ? (
          <div className="p-12 text-center text-sm text-on-surface-variant bg-surface-container-lowest rounded-lg border border-outline-variant/30">
            No submissions found for the selected criteria.
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedSubs).map(([groupId, subs], index) => {
              const themeColor = ['bg-primary', 'bg-secondary', 'bg-tertiary'][index % 3];
              return (
                <div key={groupId}>
                  <h4 className="text-sm font-bold text-on-surface mb-3 flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${themeColor}`}></span>
                    {getGroupName(groupId)}
                  </h4>
                  
                  <div className="space-y-[1px]">
                    {subs.map((sub, i) => (
                      <div 
                        key={sub.id} 
                        className={`bg-surface-container-lowest p-4 flex items-center gap-4 transition-colors hover:bg-surface-container-low/60 ${i === 0 ? 'rounded-t-lg' : ''} ${i === subs.length - 1 ? 'rounded-b-lg' : ''}`}
                      >
                        {/* Fake icon color based on type */}
                        <FileText className={sub.file_type?.includes('pdf') ? "text-error" : "text-primary"} size={20} strokeWidth={1.5} />
                        
                        <div className="flex flex-col flex-1 overflow-hidden">
                          <span className="text-sm font-medium text-on-surface truncate">
                            {sub.file_name || 'submission_file'}
                            <span className="ml-2 font-mono text-[9px] text-outline px-1.5 py-0.5 bg-surface-container rounded uppercase">
                              {getTaskName(sub.task_id)}
                            </span>
                          </span>
                          <span className="font-mono text-[9px] text-outline uppercase tracking-tight mt-1">
                            Submitted by: <span className="font-bold text-on-surface-variant">{sub.profiles?.full_name || 'Unknown'}</span>
                          </span>
                        </div>
                        
                        <a 
                          href={sub.file_url} 
                          target="_blank" 
                          rel="noreferrer"
                          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors"
                        >
                          <Download size={16} className="text-outline hover:text-on-surface transition-colors" />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
