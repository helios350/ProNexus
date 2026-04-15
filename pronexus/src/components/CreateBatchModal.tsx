import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface CreateBatchModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateBatchModal: React.FC<CreateBatchModalProps> = ({ onClose, onSuccess }) => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { error: insertError } = await supabase
        .from('batches')
        .insert({ name });

      if (insertError) throw insertError;
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create batch');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-inverse-surface/40 backdrop-blur-sm">
      <div className="bg-surface-container-lowest w-full max-w-md rounded-lg ghost-shadow overflow-hidden flex flex-col">
        <div className="p-6 border-b border-outline-variant/10 flex justify-between items-center bg-surface-container-low">
          <div>
            <h2 className="text-xl font-headline font-bold text-on-surface">Create New Batch</h2>
            <p className="text-xs text-on-surface-variant">Initialize a new academic group</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container-highest transition-colors">
            <X size={18} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-error-container text-on-error-container rounded text-sm mb-4">
              {error}
            </div>
          )}
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">Batch Name</label>
            <input 
              type="text" 
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-surface-container-high border-none h-10 px-3 rounded focus:ring-1 focus:ring-primary transition-all text-sm text-on-surface"
              placeholder="e.g. CSE-AIML 2024"
            />
          </div>
          
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:bg-surface-container-high rounded transition-colors">
              Cancel
            </button>
            <button disabled={loading} type="submit" className="px-6 py-2 primary-gradient text-white text-xs font-bold uppercase tracking-widest rounded ghost-shadow disabled:opacity-70 flex items-center gap-2">
              {loading && <Loader2 size={14} className="animate-spin" />}
              Create Batch
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
