import { Verified } from 'lucide-react';
import type { StudentData } from '../data/mockStudentData';

interface Props {
  stats: StudentData['stats'];
}

export function BentoStats({ stats }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Attendance Box */}
      <div className="bg-surface-container-lowest border border-outline-variant/10 p-4 rounded-lg">
        <p className="text-[10px] font-mono text-on-surface-variant mb-1 uppercase tracking-wider">Attendance</p>
        <div className="flex items-end justify-between">
          <p className="text-xl font-bold">{stats.attendance.percentage}%</p>
          <span className="text-[10px] text-secondary font-mono">{stats.attendance.trend}</span>
        </div>
      </div>

      {/* Submissions Box */}
      <div className="bg-surface-container-lowest border border-outline-variant/10 p-4 rounded-lg">
        <p className="text-[10px] font-mono text-on-surface-variant mb-1 uppercase tracking-wider">Submissions</p>
        <div className="flex items-end justify-between">
          <p className="text-xl font-bold">{stats.submissions}</p>
          <Verified className="text-secondary w-5 h-5" />
        </div>
      </div>

      {/* Grade Point Box */}
      <div className="bg-surface-container-lowest border border-outline-variant/10 p-4 rounded-lg">
        <p className="text-[10px] font-mono text-on-surface-variant mb-1 uppercase tracking-wider">Grade Point</p>
        <div className="flex items-end justify-between">
          <p className="text-xl font-bold">{stats.gradePoint}</p>
          <div className="flex gap-0.5">
            <span className="w-1 h-3 bg-primary rounded-full"></span>
            <span className="w-1 h-4 bg-primary rounded-full"></span>
            <span className="w-1 h-2 bg-primary rounded-full"></span>
            <span className="w-1 h-5 bg-primary rounded-full"></span>
          </div>
        </div>
      </div>
    </div>
  );
}
