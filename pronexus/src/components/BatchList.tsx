import React, { useState } from 'react';
import { Filter, ArrowUpDown, Users, ChevronRight, ChevronDown, Trash2, UserPlus, X } from 'lucide-react';

const statusStyles: Record<string, { bg: string; text: string }> = {
  'Approved': { bg: 'bg-secondary-fixed', text: 'text-on-secondary-fixed-variant' },
  'Pending': { bg: 'bg-tertiary-fixed', text: 'text-tertiary' },
  'Closed': { bg: 'bg-surface-container-high', text: 'text-on-surface-variant' },
  'Active': { bg: 'bg-secondary-fixed', text: 'text-on-secondary-fixed-variant' },
};

interface BatchItem {
  id: string;
  fullId: string;
  initial: string;
  title: string;
  students: number;
  status: string;
}

interface StudentInBatch {
  id: string;
  full_name: string;
  email: string;
  roll_no: string | null;
}

interface BatchListProps {
  batches: BatchItem[];
  allStudents: StudentInBatch[];
  onDeleteBatch: (fullId: string) => void;
  onAddStudentToBatch: (studentId: string, batchId: string) => void;
  onRemoveStudentFromBatch: (studentId: string) => void;
}

export const BatchList: React.FC<BatchListProps> = ({ batches, allStudents, onDeleteBatch, onAddStudentToBatch, onRemoveStudentFromBatch }) => {
  const [expandedBatchId, setExpandedBatchId] = useState<string | null>(null);
  const [showAddStudent, setShowAddStudent] = useState<string | null>(null);

  const toggleExpand = (fullId: string) => {
    setExpandedBatchId(prev => prev === fullId ? null : fullId);
    setShowAddStudent(null);
  };

  return (
    <div className="lg:col-span-2 space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-headline font-semibold text-on-surface">Batch Management</h3>
        <div className="flex gap-2">
          <button className="p-1.5 text-on-surface-variant hover:bg-surface-container rounded transition-colors">
            <Filter size={18} />
          </button>
          <button className="p-1.5 text-on-surface-variant hover:bg-surface-container rounded transition-colors">
            <ArrowUpDown size={18} />
          </button>
        </div>
      </div>
      
      {batches.map((batch) => {
        const style = statusStyles[batch.status] || statusStyles['Active'];
        const isExpanded = expandedBatchId === batch.fullId;
        const studentsInBatch = allStudents.filter(s => true); // We filter by batch on the parent side
        const batchStudents = allStudents.filter(s => {
          // We need to match students to batch - this comes from the parent
          return true; // placeholder, actual filtering done via props
        });

        return (
          <div key={batch.fullId} className="bg-surface-container-lowest border border-outline-variant/10 rounded-lg overflow-hidden transition-all">
            {/* Batch Header (clickable) */}
            <div 
              onClick={() => toggleExpand(batch.fullId)}
              className="group p-5 flex items-center justify-between hover:bg-surface-container-low/50 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded bg-surface-container-low flex items-center justify-center font-bold text-on-surface-variant tracking-tighter">
                  {batch.initial}
                </div>
                <div>
                  <h4 className="font-semibold text-on-surface">{batch.title}</h4>
                  <p className="text-xs text-on-surface-variant flex items-center gap-3 mt-1">
                    <span className="font-mono">ID: {batch.id}</span>
                    <span className="flex items-center gap-1">
                      <Users size={14} /> 
                      {batch.students} Students
                    </span>
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <span className={`px-2 py-1 ${style.bg} ${style.text} text-[10px] font-bold uppercase tracking-wider rounded`}>
                  {batch.status}
                </span>
                {isExpanded ? (
                  <ChevronDown size={18} className="text-on-surface-variant transition-transform" />
                ) : (
                  <ChevronRight size={18} className="text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </div>
            </div>

            {/* Expanded Panel */}
            {isExpanded && (
              <div className="border-t border-outline-variant/10 bg-surface-container-low/30 px-5 py-4 space-y-4">
                {/* Action Buttons */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setShowAddStudent(showAddStudent === batch.fullId ? null : batch.fullId)}
                    className="flex items-center gap-2 text-xs font-medium text-primary hover:text-primary-container transition-colors px-3 py-1.5 bg-primary-fixed/30 rounded"
                  >
                    <UserPlus size={14} />
                    Add Student to Batch
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Delete batch "${batch.title}"? This will unassign all students from this batch.`)) {
                        onDeleteBatch(batch.fullId);
                      }
                    }}
                    className="flex items-center gap-2 text-xs font-medium text-error hover:text-on-error-container transition-colors px-3 py-1.5 bg-error-container/30 rounded"
                  >
                    <Trash2 size={14} />
                    Delete Batch
                  </button>
                </div>

                {/* Add Student Dropdown */}
                {showAddStudent === batch.fullId && (
                  <div className="bg-surface-container-lowest p-3 rounded shadow-sm space-y-2">
                    <p className="text-[10px] font-mono text-on-surface-variant uppercase tracking-wider">Unassigned Students</p>
                    {allStudents.length > 0 ? (
                      <div className="max-h-40 overflow-y-auto space-y-1">
                        {allStudents.map(student => (
                          <div key={student.id} className="flex items-center justify-between p-2 hover:bg-surface-container-low rounded transition-colors">
                            <div>
                              <p className="text-sm text-on-surface">{student.full_name}</p>
                              <p className="text-[10px] font-mono text-on-surface-variant">{student.roll_no || student.email}</p>
                            </div>
                            <button
                              onClick={() => onAddStudentToBatch(student.id, batch.fullId)}
                              className="text-[10px] font-bold text-primary hover:text-primary-container px-2 py-1 bg-primary-fixed/20 rounded transition-colors"
                            >
                              + Add
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-on-surface-variant py-2">No unassigned students available.</p>
                    )}
                  </div>
                )}

                {/* Students in this batch - placeholder message */}
                {batch.students === 0 ? (
                  <p className="text-xs text-on-surface-variant py-2 text-center">No students in this batch yet.</p>
                ) : (
                  <p className="text-[10px] font-mono text-on-surface-variant">
                    {batch.students} student(s) enrolled. View them in the Active Enrollment panel →
                  </p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
