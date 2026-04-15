import React, { useState, useEffect } from 'react';
import { AdminSidebar } from '../components/AdminSidebar';
import { AdminHeader } from '../components/AdminHeader';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';
import { supabase } from '../lib/supabase';
import { Loader2, UserSearch, Trash2, Mail, Search } from 'lucide-react';

interface FacultyRow {
  id: string;
  full_name: string | null;
  email: string | null;
}

export const AdminFaculty: React.FC = () => {
  const [faculty, setFaculty] = useState<FacultyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchFaculty = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .eq('role', 'teacher');
    if (error) console.error('Faculty fetch error:', error);
    if (data) setFaculty(data);
    setLoading(false);
  };

  useEffect(() => { fetchFaculty(); }, []);

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
            'Authorization': `Bearer ${session?.access_token}`,
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({ userId: deleteTarget.id }),
        }
      );
      const result = await res.json();
      if (!res.ok || result.error) throw new Error(result.error || 'Delete failed');
      setDeleteTarget(null);
      fetchFaculty();
    } catch (err: any) {
      alert(`Failed to delete faculty: ${err.message}`);
    } finally {
      setDeleting(false);
    }
  };

  const filtered = faculty.filter((f) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      f.full_name?.toLowerCase().includes(q) ||
      f.email?.toLowerCase().includes(q)
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
              <span className="text-on-surface-variant font-mono text-sm tracking-widest uppercase">Loading Faculty...</span>
            </div>
          ) : (
            <>
              {/* Page Header */}
              <div className="flex items-end justify-between mb-8">
                <div>
                  <h2 className="text-[1.5rem] font-headline font-bold tracking-tight text-on-surface mb-1">
                    Faculty Management
                  </h2>
                  <p className="text-on-surface-variant text-sm">
                    View and manage all onboarded faculty members.
                  </p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-tertiary-fixed/30 rounded-md">
                  <UserSearch size={16} className="text-tertiary" />
                  <span className="text-sm font-semibold text-on-surface">{faculty.length}</span>
                  <span className="text-xs text-on-surface-variant">active</span>
                </div>
              </div>

              {/* Search */}
              <div className="mb-6 relative max-w-md">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/50" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-surface-container-high border-none h-10 pl-9 pr-4 rounded-md text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:ring-1 focus:ring-primary focus:outline-none"
                />
              </div>

              {/* Faculty Table */}
              <div className="bg-surface-container-lowest rounded-lg border border-outline-variant/10 overflow-hidden">
                {/* Table Header */}
                <div className="grid grid-cols-[3fr_4fr_1fr] gap-4 px-6 py-3.5 bg-surface-container-low/50 text-[10px] font-mono uppercase tracking-wider text-on-surface-variant font-bold">
                  <div>Name</div>
                  <div>Email</div>
                  <div className="text-right">Action</div>
                </div>

                {/* Table Rows */}
                {filtered.length > 0 ? (
                  <div className="divide-y divide-outline-variant/8">
                    {filtered.map((member) => (
                      <div key={member.id} className="grid grid-cols-[3fr_4fr_1fr] gap-4 px-6 py-4 items-center hover:bg-surface-container-low/30 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-tertiary-fixed flex items-center justify-center text-[12px] font-bold text-tertiary flex-shrink-0">
                            {(member.full_name || '?').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="text-[13px] font-medium text-on-surface">
                              {member.full_name || 'Unknown'}
                            </span>
                            <p className="text-[10px] font-mono text-on-surface-variant mt-0.5">
                              ID: {member.id.substring(0, 8)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-on-surface-variant">
                          <Mail size={12} className="flex-shrink-0 opacity-50" />
                          <span className="truncate">{member.email || '—'}</span>
                        </div>
                        <div className="flex justify-end">
                          <button
                            onClick={() => setDeleteTarget({ id: member.id, name: member.full_name || member.email || 'this user' })}
                            className="p-1.5 text-on-surface-variant opacity-40 hover:opacity-100 hover:text-error hover:bg-error-container/30 rounded transition-all"
                            title="Delete Faculty"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <UserSearch size={32} className="mx-auto text-outline mb-3" />
                    <p className="text-on-surface-variant text-sm">
                      {search ? 'No faculty match your search.' : 'No faculty members found.'}
                    </p>
                    <p className="text-outline text-xs mt-1">Use "Provision User" on the Dashboard to add faculty.</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>

      {deleteTarget && (
        <DeleteConfirmModal
          title="Delete Faculty"
          message={`Are you sure you want to delete "${deleteTarget.name}"? This will permanently remove their account and cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  );
};
