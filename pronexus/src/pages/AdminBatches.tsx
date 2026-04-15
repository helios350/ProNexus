import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminSidebar } from '../components/AdminSidebar';
import { AdminHeader } from '../components/AdminHeader';
import { CreateBatchModal } from '../components/CreateBatchModal';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';
import { Loader2, Plus, Layers, Users, UserCheck, Trash2, Search } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface BatchRow {
  id: string;
  name: string;
  created_at: string;
  teacher_id: string | null;
}

interface ProfileRow {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string;
  batch_id: string | null;
  roll_no: string | null;
}

export const AdminBatches: React.FC = () => {
  const navigate = useNavigate();
  const [batches, setBatches] = useState<BatchRow[]>([]);
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [isBatchModalOpen, setBatchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const [bRes, pRes] = await Promise.all([
      supabase.from('batches').select('*').order('created_at', { ascending: false }),
      supabase.from('profiles').select('id, full_name, email, role, batch_id, roll_no'),
    ]);
    if (bRes.data) setBatches(bRes.data);
    if (pRes.data) setProfiles(pRes.data);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleDeleteBatch = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      // Unassign all students from this batch
      const { error: unassignErr } = await supabase
        .from('profiles')
        .update({ batch_id: null })
        .eq('batch_id', deleteTarget.id);
      if (unassignErr) throw new Error(`Failed to unassign students: ${unassignErr.message}`);

      // Clear teacher assignment
      const { error: teacherErr } = await supabase
        .from('batches')
        .update({ teacher_id: null })
        .eq('id', deleteTarget.id);
      if (teacherErr) throw new Error(`Failed to unassign teacher: ${teacherErr.message}`);

      // Delete the batch (projects CASCADE)
      const { error: deleteErr } = await supabase
        .from('batches')
        .delete()
        .eq('id', deleteTarget.id);
      if (deleteErr) throw new Error(`Failed to delete batch: ${deleteErr.message}`);

      setDeleteTarget(null);
      fetchData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const teachers = profiles.filter(p => p.role === 'teacher');
  const students = profiles.filter(p => p.role === 'student');

  const filteredBatches = batches.filter(b =>
    b.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-surface font-body text-on-surface antialiased min-h-screen">
      <AdminSidebar />
      <main className="pl-56 min-h-screen">
        <AdminHeader />

        <div className="pt-20 px-10 pb-12 max-w-7xl mx-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-20 gap-4">
              <Loader2 className="animate-spin text-primary" size={32} />
              <span className="text-on-surface-variant font-mono text-sm tracking-widest uppercase">Loading Batches...</span>
            </div>
          ) : (
            <>
              {/* Page Header */}
              <div className="flex items-end justify-between mb-8">
                <div>
                  <h2 className="text-[1.5rem] font-headline font-bold tracking-tight text-on-surface mb-1">
                    Batch Management
                  </h2>
                  <p className="text-on-surface-variant text-sm">
                    Manage cohorts, assign teachers, and organize student enrollment.
                  </p>
                </div>
                <button
                  onClick={() => setBatchModalOpen(true)}
                  className="primary-gradient text-white px-5 py-2.5 rounded-md text-sm font-medium flex items-center gap-2 ghost-shadow active:scale-95 transition-transform"
                >
                  <Plus size={16} />
                  Initialize Batch
                </button>
              </div>


              {/* Search */}
              <div className="relative mb-6 max-w-md">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/50" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search batches..."
                  className="bg-surface-container-high border-none h-10 pl-9 pr-4 rounded-md text-sm w-full focus:ring-1 focus:ring-primary focus:outline-none text-on-surface placeholder:text-on-surface-variant/50"
                />
              </div>

              {/* Batch List */}
              <div className="space-y-2">
                {filteredBatches.map((batch) => {
                  const studentsInBatch = students.filter(s => s.batch_id === batch.id).length;
                  const assignedTeacher = teachers.find(t => t.id === batch.teacher_id);

                  return (
                    <div
                      key={batch.id}
                      className="bg-surface-container-lowest rounded-lg border border-outline-variant/10 hover:border-outline-variant/25 transition-all group"
                    >
                      <div className="p-5 flex items-center justify-between">
                        <div
                          className="flex items-center gap-5 flex-1 cursor-pointer"
                          onClick={() => navigate(`/admin/batches/${batch.id}`)}
                        >
                          <div className="w-11 h-11 rounded-md bg-surface-container-high flex items-center justify-center font-bold text-on-surface-variant tracking-tighter text-sm">
                            {batch.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-on-surface text-sm">{batch.name}</h4>
                            <div className="flex items-center gap-4 mt-1 text-[11px] text-on-surface-variant">
                              <span className="font-mono">ID: {batch.id.substring(0, 8)}</span>
                              <span className="flex items-center gap-1">
                                <Users size={12} />
                                {studentsInBatch} Students
                              </span>
                              {assignedTeacher && (
                                <span className="flex items-center gap-1">
                                  <UserCheck size={12} />
                                  {assignedTeacher.full_name || assignedTeacher.email}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="px-2 py-1 bg-secondary-fixed text-on-secondary-fixed-variant text-[9px] font-bold uppercase tracking-wider rounded">
                            Active
                          </span>
                          <button
                            onClick={(e) => { e.stopPropagation(); setDeleteTarget({ id: batch.id, name: batch.name }); }}
                            className="p-2 text-on-surface-variant opacity-40 hover:opacity-100 hover:text-error hover:bg-error-container/30 rounded transition-all"
                            title="Delete Batch"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {filteredBatches.length === 0 && (
                  <div className="text-center py-16">
                    <Layers size={32} className="mx-auto text-outline mb-3" />
                    <p className="text-on-surface-variant text-sm">No batches found.</p>
                    <p className="text-outline text-xs mt-1">Create one with "Initialize Batch" above.</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>

      {isBatchModalOpen && (
        <CreateBatchModal
          onClose={() => setBatchModalOpen(false)}
          onSuccess={() => fetchData()}
        />
      )}

      {deleteTarget && (
        <DeleteConfirmModal
          title="Delete Batch"
          message={`Are you sure you want to delete "${deleteTarget.name}"? All students will be unassigned and associated projects will be deleted.`}
          onConfirm={handleDeleteBatch}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  );
};
