import { useState, useEffect } from 'react';
import { Check, Save, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthContext } from '../contexts/AuthContext';

interface Props {
  projects: any[];
}

export function AttendanceLedger({ projects }: Props) {
  const { user } = useAuthContext();
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  
  const [students, setStudents] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId]);

  useEffect(() => {
    async function loadAttendanceData() {
      if (!selectedProjectId) return;
      
      setLoading(true);
      const project = projects.find(p => p.id === selectedProjectId);
      if (!project || !project.batch_id) {
        setStudents([]);
        setAttendance({});
        setLoading(false);
        return;
      }

      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'student')
        .eq('batch_id', project.batch_id);

      const { data: logs } = await supabase
        .from('attendance_logs')
        .select('*')
        .eq('project_id', selectedProjectId)
        .eq('date', selectedDate);

      const studentsData = profiles || [];
      const logsData = logs || [];

      const presence: Record<string, boolean> = {};
      studentsData.forEach(s => presence[s.id] = false);
      logsData.forEach(log => {
        presence[log.student_id] = log.status;
      });

      setStudents(studentsData);
      setAttendance(presence);
      setLoading(false);
    }

    loadAttendanceData();
  }, [selectedProjectId, selectedDate, projects]);

  const toggleAttendance = (id: string) => {
    setAttendance(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleSave = async () => {
    if (!selectedProjectId || !user) return;
    setSaving(true);

    try {
      const upserts = students.map(s => ({
        project_id: selectedProjectId,
        student_id: s.id,
        date: selectedDate,
        status: attendance[s.id] || false,
        marked_by: user.id
      }));

      const { error } = await supabase.from('attendance_logs').upsert(
        upserts, 
        { onConflict: 'project_id, student_id, date' }
      );
      
      if (error) throw error;
      
      alert('Attendance saved successfully');
    } catch (e: any) {
      alert('Error saving: ' + (e.message || e));
    } finally {
      setSaving(false);
    }
  };

  const getThemeClass = (index: number) => {
    const classes = [
      'bg-primary-fixed text-primary',
      'bg-secondary-fixed text-secondary',
      'bg-tertiary-fixed text-tertiary',
      'bg-surface-container-high text-on-surface-variant'
    ];
    return classes[index % classes.length];
  };

  return (
    <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl h-full flex flex-col">
      <div className="p-6 border-b border-outline-variant/20 flex flex-col gap-3">
        <h3 className="font-headline font-bold text-lg text-on-surface">Lab Attendance</h3>
        <div className="flex gap-2">
           <select 
             className="bg-surface-container-low text-on-surface text-sm p-1.5 rounded border border-outline-variant/20 flex-1"
             value={selectedProjectId}
             onChange={(e) => setSelectedProjectId(e.target.value)}
           >
             {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
           </select>
           <input 
             type="date"
             className="bg-surface-container-low text-on-surface text-sm p-1.5 rounded border border-outline-variant/20"
             value={selectedDate}
             onChange={(e) => setSelectedDate(e.target.value)}
           />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar max-h-[600px] relative">
        {loading && (
          <div className="absolute inset-0 z-20 bg-surface-container-lowest/80 backdrop-blur-sm flex items-center justify-center">
            <Loader2 className="animate-spin text-primary" size={24} />
          </div>
        )}
        <table className="w-full text-left">
          <thead className="sticky top-0 bg-surface-container-lowest z-10">
            <tr className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider border-b border-outline-variant/10">
              <th className="px-6 py-3">Student</th>
              <th className="px-6 py-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/10">
            {students.length === 0 && !loading && (
              <tr>
                 <td colSpan={2} className="p-8 text-center text-on-surface-variant text-sm">No students found for this project's batch.</td>
              </tr>
            )}
            {students.map((student, idx) => (
              <tr key={student.id} className="hover:bg-surface-container-low/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded flex items-center justify-center font-mono text-[10px] font-bold ${getThemeClass(idx)}`}>
                      {(student.full_name || '?').substring(0, 1).toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold">{student.full_name}</span>
                      <span className="text-[10px] font-mono text-on-surface-variant">{student.roll_no || 'No Roll'}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <label className="inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="hidden peer" 
                      checked={attendance[student.id] || false}
                      onChange={() => toggleAttendance(student.id)}
                    />
                    <div className="w-5 h-5 border border-outline-variant rounded flex items-center justify-center peer-checked:bg-secondary peer-checked:border-secondary transition-all">
                      <Check className="w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100" strokeWidth={3} />
                    </div>
                  </label>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="p-6 border-t border-outline-variant/20 bg-surface-container-low/30">
        <button 
          onClick={handleSave}
          disabled={loading || saving || students.length === 0}
          className="w-full bg-on-surface text-white py-2 rounded-md text-sm font-medium flex items-center justify-center gap-2 ghost-shadow active:scale-95 transition-transform disabled:opacity-50"
        >
          {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} 
          {saving ? 'Syncing...' : 'Sync to Registry'}
        </button>
      </div>
    </div>
  );
}
