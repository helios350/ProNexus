import React, { useState } from 'react';
import { loginData } from '../data/mockData';
import { X, ExternalLink } from 'lucide-react';

export interface ReadonlyHeaderProps {}

export const Header: React.FC<ReadonlyHeaderProps> = () => {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const dummyData: Record<string, { title: string, content: React.ReactNode }> = {
    'Platform': {
      title: 'About ProNexus Platform',
      content: (
        <div className="space-y-3">
          <p>ProNexus is a state-of-the-art academic management system designed to streamline institutional workflows.</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Centralized Batch & Course Management</li>
            <li>Real-time Progress & Attendance Tracking</li>
            <li>Automated Reports & Secure Architecture</li>
          </ul>
          <p className="pt-2 text-xs text-primary flex items-center gap-1 cursor-pointer hover:underline w-fit">
            <ExternalLink size={12} /> Discover Features
          </p>
        </div>
      )
    },
    'Documentation': {
      title: 'Documentation Hub',
      content: (
        <div className="space-y-3">
          <p>Explore our comprehensive guides to get the most out of ProNexus:</p>
          <div className="grid grid-cols-1 gap-2 mt-2">
            <div className="p-2 border border-outline-variant/20 rounded bg-surface-container-high cursor-pointer hover:border-primary/50 transition-colors">
              <p className="font-medium text-on-surface text-sm">Admin Onboarding Guide</p>
              <p className="text-xs">Setup batches, users & permissions.</p>
            </div>
            <div className="p-2 border border-outline-variant/20 rounded bg-surface-container-high cursor-pointer hover:border-primary/50 transition-colors">
              <p className="font-medium text-on-surface text-sm">Teacher Interface Manual</p>
              <p className="text-xs">Manage groups and evaluate tasks.</p>
            </div>
          </div>
        </div>
      )
    },
    'Support': {
      title: 'Help & Support',
      content: (
        <div className="space-y-3">
          <p>We are here to help! Our support team is online 24/7 for institutional admins.</p>
          <div className="bg-surface-container-high p-3 rounded-lg border border-outline-variant/10 space-y-1">
            <p>Email: <a href="mailto:support@pronexus.edu" className="font-medium text-primary hover:underline">support@pronexus.edu</a></p>
            <p>Phone: <span className="font-medium">1-800-ACADEMIC</span></p>
            <p>Live Chat: <span className="text-secondary font-medium cursor-pointer hover:underline">Start Session</span></p>
          </div>
        </div>
      )
    }
  };

  return (
    <>
      <header className="bg-surface-container-lowest/85 backdrop-blur-[12px] fixed top-0 w-full z-10 flex items-center justify-between px-6 h-14">
        <div className="font-headline tracking-[-0.02em] antialiased text-xl font-bold text-on-surface">
          {loginData.header.logoText}
        </div>
        <div className="hidden md:flex gap-6 items-center">
          {loginData.header.links.map((link, idx) => (
            <button 
              key={idx} 
              onClick={() => setActiveModal(link.label)}
              className="font-headline text-on-surface-variant hover:text-primary transition-colors text-sm font-medium cursor-pointer"
            >
              {link.label}
            </button>
          ))}
        </div>
      </header>

      {/* Info Modal */}
      {activeModal && dummyData[activeModal] && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
            onClick={() => setActiveModal(null)}
          />
          <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-xl w-full max-w-sm ghost-shadow animate-scale-up overflow-hidden relative z-10">
            <div className="flex items-center justify-between px-5 py-4 border-b border-outline-variant/10 bg-surface-container-low/50">
              <h3 className="font-headline font-semibold text-on-surface">
                {dummyData[activeModal].title}
              </h3>
              <button 
                onClick={() => setActiveModal(null)}
                className="text-on-surface-variant hover:text-error transition-colors"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-5 text-sm text-on-surface-variant leading-relaxed">
              {dummyData[activeModal].content}
            </div>
            <div className="px-5 py-4 bg-surface-container-low/30 border-t border-outline-variant/10 flex justify-end">
              <button 
                onClick={() => setActiveModal(null)}
                className="px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
