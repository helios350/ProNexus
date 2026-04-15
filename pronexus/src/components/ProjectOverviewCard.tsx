import { ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Props {
  project: any;
}

export function ProjectOverviewCard({ project }: Props) {
  const navigate = useNavigate();

  return (
    <div 
      onClick={() => navigate(`/teacher/project/${project.id}`)}
      className="bg-surface-container-lowest border border-outline-variant/30 rounded-lg p-6 hover:border-primary/30 transition-colors group cursor-pointer"
    >
      <div className="flex justify-between items-start mb-6">
        <div className="space-y-1">
          <span className="font-mono text-[10px] px-2 py-0.5 rounded text-primary bg-primary-fixed uppercase">
            BATCH: {project.batches?.name || 'Unassigned'}
          </span>
          <h3 className="font-headline font-bold text-lg text-on-surface mt-2">{project.title}</h3>
        </div>
        <ArrowUpRight className="w-5 h-5 transition-colors text-on-surface-variant group-hover:text-primary" />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs font-medium text-on-surface-variant">
          <span>Assigned Groups</span>
          <span className="font-mono font-bold text-on-surface">{project.groups?.[0]?.count || 0}</span>
        </div>

        <div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden">
          <div 
            className="h-full rounded-full bg-primary" 
            style={{ width: `${Math.min(100, Math.max(10, (project.groups?.[0]?.count || 0) * 10))}%` }} 
          />
        </div>

        {project.groups?.[0]?.count > 0 && (
          <div className="flex items-center gap-2 pt-2">
            <CheckCircle2 className="w-4 h-4 text-primary" />
            <span className="text-xs text-on-surface-variant">Project is active</span>
          </div>
        )}
      </div>
    </div>
  );
}
