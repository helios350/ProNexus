import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface CreateUserModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateUserModal: React.FC<CreateUserModalProps> = ({ onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [batches, setBatches] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'student',
    firstName: '',
    lastName: '',
    batchId: '',
    rollNo: '',
    contact: ''
  });

  useEffect(() => {
    async function loadBatches() {
      const { data } = await supabase.from('batches').select('id, name').order('created_at', { ascending: false });
      if (data) setBatches(data);
    }
    loadBatches();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-sub-user`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`,
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify(formData),
        }
      );
      const result = await res.json();
      if (!res.ok || result.error) {
        throw new Error(result.error || `Server returned ${res.status}`);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-inverse-surface/40 backdrop-blur-sm p-4">
      <div className="bg-surface-container-lowest w-full max-w-lg rounded-lg ghost-shadow overflow-hidden flex flex-col">
        <div className="p-6 border-b border-outline-variant/10 flex justify-between items-center bg-surface-container-low">
          <div>
            <h2 className="text-xl font-headline font-bold text-on-surface">Create Global User</h2>
            <p className="text-xs text-on-surface-variant">Provision a new student or teacher</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container-highest transition-colors">
            <X size={18} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-error-container text-on-error-container rounded text-sm mb-4">
              {error}
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">First Name</label>
              <input required name="firstName" value={formData.firstName} onChange={handleChange} className="w-full bg-surface-container-high border-none h-10 px-3 rounded focus:ring-1 focus:ring-primary text-sm text-on-surface" />
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">Last Name</label>
              <input required name="lastName" value={formData.lastName} onChange={handleChange} className="w-full bg-surface-container-high border-none h-10 px-3 rounded focus:ring-1 focus:ring-primary text-sm text-on-surface" />
            </div>
          </div>

          <div>
             <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">Email Address</label>
             <input type="email" required name="email" value={formData.email} onChange={handleChange} className="w-full bg-surface-container-high border-none h-10 px-3 rounded focus:ring-1 focus:ring-primary text-sm text-on-surface" />
          </div>

          <div>
             <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">Temporary Password</label>
             <input type="password" required minLength={6} name="password" value={formData.password} onChange={handleChange} className="w-full bg-surface-container-high border-none h-10 px-3 rounded focus:ring-1 focus:ring-primary text-sm text-on-surface" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">Role</label>
              <select name="role" value={formData.role} onChange={handleChange} className="w-full bg-surface-container-high border-none h-10 px-3 rounded focus:ring-1 focus:ring-primary text-sm text-on-surface cursor-pointer">
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">Assign Batch (Optional)</label>
              <select name="batchId" value={formData.batchId} onChange={handleChange} className="w-full bg-surface-container-high border-none h-10 px-3 rounded focus:ring-1 focus:ring-primary text-sm text-on-surface cursor-pointer">
                <option value="">-- None --</option>
                {batches.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          </div>

          {formData.role === 'student' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">Roll Number</label>
                <input required name="rollNo" value={formData.rollNo} onChange={handleChange} className="w-full bg-surface-container-high border-none h-10 px-3 rounded focus:ring-1 focus:ring-primary text-sm text-on-surface" />
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">Contact</label>
                <input required name="contact" value={formData.contact} onChange={handleChange} className="w-full bg-surface-container-high border-none h-10 px-3 rounded focus:ring-1 focus:ring-primary text-sm text-on-surface" />
              </div>
            </div>
          )}
          
          <div className="pt-4 flex justify-end gap-3 border-t border-outline-variant/10 mt-6 !mt-8">
            <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:bg-surface-container-high rounded transition-colors">
              Cancel
            </button>
            <button disabled={loading} type="submit" className="px-6 py-2 primary-gradient text-white text-xs font-bold uppercase tracking-widest rounded ghost-shadow disabled:opacity-70 flex items-center gap-2">
              {loading && <Loader2 size={14} className="animate-spin" />}
              Provision User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
