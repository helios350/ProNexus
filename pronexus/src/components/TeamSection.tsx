import type { StudentData } from '../data/mockStudentData';

interface Props {
  team: StudentData['team'];
}

export function TeamSection({ team }: Props) {
  return (
    <section className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/10 h-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-headline font-bold text-lg">{team.name}</h3>
        <span className="text-xs font-mono text-on-surface-variant">{team.size} MEMBERS</span>
      </div>
      
      <ul className="space-y-4">
        {team.members.map((member) => (
          <li key={member.id} className="flex items-center justify-between group">
            <div className="flex items-center gap-3">
              <img 
                className="w-10 h-10 rounded-lg object-cover" 
                src={member.avatarUrl} 
                alt={member.name} 
              />
              <div>
                <p className="text-sm font-semibold text-on-surface">{member.name}</p>
                <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">{member.role}</p>
              </div>
            </div>
            <span className="font-mono text-xs text-on-surface-variant opacity-60 group-hover:opacity-100 transition-opacity">
              {member.phone}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
