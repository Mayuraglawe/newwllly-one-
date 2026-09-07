import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import styles from '../dashboard.module.css';
import AllocateTaskModal from '../components/AllocateTaskModal';

export default async function TasksPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect('/login');

  const userId = (session.user as { id: string }).id;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userRole = (session.user as any).role || 'MEMBER';
  const isAdmin = userRole === 'ADMIN';

  // Get all tasks assigned to the current user
  const tasks = await prisma.task.findMany({
    where: { assigneeId: userId },
    include: {
      project: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className={styles.dashboardContainer}>
      <header className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>My Tasks</h1>
          <p className={styles.pageSubtitle}>All action items assigned to you across projects ({tasks.length})</p>
        </div>
        {isAdmin && (
          <div className={styles.headerActions}>
            <AllocateTaskModal />
          </div>
        )}
      </header>

      {tasks.length === 0 ? (
        <div className={styles.emptyState}>
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🎉</div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-main)' }}>All Caught Up!</h3>
          <p style={{ color: 'var(--text-muted)' }}>You have no pending tasks assigned to you right now.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {tasks.map((task) => {
            const isDone = task.status === 'DONE';
            const inProgress = task.status === 'IN_PROGRESS';

            return (
              <div
                key={task.id}
                style={{
                  background: 'var(--surface-glass)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.25rem 1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'all 200ms ease',
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
                    <span style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: isDone ? 'rgba(5, 150, 105, 0.15)' : inProgress ? 'rgba(217, 119, 6, 0.15)' : 'rgba(2, 132, 199, 0.15)',
                      color: isDone ? 'var(--accent-emerald)' : inProgress ? 'var(--accent-amber)' : 'var(--primary-color)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                    }}>
                      {isDone ? '✓' : '•'}
                    </span>

                    <h3 style={{
                      fontSize: '1.05rem',
                      fontWeight: 600,
                      color: 'var(--text-main)',
                      textDecoration: isDone ? 'line-through' : 'none',
                      opacity: isDone ? 0.7 : 1,
                    }}>
                      {task.title}
                    </h3>
                  </div>

                  {task.description && (
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem', paddingLeft: '2rem' }}>
                      {task.description}
                    </p>
                  )}

                  <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', fontSize: '0.825rem', color: 'var(--text-muted)', paddingLeft: '2rem' }}>
                    <span>
                      Project: <Link href={`/dashboard/projects/${task.project.id}`} style={{ color: 'var(--primary-color)', fontWeight: 600, textDecoration: 'none' }}>{task.project.name}</Link>
                    </span>
                    {task.dueDate && (
                      <span>📅 Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>

                <div>
                  <span className={`${styles.badge} ${
                    isDone ? styles.badgeSuccess : inProgress ? styles.badgeWarning : styles.badgeActive
                  }`}>
                    {task.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

