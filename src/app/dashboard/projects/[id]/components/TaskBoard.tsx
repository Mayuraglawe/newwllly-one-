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
  const [loadingTask, setLoadingTask] = useState(false);
  const router = useRouter();

  const handleStatusChange = async (taskId: string, newStatus: string) => {
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
      setTasks(initialTasks);
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    setLoadingTask(true);
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
    } finally {
      setLoadingTask(false);
    }
  };

  const handleDelete = async (taskId: string) => {
    if (!confirm('Delete this task?')) return;
    setTasks(tasks.filter(t => t.id !== taskId));
    await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
    router.refresh();
  };

  const renderTask = (task: Task) => (
    <div
      key={task.id}
      style={{
        background: 'rgba(31, 41, 55, 0.8)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-md)',
        padding: '1rem',
        marginBottom: '0.85rem',
        boxShadow: 'var(--shadow-sm)',
        transition: 'all 200ms ease',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem' }}>
        <h4 style={{
          fontSize: '0.95rem',
          fontWeight: 600,
          color: 'var(--text-main)',
          textDecoration: task.status === 'DONE' ? 'line-through' : 'none',
          opacity: task.status === 'DONE' ? 0.7 : 1,
          lineHeight: 1.4,
        }}>
          {task.title}
        </h4>
        <button
          onClick={() => handleDelete(task.id)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            fontSize: '1.25rem',
            lineHeight: 1,
            padding: '0 0.25rem',
          }}
          title="Delete Task"
        >
          ×
        </button>
      </div>

      <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
        {task.status !== 'TODO' && (
          <button
            onClick={() => handleStatusChange(task.id, 'TODO')}
            style={{
              fontSize: '0.75rem',
              padding: '0.25rem 0.6rem',
              borderRadius: '0.25rem',
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.05)',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            ← To Do
          </button>
        )}
        {task.status !== 'IN_PROGRESS' && (
          <button
            onClick={() => handleStatusChange(task.id, 'IN_PROGRESS')}
            style={{
              fontSize: '0.75rem',
              padding: '0.25rem 0.6rem',
              borderRadius: '0.25rem',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              background: 'rgba(245, 158, 11, 0.15)',
              color: '#fde047',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            In Progress
          </button>
        )}
        {task.status !== 'DONE' && (
          <button
            onClick={() => handleStatusChange(task.id, 'DONE')}
            style={{
              fontSize: '0.75rem',
              padding: '0.25rem 0.6rem',
              borderRadius: '0.25rem',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              background: 'rgba(16, 185, 129, 0.15)',
              color: '#6ee7b7',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            Done ✓
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
        {isAdding ? (
          <form onSubmit={handleAddTask} style={{ display: 'flex', gap: '0.5rem', width: '100%', maxWidth: '440px' }}>
            <input
              type="text"
              value={newTaskTitle}
              onChange={e => setNewTaskTitle(e.target.value)}
              placeholder="What needs to be done?"
              required
              autoFocus
              style={{
                flex: 1,
                padding: '0.65rem 1rem',
                background: 'rgba(17, 24, 39, 0.9)',
                border: '1px solid var(--border-highlight)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-main)',
                fontSize: '0.9rem',
              }}
            />
            <button type="submit" className="btn btn-primary" disabled={loadingTask}>
              {loadingTask ? 'Saving...' : 'Add'}
            </button>
            <button type="button" onClick={() => setIsAdding(false)} className="btn btn-secondary">
              Cancel
            </button>
          </form>
        ) : (
          <button onClick={() => setIsAdding(true)} className="btn btn-primary">
            + Add Task
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {/* To Do Column */}
        <div style={{
          background: 'rgba(17, 24, 39, 0.75)',
          backdropFilter: 'blur(12px)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '2px solid #6366f1' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>📋 To Do</h3>
            <span style={{ fontSize: '0.8rem', background: 'rgba(99, 102, 241, 0.2)', color: '#a5b4fc', padding: '0.2rem 0.6rem', borderRadius: '99px', fontWeight: 700 }}>
              {tasks.filter(t => t.status === 'TODO').length}
            </span>
          </div>
          {tasks.filter(t => t.status === 'TODO').map(renderTask)}
        </div>

        {/* In Progress Column */}
        <div style={{
          background: 'rgba(17, 24, 39, 0.75)',
          backdropFilter: 'blur(12px)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '2px solid #f59e0b' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>⏳ In Progress</h3>
            <span style={{ fontSize: '0.8rem', background: 'rgba(245, 158, 11, 0.2)', color: '#fde047', padding: '0.2rem 0.6rem', borderRadius: '99px', fontWeight: 700 }}>
              {tasks.filter(t => t.status === 'IN_PROGRESS').length}
            </span>
          </div>
          {tasks.filter(t => t.status === 'IN_PROGRESS').map(renderTask)}
        </div>

        {/* Done Column */}
        <div style={{
          background: 'rgba(17, 24, 39, 0.75)',
          backdropFilter: 'blur(12px)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '2px solid #10b981' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>✅ Done</h3>
            <span style={{ fontSize: '0.8rem', background: 'rgba(16, 185, 129, 0.2)', color: '#6ee7b7', padding: '0.2rem 0.6rem', borderRadius: '99px', fontWeight: 700 }}>
              {tasks.filter(t => t.status === 'DONE').length}
            </span>
          </div>
          {tasks.filter(t => t.status === 'DONE').map(renderTask)}
        </div>
      </div>
    </div>
  );
}

