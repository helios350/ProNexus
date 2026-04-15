import React, { useState, useEffect } from 'react';
import { AdminSidebar } from '../components/AdminSidebar';
import { AdminHeader } from '../components/AdminHeader';
import { DashboardStats } from '../components/DashboardStats';
import { Loader2 } from 'lucide-react';
import { CreateUserModal } from '../components/CreateUserModal';
import { supabase } from '../lib/supabase';

export const AdminDashboard: React.FC = () => {
  const [isUserModalOpen, setUserModalOpen] = useState(false);
  const [batches, setBatches] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    const [batchesRes, profilesRes] = await Promise.all([
      supabase.from('batches').select('*').order('created_at', { ascending: false }),
      supabase.from('profiles').select('*')
    ]);
    
    if (batchesRes.data) setBatches(batchesRes.data);
    if (profilesRes.data) setProfiles(profilesRes.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const studentsCount = profiles.filter(p => p.role === 'student').length;
  const batchesCount = batches.length;
  const mentorsCount = profiles.filter(p => p.role === 'teacher').length;

  return (
    <div className="bg-surface font-body text-on-surface antialiased min-h-screen">
      <AdminSidebar />
      <main className="pl-56 min-h-screen">
        <AdminHeader />
        
        {/* Canvas Content */}
        <div className="pt-20 px-10 pb-12 max-w-7xl mx-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-20 gap-4">
               <Loader2 className="animate-spin text-primary" size={32} />
               <span className="text-on-surface-variant font-mono text-sm tracking-widest uppercase">Loading Analytics...</span>
            </div>
          ) : (
            <DashboardStats 
              stats={{ batchesCount, studentsCount, mentorsCount }}
              onCreateUser={() => setUserModalOpen(true)}
            />
          )}
        </div>
      </main>

      {isUserModalOpen && (
        <CreateUserModal 
          onClose={() => setUserModalOpen(false)} 
          onSuccess={() => { fetchData(); }}
        />
      )}
    </div>
  );
};
