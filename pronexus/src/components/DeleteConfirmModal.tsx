import React from 'react';
import { AlertTriangle, X, Loader2 } from 'lucide-react';

interface DeleteConfirmModalProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  title,
  message,
  onConfirm,
  onCancel,
  loading = false,
}) => {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-inverse-surface/40 backdrop-blur-sm p-4">
      <div className="bg-surface-container-lowest w-full max-w-sm rounded-lg ghost-shadow overflow-hidden">
        <div className="p-5 border-b border-outline-variant/10 flex items-center gap-3 bg-error-container/20">
          <div className="p-2 bg-error-container rounded">
            <AlertTriangle size={18} className="text-error" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-on-surface">{title}</h3>
          </div>
          <button
            onClick={onCancel}
            disabled={loading}
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-surface-container-highest transition-colors"
          >
            <X size={16} />
          </button>
        </div>
        <div className="p-5">
          <p className="text-sm text-on-surface-variant leading-relaxed">{message}</p>
        </div>
        <div className="px-5 pb-5 flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:bg-surface-container-high rounded transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-5 py-2 bg-error text-white text-xs font-bold uppercase tracking-widest rounded ghost-shadow disabled:opacity-70 flex items-center gap-2 hover:bg-error/90 transition-colors"
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};
