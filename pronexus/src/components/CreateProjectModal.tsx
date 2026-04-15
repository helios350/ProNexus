import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthContext } from '../contexts/AuthContext';

interface CreateProjectModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ onClose, onSuccess }) => {
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [batches, setBatches] = useState<any[]>([]);
  
  const [title, setTitle] = useState('');
  const [batchId, setBatchId] = useState('');

  useEffect(() => {
    supabase.from('batches').select('id, name').order('created_at', { ascending: false }).then(({ data }) => {
      if (data) setBatches(data);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const { error: insertError } = await supabase
        .from('projects')
        .insert({ title, batch_id: batchId, created_by: user.id });

      if (insertError) throw insertError;
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-inverse-surface/40 backdrop-blur-sm p-4">
      <div className="bg-surface-container-lowest w-full max-w-md rounded-lg ghost-shadow overflow-hidden flex flex-col pt-0">
        <div className="p-6 border-b border-outline-variant/10 flex justify-between items-center bg-surface-container-low">
          <div>
            <h2 className="text-xl font-headline font-bold text-on-surface">Create Project</h2>
            <p className="text-xs text-on-surface-variant">Initialize a new project and assign a batch</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container-highest transition-colors">
            <X size={18} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-error-container text-on-error-container rounded text-sm">
              {error}
            </div>
          )}
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">Project Title</label>
            <input 
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-surface-container-high border-none h-10 px-3 rounded focus:ring-1 focus:ring-primary text-sm text-on-surface"
              placeholder="e.g. Major Project 2024"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">Assign Batch</label>
            <select 
              required
              value={batchId}
              onChange={(e) => setBatchId(e.target.value)}
              className="w-full bg-surface-container-high border-none h-10 px-3 rounded focus:ring-1 focus:ring-primary text-sm text-on-surface"
            >
              <option value="">-- Select a batch --</option>
              {batches.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
          
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:bg-surface-container-high rounded transition-colors">
              Cancel
            </button>
            <button disabled={loading} type="submit" className="px-6 py-2 primary-gradient text-white text-xs font-bold uppercase tracking-widest rounded ghost-shadow disabled:opacity-70 flex items-center gap-2">
              {loading && <Loader2 size={14} className="animate-spin" />}
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
