import React from 'react';
import { Trash2 } from 'lucide-react';

interface ActiveEnrollmentProps {
  enrollments: Array<{
    id: string;
    initial: string;
    bgClass: string;
    name: string;
    roll: string;
    status: string;
  }>;
  onDelete?: (id: string) => void;
}

export const ActiveEnrollment: React.FC<ActiveEnrollmentProps> = ({ enrollments, onDelete }) => {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-lg ghost-shadow overflow-hidden">
      <div className="p-6 border-b border-outline-variant/10 bg-surface-container-low/50">
        <h3 className="font-headline font-bold text-on-surface tracking-tight">Active Enrollment</h3>
        <p className="text-xs text-on-surface-variant mt-1">Live data feed for current intake.</p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low/30">
              <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Name</th>
              <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Roll No</th>
              <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Status</th>
              <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/10">
            {enrollments.map((student, idx) => (
              <tr key={idx} className="hover:bg-surface-container-low transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${student.bgClass}`}>
                      {student.initial}
                    </div>
                    <span className="text-xs font-medium text-on-surface">{student.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="font-mono text-[10px] text-on-surface-variant">{student.roll}</span>
                </td>
                <td className="px-6 py-4">
                  <div className={`w-2 h-2 rounded-full ${student.status === 'active' ? 'bg-secondary' : 'bg-tertiary'}`}></div>
                </td>
                <td className="px-6 py-4 text-right">
                  {onDelete && (
                    <button onClick={() => onDelete(student.id)} className="text-error opacity-50 hover:opacity-100 transition-opacity">
                      <Trash2 size={16} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div className="p-4 bg-surface-container-low/20 flex justify-center border-t border-outline-variant/10">
          <button className="text-[10px] uppercase tracking-widest font-bold text-primary hover:underline">
            View Spreadsheet
          </button>
        </div>
      </div>
    </div>
  );
};
