import React, { useState, useEffect } from 'react';
import { AdminSidebar } from '../components/AdminSidebar';
import { AdminHeader } from '../components/AdminHeader';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';
import { supabase } from '../lib/supabase';
import {
  Loader2, GraduationCap, Trash2, Mail, Search,
  Eye, EyeOff, KeyRound, CheckCircle2
} from 'lucide-react';

interface StudentRow {
  id: string;
  full_name: string | null;
  email: string | null;
  contact: string | null;
  roll_no: string | null;
  batch_id: string | null;
  temp_password: string | null;
}

interface BatchMap {
  [key: string]: string;
}

export const AdminStudents: React.FC = () => {
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [batchMap, setBatchMap] = useState<BatchMap>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());
  const [resettingId, setResettingId] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState<{ id: string; password: string } | null>(null);

  const fetchStudents = async () => {
    setLoading(true);
    const [studentsRes, batchesRes] = await Promise.all([
      supabase
        .from('profiles')
        .select('id, full_name, email, contact, roll_no, batch_id, temp_password')
        .eq('role', 'student'),
      supabase.from('batches').select('id, name'),
    ]);
    if (studentsRes.data) setStudents(studentsRes.data);
    if (batchesRes.data) {
      const map: BatchMap = {};
      batchesRes.data.forEach((b) => (map[b.id] = b.name));
      setBatchMap(map);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-user`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.access_token}`,
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({ userId: deleteTarget.id }),
        }
      );
      const result = await res.json();
      if (!res.ok || result.error) throw new Error(result.error || 'Delete failed');
      setDeleteTarget(null);
      fetchStudents();
    } catch (err: any) {
      alert(`Failed to delete student: ${err.message}`);
    } finally {
      setDeleting(false);
    }
  };

  const handleResetPassword = async (studentId: string) => {
    setResettingId(studentId);
    setResetSuccess(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-user-password`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.access_token}`,
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({ action: 'admin-reset', userId: studentId }),
        }
      );
      const result = await res.json();
      if (!res.ok || result.error) throw new Error(result.error || 'Reset failed');

      // Update local state
      setStudents(prev =>
        prev.map(s => s.id === studentId ? { ...s, temp_password: result.newPassword } : s)
      );
      setResetSuccess({ id: studentId, password: result.newPassword });
      // Make password visible
      setVisiblePasswords(prev => new Set(prev).add(studentId));

      // Clear success indicator after 5 seconds
      setTimeout(() => setResetSuccess(null), 5000);
    } catch (err: any) {
      alert(`Failed to reset password: ${err.message}`);
    } finally {
      setResettingId(null);
    }
  };

  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filtered = students.filter((s) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      s.full_name?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q) ||
      s.roll_no?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="bg-surface font-body text-on-surface antialiased min-h-screen">
      <AdminSidebar />
      <main className="pl-56 min-h-screen">
        <AdminHeader />

        <div className="pt-20 px-10 pb-12 max-w-6xl mx-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-20 gap-4">
              <Loader2 className="animate-spin text-primary" size={32} />
              <span className="text-on-surface-variant font-mono text-sm tracking-widest uppercase">Loading Students...</span>
            </div>
          ) : (
            <>
              {/* Page Header */}
              <div className="flex items-end justify-between mb-8">
                <div>
                  <h2 className="text-[1.5rem] font-headline font-bold tracking-tight text-on-surface mb-1">
                    Student Management
                  </h2>
                  <p className="text-on-surface-variant text-sm">
                    View and manage all enrolled students across batches.
                  </p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-secondary-fixed/30 rounded-md">
                  <GraduationCap size={16} className="text-secondary" />
                  <span className="text-sm font-semibold text-on-surface">{students.length}</span>
                  <span className="text-xs text-on-surface-variant">enrolled</span>
                </div>
              </div>

              {/* Search */}
              <div className="mb-6 relative max-w-md">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/50" />
                <input
                  type="text"
                  placeholder="Search by name, email, or roll number..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-surface-container-high border-none h-10 pl-9 pr-4 rounded-md text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:ring-1 focus:ring-primary focus:outline-none"
                />
              </div>

              {/* Students Table */}
              <div className="bg-surface-container-lowest rounded-lg border border-outline-variant/10 overflow-hidden">
                {/* Table Header */}
                <div className="grid grid-cols-[2.2fr_2.2fr_1.2fr_1.2fr_1.8fr_1fr] gap-3 px-6 py-3.5 bg-surface-container-low/50 text-[10px] font-mono uppercase tracking-wider text-on-surface-variant font-bold">
                  <div>Name</div>
                  <div>Email</div>
                  <div>Roll No</div>
                  <div>Batch</div>
                  <div>Password</div>
                  <div className="text-right">Actions</div>
                </div>

                {/* Table Rows */}
                {filtered.length > 0 ? (
                  <div className="divide-y divide-outline-variant/8">
                    {filtered.map((student) => {
                      const colors = ['bg-primary-container text-on-primary-container', 'bg-secondary-container text-on-secondary-container', 'bg-tertiary-container text-on-tertiary-container', 'bg-error-container text-on-error-container'];
                      const colorIdx = student.full_name ? student.full_name.charCodeAt(0) % colors.length : 0;
                      const isPasswordVisible = visiblePasswords.has(student.id);
                      const isResetting = resettingId === student.id;
                      const justReset = resetSuccess?.id === student.id;

                      return (
                        <div key={student.id} className="grid grid-cols-[2.2fr_2.2fr_1.2fr_1.2fr_1.8fr_1fr] gap-3 px-6 py-3.5 items-center hover:bg-surface-container-low/30 transition-colors">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 ${colors[colorIdx]}`}>
                              {(student.full_name || '?').charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <span className="text-[13px] font-medium text-on-surface block truncate">
                                {student.full_name || 'Unknown'}
                              </span>
                              <p className="text-[10px] font-mono text-on-surface-variant mt-0.5">
                                {student.contact || 'No contact'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-on-surface-variant min-w-0">
                            <Mail size={12} className="flex-shrink-0 opacity-50" />
                            <span className="truncate">{student.email || '—'}</span>
                          </div>
                          <div className="text-[11px] font-mono text-on-surface-variant">
                            {student.roll_no || '—'}
                          </div>
                          <div>
                            {student.batch_id && batchMap[student.batch_id] ? (
                              <span className="px-2 py-1 bg-primary-fixed/30 text-primary text-[9px] font-bold uppercase tracking-wider rounded inline-block">
                                {batchMap[student.batch_id]}
                              </span>
                            ) : (
                              <span className="text-[10px] text-on-surface-variant italic">Unassigned</span>
                            )}
                          </div>
                          {/* Password Column */}
                          <div className="flex items-center gap-1.5">
                            {student.temp_password ? (
                              <>
                                <span className="font-mono text-[11px] text-on-surface min-w-0 truncate">
                                  {isPasswordVisible ? student.temp_password : '••••••••'}
                                </span>
                                <button
                                  onClick={() => togglePasswordVisibility(student.id)}
                                  className="p-1 text-on-surface-variant/50 hover:text-on-surface rounded transition-colors flex-shrink-0"
                                  title={isPasswordVisible ? 'Hide password' : 'Show password'}
                                >
                                  {isPasswordVisible ? <EyeOff size={12} /> : <Eye size={12} />}
                                </button>
                              </>
                            ) : (
                              <span className="text-[10px] text-on-surface-variant">—</span>
                            )}
                            {justReset && (
                              <CheckCircle2 size={12} className="text-primary flex-shrink-0 animate-pulse" />
                            )}
                          </div>
                          {/* Actions Column */}
                          <div className="flex justify-end gap-1">
                            <button
                              onClick={() => handleResetPassword(student.id)}
                              disabled={isResetting}
                              className="p-1.5 text-on-surface-variant opacity-40 hover:opacity-100 hover:text-primary hover:bg-primary-fixed/20 rounded transition-all disabled:opacity-20"
                              title="Reset Password"
                            >
                              {isResetting ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                <KeyRound size={14} />
                              )}
                            </button>
                            <button
                              onClick={() => setDeleteTarget({ id: student.id, name: student.full_name || student.email || 'this user' })}
                              className="p-1.5 text-on-surface-variant opacity-40 hover:opacity-100 hover:text-error hover:bg-error-container/30 rounded transition-all"
                              title="Delete Student"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <GraduationCap size={32} className="mx-auto text-outline mb-3" />
                    <p className="text-on-surface-variant text-sm">
                      {search ? 'No students match your search.' : 'No students found.'}
                    </p>
                    <p className="text-outline text-xs mt-1">Use "Provision User" on the Dashboard to add students.</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>

      {deleteTarget && (
        <DeleteConfirmModal
          title="Delete Student"
          message={`Are you sure you want to delete "${deleteTarget.name}"? This will permanently remove their account and cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  );
};
