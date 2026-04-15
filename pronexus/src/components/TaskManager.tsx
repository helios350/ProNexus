import { useState } from 'react';
import { supabase } from '../lib/supabase';

export interface TaskManagerProps {
  projectId: string;
  tasks: any[];
  onTaskChange: () => void;
}

export function TaskManager({ projectId, tasks, onTaskChange }: TaskManagerProps) {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateTask = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newTaskTitle.trim()) {
      setIsSubmitting(true);
      const { error } = await supabase
        .from('tasks')
        .insert({
          project_id: projectId,
          title: newTaskTitle.trim(),
          deadline: null, // default
          is_open: true
        });

      if (!error) {
        setNewTaskTitle('');
        onTaskChange();
      } else {
        alert('Error creating task.');
      }
      setIsSubmitting(false);
    }
  };

  const toggleTaskStatus = async (taskId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('tasks')
      .update({ is_open: !currentStatus })
      .eq('id', taskId);
      
    if (!error) {
      onTaskChange();
    }
  };

  return (
    <section className="mb-10">
      <div className="flex items-end justify-between mb-6">
        <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-on-surface-variant font-bold">Task Manager</h3>
        <span className="font-mono text-[10px] text-primary bg-primary-fixed px-2 py-0.5 rounded font-bold">{tasks.length} TOTAL</span>
      </div>

      {/* Ghost Input Field */}
      <div className="mb-6 relative">
        <input 
          className="w-full bg-surface-container-lowest border-0 rounded-lg px-4 py-4 text-sm focus:ring-0 placeholder:text-outline-variant shadow-[0_4px_20px_-2px_rgba(25,28,30,0.04)] transition-transform focus:scale-[1.01] outline-none" 
          placeholder="Add a new task and press Enter..." 
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          onKeyDown={handleCreateTask}
          disabled={isSubmitting}
        />
        {isSubmitting && <div className="absolute right-4 top-4 text-xs text-outline font-mono">Adding...</div>}
      </div>

      {/* Task List */}
      <div className="space-y-2">
        {tasks.length === 0 && (
          <div className="p-8 text-center text-sm text-on-surface-variant bg-surface-container-lowest rounded-lg border border-outline-variant/30">
            No tasks created yet. Use the field above.
          </div>
        )}
        {tasks.map((task) => (
          <div 
            key={task.id} 
            onClick={() => toggleTaskStatus(task.id, task.is_open)}
            className="bg-surface-container-lowest p-4 rounded-lg shadow-[0_2px_8px_-2px_rgba(25,28,30,0.02)] flex flex-col gap-2 transition-colors hover:bg-surface-container-low cursor-pointer"
          >
            <div className="flex justify-between items-start">
              <span className={`text-sm font-semibold transition-all ${!task.is_open ? 'text-on-surface/60 italic line-through' : 'text-on-surface'}`}>
                {task.title}
              </span>
              {task.is_open ? (
                 <span className="px-2 py-0.5 bg-tertiary-fixed text-tertiary font-mono text-[9px] font-bold rounded uppercase">ONGOING</span>
              ) : (
                 <span className="px-2 py-0.5 bg-secondary-fixed text-on-secondary-fixed-variant font-mono text-[9px] font-bold rounded uppercase">COMPLETED</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] tracking-tighter text-outline">
                {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'No Deadline'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
