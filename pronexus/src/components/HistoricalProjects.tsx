import { History } from 'lucide-react';
import type { StudentData } from '../data/mockStudentData';

interface Props {
  history: StudentData['history'];
}

export function HistoricalProjects({ history }: Props) {
  
  const getBadgeStyle = (type: string) => {
    switch (type) {
      case 'grade-a-plus':
      case 'grade-a':
        return 'bg-secondary-fixed text-on-secondary-fixed-variant';
      case 'completed':
        return 'bg-surface-container-high text-on-surface-variant';
      default:
        return 'bg-surface-container-high text-on-surface-variant';
    }
  };

  return (
    <section className="bg-surface-container-lowest border border-outline-variant/10 rounded-xl p-6 h-fit shrink-0">
      <h3 className="font-headline font-bold text-sm mb-6 flex items-center gap-2">
        <History size={16} /> Historical Projects
      </h3>

      <div className="space-y-6">
        {history.map((item, idx) => (
          <div key={idx} className="relative pl-4 border-l border-outline-variant/30 group hover:border-primary transition-colors cursor-pointer">
            <p className="text-[10px] font-mono text-on-surface-variant uppercase">{item.semester}</p>
            <h4 className="text-xs font-bold text-on-surface mt-1 group-hover:text-primary transition-colors">{item.title}</h4>
            <div className="flex gap-2 mt-2">
              <span className={`text-[9px] px-1.5 py-0.5 rounded ${getBadgeStyle(item.statusType)}`}>
                {item.statusLabel}
              </span>
            </div>
          </div>
        ))}
      </div>

      <button className="w-full mt-8 text-[10px] font-mono font-bold text-on-surface-variant hover:text-primary transition-colors text-center uppercase tracking-widest py-2 border border-outline-variant/20 rounded-lg">
        Archive View
      </button>
    </section>
  );
}
