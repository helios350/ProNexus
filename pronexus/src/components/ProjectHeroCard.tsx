import { Rocket, User, Check, Clock, Lock } from 'lucide-react';
import type { ProjectData } from '../data/mockStudentData';

interface Props {
  project: ProjectData;
}

export function ProjectHeroCard({ project }: Props) {
  return (
    <section className="bg-surface-container-lowest border border-outline-variant/20 rounded-xl p-8 overflow-hidden relative group">
      <div className="absolute top-0 right-0 p-8 opacity-10">
        <Rocket className="w-48 h-48 text-primary -mr-8 -mt-8" />
      </div>

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-6">
          <div>
            <span className="font-mono text-[0.6875rem] text-primary bg-primary-fixed px-2 py-0.5 rounded tracking-tighter mb-2 inline-block">
              ID: {project.id}
            </span>
            <h2 className="text-2xl font-bold tracking-tight text-on-surface pr-12">{project.title}</h2>
            <p className="text-on-surface-variant flex items-center gap-2 mt-1">
              <User size={14} />
              Mentor: <span className="font-semibold text-on-surface">{project.mentor}</span>
            </p>
          </div>
          <button className="bg-gradient-to-br from-primary to-primary-container text-white px-4 py-2 rounded-lg text-sm font-medium transition-transform hover:scale-[1.02] active:scale-95 shrink-0 shadow-sm">
            View Details
          </button>
        </div>

        <div className="mt-12">
          <h3 className="font-mono text-[0.6875rem] uppercase tracking-widest text-on-surface-variant mb-6">Review Progress</h3>
          <div className="relative pt-4 px-2">
            {/* Timeline Line */}
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-surface-container-high -translate-y-1/2"></div>
            <div 
              className="absolute top-1/2 left-0 h-0.5 bg-primary -translate-y-1/2 transition-all duration-1000"
              style={{ width: `${project.progress.percentage}%` }}
            ></div>

            <div className="relative flex justify-between">
              {project.progress.steps.map((step, idx) => {
                const isCompleted = step.status === 'COMPLETED';
                const isInProgress = step.status === 'IN PROGRESS';
                const isUpcoming = step.status === 'UPCOMING';

                return (
                  <div key={idx} className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center relative z-10 ring-4 ring-white ${
                      isCompleted || isInProgress ? 'bg-primary text-white' : 'bg-surface-container-high text-on-surface-variant'
                    }`}>
                      {isCompleted && <Check size={14} strokeWidth={3} />}
                      {isInProgress && <Clock size={14} />}
                      {isUpcoming && <Lock size={14} />}
                    </div>
                    <span className={`text-[0.75rem] font-bold mt-2 ${isUpcoming ? 'text-on-surface-variant' : 'text-on-surface'}`}>
                      {step.title}
                    </span>
                    <span className={`text-[0.65rem] font-mono ${isInProgress ? 'text-primary font-bold' : 'text-on-surface-variant'}`}>
                      {step.status}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
