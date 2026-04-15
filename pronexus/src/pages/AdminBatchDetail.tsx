import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AdminSidebar } from '../components/AdminSidebar';
import { AdminHeader } from '../components/AdminHeader';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';
import { CsvUploadModal } from '../components/CsvUploadModal';
import { supabase } from '../lib/supabase';
import {
  ArrowLeft, Loader2, Users, UserCheck, UserPlus, UserMinus,
  Calendar, ChevronDown, Search, Upload
} from 'lucide-react';

interface BatchData {
  id: string;
  name: string;
  created_at: string;
  teacher_id: string | null;
}

interface StudentRow {
  id: string;
  full_name: string | null;
  email: string | null;
  roll_no: string | null;
  contact: string | null;
}

interface TeacherRow {
  id: string;
  full_name: string | null;
  email: string | null;
}

export default function AdminBatchDetail() {
  const { batchId } = useParams<{ batchId: string }>();
  const navigate = useNavigate();

  const [batch, setBatch] = useState<BatchData | null>(null);
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [teachers, setTeachers] = useState<TeacherRow[]>([]);
  const [unassignedStudents, setUnassignedStudents] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [showTeacherDropdown, setShowTeacherDropdown] = useState(false);
  const [addSearch, setAddSearch] = useState('');
  const [removeTarget, setRemoveTarget] = useState<{ id: string; name: string } | null>(null);
  const [removing, setRemoving] = useState(false);
  const [showCsvUpload, setShowCsvUpload] = useState(false);

  const loadData = useCallback(async () => {
    if (!batchId) return;
    setLoading(true);

    const [batchRes, profilesRes, teachersRes] = await Promise.all([
      supabase.from('batches').select('*').eq('id', batchId).single(),
      supabase.from('profiles').select('id, full_name, email, roll_no, contact, batch_id, role'),
      supabase.from('profiles').select('id, full_name, email').eq('role', 'teacher'),
    ]);

    if (batchRes.data) setBatch(batchRes.data);
    if (teachersRes.data) setTeachers(teachersRes.data);

    if (profilesRes.data) {
      const allProfiles = profilesRes.data;
      setStudents(
        allProfiles
          .filter((p: any) => p.role === 'student' && p.batch_id === batchId)
          .map((p: any) => ({ id: p.id, full_name: p.full_name, email: p.email, roll_no: p.roll_no, contact: p.contact }))
      );
      setUnassignedStudents(
        allProfiles
          .filter((p: any) => p.role === 'student' && !p.batch_id)
          .map((p: any) => ({ id: p.id, full_name: p.full_name, email: p.email, roll_no: p.roll_no, contact: p.contact }))
      );
    }

    setLoading(false);
  }, [batchId]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleAssignTeacher = async (teacherId: string | null) => {
    if (!batchId) return;
    await supabase.from('batches').update({ teacher_id: teacherId }).eq('id', batchId);
    setBatch(prev => prev ? { ...prev, teacher_id: teacherId } : prev);
    setShowTeacherDropdown(false);
  };

  const handleAddStudent = async (studentId: string) => {
    await supabase.from('profiles').update({ batch_id: batchId }).eq('id', studentId);
    loadData();
  };

  const handleRemoveStudent = async () => {
    if (!removeTarget) return;
    setRemoving(true);
    try {
      await supabase.from('profiles').update({ batch_id: null }).eq('id', removeTarget.id);
      setRemoveTarget(null);
      loadData();
    } catch (err: any) {
      alert(`Failed to remove student: ${err.message}`);
    } finally {
      setRemoving(false);
    }
  };

  const assignedTeacher = teachers.find(t => t.id === batch?.teacher_id);

  const filteredUnassigned = unassignedStudents.filter(s => {
    const q = addSearch.toLowerCase();
    return (
      (s.full_name || '').toLowerCase().includes(q) ||
      (s.roll_no || '').toLowerCase().includes(q) ||
      (s.email || '').toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <div className="bg-surface font-body text-on-surface antialiased min-h-screen">
        <AdminSidebar />
        <main className="pl-56 min-h-screen">
          <AdminHeader />
          <div className="pt-20 px-10 flex justify-center items-center">
            <Loader2 className="animate-spin text-primary mt-20" size={32} />
          </div>
        </main>
      </div>
    );
  }

  if (!batch) {
    return (
      <div className="bg-surface font-body text-on-surface antialiased min-h-screen">
        <AdminSidebar />
        <main className="pl-56 min-h-screen">
          <AdminHeader />
          <div className="pt-20 px-10 text-center">
            <p className="text-on-surface-variant mt-20">Batch not found.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="bg-surface font-body text-on-surface antialiased min-h-screen">
      <AdminSidebar />
      <main className="pl-56 min-h-screen">
        <AdminHeader />

        <div className="pt-20 px-10 pb-12 max-w-6xl mx-auto">
          {/* Header */}
          <header className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={() => navigate('/admin/batches')}
                className="w-8 h-8 flex items-center justify-center rounded-md bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest transition-colors"
              >
                <ArrowLeft size={16} />
              </button>
              <div>
                <h1 className="text-[1.5rem] font-headline font-bold text-on-surface tracking-tight">
                  {batch.name}
                </h1>
                <div className="flex items-center gap-4 mt-1 text-[11px] text-on-surface-variant">
                  <span className="font-mono">ID: {batch.id.substring(0, 8)}</span>
                  <span className="flex items-center gap-1">
                    <Calendar size={12} />
                    Created {new Date(batch.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </div>
            </div>
          </header>

          {/* Stats strip */}
          <div className="grid grid-cols-2 gap-5 mb-8">
            <div className="bg-surface-container-lowest p-5 rounded-lg border border-outline-variant/10 flex items-center gap-4">
              <div className="p-2.5 rounded-md bg-secondary-fixed">
                <Users size={18} className="text-on-secondary-fixed-variant" />
              </div>
              <div>
                <p className="text-[10px] font-mono uppercase tracking-wider text-on-surface-variant">Students Enrolled</p>
                <p className="text-xl font-bold text-on-surface tracking-tighter">{students.length}</p>
              </div>
            </div>

            {/* Teacher Assignment Card */}
            <div className="bg-surface-container-lowest p-5 rounded-lg border border-outline-variant/10 relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 rounded-md bg-tertiary-fixed">
                    <UserCheck size={18} className="text-tertiary" />
                  </div>
                  <div>
                    <p className="text-[10px] font-mono uppercase tracking-wider text-on-surface-variant">Assigned Teacher</p>
                    <p className="text-sm font-semibold text-on-surface">
                      {assignedTeacher ? (assignedTeacher.full_name || assignedTeacher.email) : 'No teacher assigned'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowTeacherDropdown(!showTeacherDropdown)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary bg-primary-fixed/20 hover:bg-primary-fixed/30 rounded-md transition-colors"
                >
                  Change
                  <ChevronDown size={14} className={`transition-transform ${showTeacherDropdown ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {/* Teacher Dropdown */}
              {showTeacherDropdown && (
                <div className="absolute right-5 top-full mt-1 w-64 bg-surface-container-lowest border border-outline-variant/20 rounded-lg ghost-shadow z-30 py-2">
                  <button
                    onClick={() => handleAssignTeacher(null)}
                    className="w-full text-left px-4 py-2.5 text-xs text-on-surface-variant hover:bg-surface-container-low transition-colors"
                  >
                    — Unassign Teacher —
                  </button>
                  {teachers.map(t => (
                    <button
                      key={t.id}
                      onClick={() => handleAssignTeacher(t.id)}
                      className={`w-full text-left px-4 py-2.5 text-xs hover:bg-surface-container-low transition-colors flex items-center justify-between ${
                        t.id === batch.teacher_id ? 'text-primary font-semibold bg-primary/5' : 'text-on-surface'
                      }`}
                    >
                      <span>{t.full_name || t.email}</span>
                      {t.id === batch.teacher_id && (
                        <span className="text-[9px] font-mono text-primary bg-primary-fixed/30 px-1.5 py-0.5 rounded">CURRENT</span>
                      )}
                    </button>
                  ))}
                  {teachers.length === 0 && (
                    <p className="px-4 py-3 text-xs text-on-surface-variant">No teachers in the system.</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Student List Section */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-on-surface-variant font-bold">
                Students in this Batch
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowCsvUpload(true)}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-primary bg-primary-fixed/20 hover:bg-primary-fixed/30 rounded-md transition-colors"
                >
                  <Upload size={14} />
                  Upload CSV
                </button>
                <button
                  onClick={() => setShowAddPanel(!showAddPanel)}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-primary bg-primary-fixed/20 hover:bg-primary-fixed/30 rounded-md transition-colors"
                >
                  <UserPlus size={14} />
                  Add Student
                </button>
              </div>
            </div>

            {/* Add Student Panel */}
            {showAddPanel && (
              <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] font-mono uppercase tracking-wider text-on-surface-variant font-bold">
                    Unassigned Students ({unassignedStudents.length})
                  </p>
                  <div className="relative w-48">
                    <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                    <input
                      value={addSearch}
                      onChange={(e) => setAddSearch(e.target.value)}
                      placeholder="Search..."
                      className="bg-surface-container-highest border-none h-7 pl-7 pr-3 rounded text-[11px] w-full text-on-surface placeholder:text-outline"
                    />
                  </div>
                </div>
                <div className="max-h-48 overflow-y-auto space-y-0.5">
                  {filteredUnassigned.map(student => (
                    <div key={student.id} className="flex items-center justify-between p-2.5 hover:bg-surface-container-low rounded-md transition-colors">
                      <div>
                        <p className="text-[13px] text-on-surface font-medium">{student.full_name || student.email}</p>
                        <p className="text-[10px] font-mono text-on-surface-variant">{student.roll_no || student.email}</p>
                      </div>
                      <button
                        onClick={() => handleAddStudent(student.id)}
                        className="text-[10px] font-bold text-primary hover:text-on-primary hover:bg-primary px-2.5 py-1 rounded transition-colors"
                      >
                        + Add
                      </button>
                    </div>
                  ))}
                  {filteredUnassigned.length === 0 && (
                    <p className="text-xs text-on-surface-variant py-4 text-center">No unassigned students found.</p>
                  )}
                </div>
              </div>
            )}

            {/* Student Table */}
            <div className="bg-surface-container-lowest rounded-lg border border-outline-variant/10 overflow-hidden">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 px-5 py-3 bg-surface-container-low/50 text-[10px] font-mono uppercase tracking-wider text-on-surface-variant font-bold">
                <div className="col-span-4">Name</div>
                <div className="col-span-2">Roll No</div>
                <div className="col-span-3">Email</div>
                <div className="col-span-2">Contact</div>
                <div className="col-span-1 text-right">Action</div>
              </div>

              {/* Table Rows */}
              {students.length > 0 ? (
                <div className="divide-y divide-outline-variant/8">
                  {students.map((student) => (
                    <div key={student.id} className="grid grid-cols-12 gap-4 px-5 py-3.5 items-center hover:bg-surface-container-low/30 transition-colors group">
                      <div className="col-span-4 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-secondary-fixed flex items-center justify-center text-[11px] font-bold text-on-secondary-fixed-variant flex-shrink-0">
                          {(student.full_name || '?').charAt(0).toUpperCase()}
                        </div>
                        <span className="text-[13px] font-medium text-on-surface truncate">
                          {student.full_name || 'Unknown'}
                        </span>
                      </div>
                      <div className="col-span-2 text-[11px] font-mono text-on-surface-variant">
                        {student.roll_no || '—'}
                      </div>
                      <div className="col-span-3 text-[11px] text-on-surface-variant truncate">
                        {student.email || '—'}
                      </div>
                      <div className="col-span-2 text-[11px] font-mono text-on-surface-variant">
                        {student.contact || '—'}
                      </div>
                      <div className="col-span-1 flex justify-end">
                        <button
                          onClick={() => setRemoveTarget({ id: student.id, name: student.full_name || student.email || 'this student' })}
                          className="p-1.5 text-on-surface-variant opacity-40 hover:opacity-100 hover:text-error hover:bg-error-container/30 rounded transition-all"
                          title="Remove from batch"
                        >
                          <UserMinus size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users size={28} className="mx-auto text-outline mb-2" />
                  <p className="text-sm text-on-surface-variant">No students in this batch yet.</p>
                  <p className="text-xs text-outline mt-1">Click "Add Student" above to assign students.</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      {removeTarget && (
        <DeleteConfirmModal
          title="Remove Student"
          message={`Remove "${removeTarget.name}" from this batch? They will become unassigned but their account will not be deleted.`}
          onConfirm={handleRemoveStudent}
          onCancel={() => setRemoveTarget(null)}
          loading={removing}
        />
      )}

      {showCsvUpload && (
        <CsvUploadModal
          batchId={batchId!}
          batchName={batch.name}
          onClose={() => setShowCsvUpload(false)}
          onSuccess={loadData}
        />
      )}
    </div>
  );
}
