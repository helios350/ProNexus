import { useState, useEffect } from 'react';
import { X, PlusCircle, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  project: any;
  onSuccess?: () => void;
}

export function CreateGroupModal({ isOpen, onClose, project, onSuccess }: Props) {
  const [selectedStudents, setSelectedStudents] = useState<any[]>([]);
  const [availableStudents, setAvailableStudents] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [mentorName, setMentorName] = useState('');
  const [techStackInput, setTechStackInput] = useState('');
  const [problemStatement, setProblemStatement] = useState('');

  useEffect(() => {
    if (isOpen && project?.batch_id) {
      loadStudents();
    }
  }, [isOpen, project]);

  const loadStudents = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'student')
      .eq('batch_id', project.batch_id);
    
    if (data) {
      setAvailableStudents(data);
    }
  };

  if (!isOpen) return null;

  const removeStudent = (id: string) => {
    setSelectedStudents(prev => prev.filter(s => s.id !== id));
  };

  const addStudent = (student: any) => {
    if (!selectedStudents.find(s => s.id === student.id)) {
      setSelectedStudents([...selectedStudents, student]);
    }
    setSearchQuery('');
  };

  const filteredStudents = availableStudents.filter(s => 
    s.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.roll_no?.toLowerCase().includes(searchQuery.toLowerCase())
  ).filter(s => !selectedStudents.find(selected => selected.id === s.id));

  const handleCreate = async () => {
    if (!title) return;
    setLoading(true);

    const techStack = techStackInput.split(',').map(s => s.trim()).filter(Boolean);

    // Create the group
    const { data: groupData, error: groupError } = await supabase
      .from('groups')
      .insert({
        project_id: project.id,
        name: title,
        problem_statement: problemStatement || null,
        mentor_name: mentorName,
        tech_stack: techStack.join(', '),
        group_code: `G-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`
      })
      .select()
      .single();

    if (groupError) {
      console.error(groupError);
      setLoading(false);
      return;
    }

    // Insert group members (mappings)
    // We would need a group_members mapping table here. 
    // Since we don't have the exact schema right now, I'll log a mock warning or 
    // assume there is a `group_members` table
    const membersData = selectedStudents.map(student => ({
      group_id: groupData.id,
      student_id: student.id
    }));
    
    if (membersData.length > 0) {
      // Trying to insert mappings
      const { error: membersError } = await supabase.from('group_members').insert(membersData);
      if (membersError) console.error('Failed to insert members:', membersError);
    }

    setLoading(false);
    if (onSuccess) onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-on-surface/20 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl overflow-hidden shadow-2xl w-full max-w-2xl animate-fade-in">
        
        <div className="px-6 py-4 border-b border-outline-variant/20 flex items-center justify-between bg-surface-container-low/50">
          <h3 className="font-headline font-semibold text-on-surface">New Group Configuration</h3>
          <button onClick={onClose} className="p-1 hover:bg-surface-container-high rounded-full transition-colors">
            <X className="w-5 h-5 text-on-surface-variant hover:text-on-surface" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                Group Name / Title
              </label>
              <input 
                type="text" 
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full bg-surface-container-low border-none rounded-md px-4 py-2.5 text-sm focus:ring-2 focus:ring-secondary/20 placeholder:text-outline-variant" 
                placeholder="Neural Vision Labs"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                Mentor Name
              </label>
              <input 
                type="text" 
                value={mentorName}
                onChange={e => setMentorName(e.target.value)}
                className="w-full bg-surface-container-low border-none rounded-md px-4 py-2.5 text-sm focus:ring-2 focus:ring-secondary/20 placeholder:text-outline-variant" 
                placeholder="Dr. Sarah Jenkins"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
              Problem Statement
            </label>
            <textarea 
              value={problemStatement}
              onChange={e => setProblemStatement(e.target.value)}
              className="w-full bg-surface-container-low border-none rounded-md px-4 py-2.5 text-sm focus:ring-2 focus:ring-secondary/20 placeholder:text-outline-variant resize-none" 
              placeholder="Describe the group's problem statement or research topic..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
              Tech Stack
            </label>
            <input 
              type="text" 
              value={techStackInput}
              onChange={e => setTechStackInput(e.target.value)}
              className="w-full bg-surface-container-low border-none rounded-md px-4 py-2.5 text-sm focus:ring-2 focus:ring-secondary/20 placeholder:text-outline-variant" 
              placeholder="React, Node.js, TensorFlow (comma separated)"
            />
          </div>

          <div className="space-y-2 relative">
            <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
              Smart Dropdown: Multi-select Students
            </label>
            
            <div className="w-full bg-surface-container-low rounded-md px-4 py-3 flex flex-wrap gap-2 items-center min-h-[48px]">
              {selectedStudents.map(student => (
                <span key={student.id} className="bg-surface-container-lowest border border-outline-variant/30 text-[11px] font-mono px-2 py-1 rounded flex items-center gap-2">
                  {student.roll_no || student.full_name}
                  <X 
                    className="w-3 h-3 cursor-pointer text-on-surface-variant hover:text-error" 
                    onClick={() => removeStudent(student.id)} 
                  />
                </span>
              ))}
              <input 
                type="text" 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent border-none p-0 text-sm focus:ring-0 placeholder:text-outline-variant min-w-[150px]" 
                placeholder="Search by name or UID..."
                onFocus={() => setIsDropdownOpen(true)}
                onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
              />
            </div>

            {isDropdownOpen && filteredStudents.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-surface-container-lowest border border-outline-variant/30 rounded-md shadow-xl z-10 max-h-48 overflow-y-auto no-scrollbar">
                {filteredStudents.map(student => (
                  <div 
                    key={student.id}
                    className="p-3 hover:bg-surface-container-low cursor-pointer flex items-center justify-between group"
                    onClick={() => addStudent(student)}
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{student.full_name}</span>
                      <span className="text-[10px] font-mono text-on-surface-variant">{student.roll_no || 'No UID'}</span>
                    </div>
                    <PlusCircle className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-outline-variant/20 bg-surface-container-low/20 flex justify-end gap-3">
          <button onClick={onClose} disabled={loading} className="px-4 py-2 text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors">
            Discard
          </button>
          <button 
            onClick={handleCreate} 
            disabled={loading || !title}
            className="flex items-center justify-center gap-2 bg-on-surface text-white px-6 py-2 rounded-md text-sm font-medium ghost-shadow active:scale-95 transition-transform disabled:opacity-50"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            Finalize Group
          </button>
        </div>
      </div>
    </div>
  );
}
