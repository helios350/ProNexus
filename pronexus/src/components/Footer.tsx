import React from 'react';
import { loginData } from '../data/mockData';

export interface ReadonlyFooterProps {}

export const Footer: React.FC<ReadonlyFooterProps> = () => {
  return (
    <footer className="bg-transparent flex justify-between items-center px-8 py-4 w-full fixed bottom-0">
      <div className="font-mono text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-600 opacity-80 hover:opacity-100 transition-opacity">
        {loginData.footer.copyright}
      </div>
      <div className="flex gap-4">
        {loginData.footer.links.map((link, idx) => (
          <a key={idx} className="font-mono text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-600 hover:text-indigo-500 transition-colors" href={link.href}>
            {link.label}
          </a>
        ))}
      </div>
    </footer>
  );
};
