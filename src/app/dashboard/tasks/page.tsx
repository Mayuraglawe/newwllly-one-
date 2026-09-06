import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import styles from '../dashboard.module.css';

export default async function TasksPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect('/login');

  const userId = (session.user as { id: string }).id;

  // Get all tasks assigned to the current user
  const tasks = await prisma.task.findMany({
    where: { assigneeId: userId },
    include: {
      project: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const statusColors: Record<string, { bg: string; color: string }> = {
    TODO:        { bg: '#f3f4f6', color: '#374151' },
    IN_PROGRESS: { bg: '#dbeafe', color: '#1e40af' },
    DONE:        { bg: '#d1fae5', color: '#065f46' },
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>My Tasks</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>All tasks assigned to you across projects</p>
      </div>

      {tasks.length === 0 ? (
        <div className={styles.emptyState}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
          <p style={{ color: 'var(--text-muted)' }}>No tasks assigned to you yet.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {tasks.map((task) => {
            const sc = statusColors[task.status] || statusColors.TODO;
            return (
              <div key={task.id} className={styles.projectCard} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.25rem' }}>{task.title}</div>
                  {task.description && (
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>{task.description}</div>
                  )}
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Project: <span style={{ color: 'var(--primary-color)', fontWeight: 500 }}>{task.project.name}</span>
                    {task.dueDate && (
                      <span style={{ marginLeft: '1rem' }}>
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <span style={{
                  padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.8rem',
                  background: sc.bg, color: sc.color, fontWeight: 600, whiteSpace: 'nowrap',
                }}>
                  {task.status.replace('_', ' ')}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
