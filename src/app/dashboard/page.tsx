import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import styles from './dashboard.module.css';
import CreateProjectModal from './components/CreateProjectModal';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect('/login');
  }

  const userId = (session.user as { id: string }).id;

  // 1. Fetch Projects for the user
  const projects = await prisma.project.findMany({
    where: {
      OR: [
        { ownerId: userId },
        { members: { some: { userId: userId } } },
      ],
    },
    include: {
      _count: {
        select: { tasks: true, members: true },
      },
      tasks: {
        where: { status: 'DONE' }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  // 2. Fetch Tasks assigned to user
  const tasks = await prisma.task.findMany({
    where: { assigneeId: userId },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  const activeProjectsCount = projects.length;
  const pendingTasksCount = tasks.filter(t => t.status !== 'DONE').length;
  const completedTasksCount = tasks.filter(t => t.status === 'DONE').length;

  return (
    <div className={styles.dashboardContainer}>
      <header className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Project Overview</h1>
          <p className={styles.pageSubtitle}>Welcome back, <strong style={{ color: 'var(--primary-color)' }}>{session.user.name || 'User'}</strong>. Here&apos;s your team activity overview.</p>
        </div>
        <div className={styles.headerActions}>
          <CreateProjectModal />
        </div>
      </header>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <h3 className={styles.statTitle}>Active Projects</h3>
            <div className={styles.statIcon}>📊</div>
          </div>
          <p className={styles.statValue}>{activeProjectsCount}</p>
          <div className={styles.statTrend}>
            <span className={styles.trendUp}>↑ Active</span> across workspace
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <h3 className={styles.statTitle}>Pending Tasks</h3>
            <div className={styles.statIcon} style={{ background: 'rgba(217, 119, 6, 0.15)', color: 'var(--accent-amber)' }}>⏳</div>
          </div>
          <p className={styles.statValue}>{pendingTasksCount}</p>
          <div className={styles.statTrend}>
            Requires your attention
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <h3 className={styles.statTitle}>Completed Tasks</h3>
            <div className={styles.statIcon} style={{ background: 'rgba(5, 150, 105, 0.15)', color: 'var(--accent-emerald)' }}>✅</div>
          </div>
          <p className={styles.statValue}>{completedTasksCount}</p>
          <div className={styles.statTrend}>
            <span className={styles.trendUp}>Great job!</span> Finished
          </div>
        </div>
      </div>

      <div className={styles.mainGrid}>
        {/* Projects Card */}
        <div className={styles.projectsCard}>
          <div className={styles.cardTitle}>
            <span>Recent Projects</span>
            <Link href="/dashboard/projects" style={{ fontSize: '0.85rem', color: 'var(--primary-color)', textDecoration: 'none' }}>
              View all →
            </Link>
          </div>

          {projects.length === 0 ? (
            <div className={styles.emptyState}>
              <p style={{ color: 'var(--text-muted)' }}>You don&apos;t have any projects yet.</p>
              <div style={{ marginTop: '1rem' }}>
                <CreateProjectModal />
              </div>
            </div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Project Name</th>
                  <th>Members</th>
                  <th>Completion</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {projects.map(project => {
                  const totalTasks = project._count.tasks;
                  const completedTasks = project.tasks.length;
                  const completionPercentage = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

                  return (
                    <tr key={project.id}>
                      <td>
                        <Link href={`/dashboard/projects/${project.id}`} style={{ color: 'var(--text-main)', fontWeight: 600, textDecoration: 'none' }}>
                          {project.name}
                        </Link>
                      </td>
                      <td>
                        <span className={styles.badge} style={{ background: 'var(--surface-hover)', color: 'var(--text-muted)', border: '1px solid var(--border-color)' }}>
                          👥 {project._count.members}
                        </span>
                      </td>
                      <td style={{ minWidth: '140px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                          <span>{completionPercentage}%</span>
                          <span>{completedTasks}/{totalTasks}</span>
                        </div>
                        <div className={styles.progressBarTrack}>
                          <div className={styles.progressBarFill} style={{ width: `${completionPercentage}%` }} />
                        </div>
                      </td>
                      <td>
                        <Link href={`/dashboard/projects/${project.id}`} className="btn btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>
                          Open
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Activity Card */}
        <div className={styles.recentActivityCard}>
          <div className={styles.cardTitle}>
            <span>My Tasks</span>
            <Link href="/dashboard/tasks" style={{ fontSize: '0.85rem', color: 'var(--primary-color)', textDecoration: 'none' }}>
              View all →
            </Link>
          </div>

          <div className={styles.activityList}>
            {tasks.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No recent tasks assigned to you.</p>
            ) : (
              tasks.map(task => (
                <div key={task.id} className={styles.activityItem}>
                  <div className={styles.activityAvatar} style={{
                    background: task.status === 'DONE' ? 'rgba(5, 150, 105, 0.15)' : 'rgba(2, 132, 199, 0.15)',
                    color: task.status === 'DONE' ? 'var(--accent-emerald)' : 'var(--primary-color)'
                  }}>
                    {task.status === 'DONE' ? '✓' : '•'}
                  </div>
                  <div className={styles.activityContent}>
                    <p className={styles.activityText}><strong>{task.title}</strong></p>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <span className={`${styles.badge} ${
                        task.status === 'DONE' ? styles.badgeSuccess : task.status === 'IN_PROGRESS' ? styles.badgeWarning : styles.badgeActive
                      }`}>
                        {task.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

