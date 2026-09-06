'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Task = {
  id: string;
  title: string;
  description?: string | null;
  status: string;
};

export default function TaskBoard({ initialTasks, projectId }: { initialTasks: Task[], projectId: string }) {
  const [tasks, setTasks] = useState(initialTasks);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const router = useRouter();

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    // Optimistic UI update
    setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));

    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      router.refresh();
    } catch (error) {
      console.error(error);
      // Revert on error
      setTasks(initialTasks);
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTaskTitle, projectId })
      });
      
      if (res.ok) {
        const newTask = await res.json();
        setTasks([newTask, ...tasks]);
        setNewTaskTitle('');
        setIsAdding(false);
        router.refresh();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (taskId: string) => {
    if (!confirm('Delete this task?')) return;
    setTasks(tasks.filter(t => t.id !== taskId));
    await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
    router.refresh();
  };

  const renderTask = (task: Task) => (
    <div key={task.id} style={{ border: '1px solid #e2e8f0', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem', backgroundColor: 'white' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <h4 style={{ margin: '0 0 0.5rem 0', textDecoration: task.status === 'DONE' ? 'line-through' : 'none' }}>{task.title}</h4>
        <button onClick={() => handleDelete(task.id)} style={{ background: 'none', border: 'none', color: 'red', cursor: 'pointer', fontSize: '1.2rem' }}>×</button>
      </div>
      
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
        {task.status !== 'TODO' && <button onClick={() => handleStatusChange(task.id, 'TODO')} style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', border: '1px solid #e2e8f0', borderRadius: '0.25rem', cursor: 'pointer', background: 'white' }}>Move to To Do</button>}
        {task.status !== 'IN_PROGRESS' && <button onClick={() => handleStatusChange(task.id, 'IN_PROGRESS')} style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', border: '1px solid #e2e8f0', borderRadius: '0.25rem', cursor: 'pointer', background: '#eff6ff', color: '#1d4ed8' }}>Move to In Progress</button>}
        {task.status !== 'DONE' && <button onClick={() => handleStatusChange(task.id, 'DONE')} style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', border: '1px solid #e2e8f0', borderRadius: '0.25rem', cursor: 'pointer', background: '#f0fdf4', color: '#15803d' }}>Move to Done</button>}
      </div>
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
        {isAdding ? (
          <form onSubmit={handleAddTask} style={{ display: 'flex', gap: '0.5rem', width: '100%', maxWidth: '400px' }}>
            <input type="text" value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} placeholder="Task title..." required style={{ flex: 1, padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '0.25rem' }} />
            <button type="submit" className="btn btn-primary" style={{ backgroundColor: 'var(--primary-color)' }}>Save</button>
            <button type="button" onClick={() => setIsAdding(false)} className="btn btn-secondary">Cancel</button>
          </form>
        ) : (
          <button onClick={() => setIsAdding(true)} className="btn btn-primary" style={{ backgroundColor: 'var(--primary-color)' }}>+ Add Task</button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        <div style={{ backgroundColor: '#f8fafc', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
          <h3 style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem' }}>To Do</h3>
          {tasks.filter(t => t.status === 'TODO').map(renderTask)}
        </div>

        <div style={{ backgroundColor: '#f8fafc', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
          <h3 style={{ borderBottom: '2px solid #3b82f6', paddingBottom: '0.5rem', marginBottom: '1rem' }}>In Progress</h3>
          {tasks.filter(t => t.status === 'IN_PROGRESS').map(renderTask)}
        </div>

        <div style={{ backgroundColor: '#f8fafc', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
          <h3 style={{ borderBottom: '2px solid #22c55e', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Done</h3>
          {tasks.filter(t => t.status === 'DONE').map(renderTask)}
        </div>
      </div>
    </div>
  );
}
