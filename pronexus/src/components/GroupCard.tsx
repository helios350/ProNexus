

// Adjusted to handle real Supabase data if needed, but for now we'll take a loosely typed prop.
export interface GroupCardProps {
  group: any; 
  onGroupClick?: (group: any) => void;
}

export function GroupCard({ group, onGroupClick }: GroupCardProps) {
  return (
    <div 
      onClick={() => onGroupClick?.(group)}
      className="bg-surface-container-lowest p-6 rounded-lg ghost-shadow transition-transform hover:scale-[1.01] cursor-pointer"
    >
      <div className="flex justify-between items-start mb-6">
        <h3 className="text-lg font-bold text-on-surface">{group.title || group.name}</h3>
        <span className="font-label text-[10px] bg-tertiary-fixed text-on-tertiary-fixed-variant px-2 py-0.5 rounded">
          {group.group_code || 'N/A'}
        </span>
      </div>
      
      <div className="flex flex-wrap gap-2 mb-6">
        {(group.tech_stack || []).map((tech: string, i: number) => (
           <span key={i} className="font-label text-[10px] bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded">
             {tech}
           </span>
        ))}
      </div>
      
      <div className="space-y-4">
        {group.mentor_name && (
          <div className="flex items-center gap-3">
             <div className="w-6 h-6 rounded-full bg-surface-container-high flex items-center justify-center font-bold text-[10px] text-on-surface">
               {group.mentor_name.substring(0, 1)}
             </div>
             <span className="text-xs font-medium text-on-surface-variant">Mentor: {group.mentor_name}</span>
          </div>
        )}
        
        <div className="flex -space-x-2">
          {(group.members || []).slice(0, 4).map((member: any, i: number) => (
             <div 
               key={member.id || i}
               title={member.full_name}
               className="w-8 h-8 rounded-full border-2 border-surface-container-lowest bg-primary-fixed flex items-center justify-center text-[10px] font-bold text-primary"
             >
               {(member.full_name || '?').substring(0, 1).toUpperCase()}
             </div>
          ))}
          {(group.members?.length || 0) > 4 && (
             <div className="w-8 h-8 rounded-full border-2 border-surface-container-lowest bg-surface-container-high flex items-center justify-center text-[10px] font-bold text-on-surface-variant">
               +{(group.members.length - 4)}
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
