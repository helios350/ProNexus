import type { StudentData } from '../data/mockStudentData';

interface Props {
  updates: StudentData['updates'];
}

export function BatchUpdates({ updates }: Props) {
  return (
    <section className="bg-surface-container-low/50 p-6 rounded-xl">
      <h3 className="font-headline font-bold text-sm mb-4">Batch Updates</h3>
      <div className="space-y-4">
        {updates.map((update, idx) => (
          <div key={idx} className="flex gap-3">
            <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
              update.type === 'error' ? 'bg-error' : 'bg-primary'
            }`}></div>
            <div>
              <p className="text-xs font-semibold">{update.title}</p>
              <p className="text-[10px] text-on-surface-variant">{update.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
