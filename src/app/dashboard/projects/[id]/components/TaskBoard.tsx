'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Member = {
  id: string;
  name: string | null;
  email: string;
  isOwner?: boolean;
};

type Task = {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  assigneeId?: string | null;
  assignee?: { id: string; name: string | null; email: string } | null;
  dueDate?: string | Date | null;
};

export default function TaskBoard({
  initialTasks,
  projectId,
  members = []
}: {
  initialTasks: Task[];
  projectId: string;
  members?: Member[];
}) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskAssigneeId, setNewTaskAssigneeId] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
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

  const handleAssigneeChange = async (taskId: string, newAssigneeId: string) => {
    const selectedMember = members.find(m => m.id === newAssigneeId);
    setTasks(tasks.map(t => t.id === taskId ? {
      ...t,
      assigneeId: newAssigneeId === 'unassigned' || !newAssigneeId ? null : newAssigneeId,
      assignee: newAssigneeId === 'unassigned' || !newAssigneeId
        ? null
        : selectedMember ? { id: selectedMember.id, name: selectedMember.name, email: selectedMember.email } : t.assignee
    } : t));

    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assigneeId: newAssigneeId })
      });
      router.refresh();
    } catch (error) {
      console.error(error);
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
        body: JSON.stringify({
          title: newTaskTitle,
          description: newTaskDescription,
          projectId,
          assigneeId: newTaskAssigneeId || undefined,
          dueDate: newTaskDueDate || undefined
        })
      });
      
      if (res.ok) {
        const newTask = await res.json();
        setTasks([newTask, ...tasks]);
        setNewTaskTitle('');
        setNewTaskDescription('');
        setNewTaskAssigneeId('');
        setNewTaskDueDate('');
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

  const renderTask = (task: Task) => {
    const currentAssigneeId = task.assigneeId || 'unassigned';

    return (
      <div
        key={task.id}
        style={{
          background: 'var(--surface-card)',
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

        {task.description && (
          <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '0.65rem', lineHeight: 1.5 }}>
            {task.description}
          </p>
        )}

        {/* Teammate Assignee Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', fontSize: '0.8rem' }}>
          <span style={{ color: 'var(--text-dim)', fontWeight: 600 }}>👤 Assignee:</span>
          <select
            value={currentAssigneeId}
            onChange={(e) => handleAssigneeChange(task.id, e.target.value)}
            style={{
              padding: '0.2rem 0.5rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-color)',
              background: 'var(--surface-hover)',
              color: 'var(--text-main)',
              fontSize: '0.8rem',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            <option value="unassigned">Unassigned</option>
            {members.map(member => (
              <option key={member.id} value={member.id}>
                {member.name || member.email} {member.isOwner ? '(Owner)' : ''}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
          {task.status !== 'TODO' && (
            <button
              onClick={() => handleStatusChange(task.id, 'TODO')}
              style={{
                fontSize: '0.75rem',
                padding: '0.25rem 0.6rem',
                borderRadius: '0.25rem',
                border: '1px solid var(--border-color)',
                background: 'var(--surface-hover)',
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
                border: '1px solid rgba(217, 119, 6, 0.3)',
                background: 'rgba(217, 119, 6, 0.15)',
                color: 'var(--accent-amber)',
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
                border: '1px solid rgba(5, 150, 105, 0.3)',
                background: 'rgba(5, 150, 105, 0.15)',
                color: 'var(--accent-emerald)',
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
  };

  return (
    <div>
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
        {isAdding ? (
          <form onSubmit={handleAddTask} style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            width: '100%',
            maxWidth: '520px',
            background: 'var(--surface-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.25rem',
            boxShadow: 'var(--shadow-md)'
          }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>+ Create New Task</h4>
            
            <input
              type="text"
              value={newTaskTitle}
              onChange={e => setNewTaskTitle(e.target.value)}
              placeholder="Task Title (e.g. Design Landing Page)"
              required
              autoFocus
              style={{
                padding: '0.65rem 1rem',
                background: 'var(--surface-hover)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-main)',
                fontSize: '0.9rem',
              }}
            />

            <textarea
              value={newTaskDescription}
              onChange={e => setNewTaskDescription(e.target.value)}
              placeholder="Task description & deliverables (optional)..."
              rows={2}
              style={{
                padding: '0.65rem 1rem',
                background: 'var(--surface-hover)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-main)',
                fontSize: '0.875rem',
                resize: 'vertical',
              }}
            />

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '180px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                  Assign To Teammate
                </label>
                <select
                  value={newTaskAssigneeId}
                  onChange={e => setNewTaskAssigneeId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.75rem',
                    background: 'var(--surface-hover)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-main)',
                    fontSize: '0.85rem',
                  }}
                >
                  <option value="">-- Select Teammate --</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name || m.email} {m.isOwner ? '(Owner)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ flex: 1, minWidth: '180px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                  Due Date (Optional)
                </label>
                <input
                  type="date"
                  value={newTaskDueDate}
                  onChange={e => setNewTaskDueDate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.75rem',
                    background: 'var(--surface-hover)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-main)',
                    fontSize: '0.85rem',
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button type="button" onClick={() => setIsAdding(false)} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={loadingTask} style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                {loadingTask ? 'Saving...' : 'Assign & Create Task'}
              </button>
            </div>
          </form>
        ) : (
          <button onClick={() => setIsAdding(true)} className="btn btn-primary">
            + Add & Assign Task
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {/* To Do Column */}
        <div style={{
          background: 'var(--surface-glass)',
          backdropFilter: 'blur(12px)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem',
          boxShadow: 'var(--shadow-md)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '2px solid var(--primary-color)' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>📋 To Do</h3>
            <span style={{ fontSize: '0.8rem', background: 'rgba(2, 132, 199, 0.15)', color: 'var(--primary-color)', padding: '0.2rem 0.6rem', borderRadius: '99px', fontWeight: 700 }}>
              {tasks.filter(t => t.status === 'TODO').length}
            </span>
          </div>
          {tasks.filter(t => t.status === 'TODO').map(renderTask)}
        </div>

        {/* In Progress Column */}
        <div style={{
          background: 'var(--surface-glass)',
          backdropFilter: 'blur(12px)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem',
          boxShadow: 'var(--shadow-md)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '2px solid var(--accent-amber)' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>⏳ In Progress</h3>
            <span style={{ fontSize: '0.8rem', background: 'rgba(217, 119, 6, 0.15)', color: 'var(--accent-amber)', padding: '0.2rem 0.6rem', borderRadius: '99px', fontWeight: 700 }}>
              {tasks.filter(t => t.status === 'IN_PROGRESS').length}
            </span>
          </div>
          {tasks.filter(t => t.status === 'IN_PROGRESS').map(renderTask)}
        </div>

        {/* Done Column */}
        <div style={{
          background: 'var(--surface-glass)',
          backdropFilter: 'blur(12px)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem',
          boxShadow: 'var(--shadow-md)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '2px solid var(--accent-emerald)' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>✅ Done</h3>
            <span style={{ fontSize: '0.8rem', background: 'rgba(5, 150, 105, 0.15)', color: 'var(--accent-emerald)', padding: '0.2rem 0.6rem', borderRadius: '99px', fontWeight: 700 }}>
              {tasks.filter(t => t.status === 'DONE').length}
            </span>
          </div>
          {tasks.filter(t => t.status === 'DONE').map(renderTask)}
        </div>
      </div>
    </div>
  );
}
