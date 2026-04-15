import { UploadCloud } from 'lucide-react';

export function SubmissionPortal() {
  return (
    <section className="bg-surface-container-lowest border border-outline-variant/30 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center group hover:bg-surface-container transition-colors cursor-pointer h-full">
      <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
        <UploadCloud className="text-on-surface-variant group-hover:text-primary transition-colors" size={24} />
      </div>
      <h3 className="font-bold text-on-surface mb-1">Upload Submission</h3>
      <p className="text-xs text-on-surface-variant max-w-[200px] mb-6">
        Drag and drop your project PDF or click to browse files.
      </p>

      {/* Progress Bar (Visual only for now) */}
      <div className="w-full h-1 bg-surface-container rounded-full overflow-hidden mb-4">
        <div className="w-0 h-full bg-primary transition-all duration-500"></div>
      </div>
      
      <button className="text-xs font-mono font-bold text-primary hover:underline uppercase tracking-widest">
        Select File
      </button>
    </section>
  );
}
