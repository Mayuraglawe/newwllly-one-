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

  // Use type assertion since we added 'id' manually in route.ts
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

  return (
    <div className={styles.dashboardContainer}>
      <header className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Project Overview</h1>
          <p className={styles.pageSubtitle}>Welcome back, {session.user.name || 'User'}. Here&apos;s what&apos;s happening today.</p>
        </div>
        <div className={styles.headerActions}>
          <CreateProjectModal />
        </div>
      </header>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <h3 className={styles.statTitle}>Active Projects</h3>
            <span className={styles.statIcon}>📊</span>
          </div>
          <p className={styles.statValue}>{activeProjectsCount}</p>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <h3 className={styles.statTitle}>My Pending Tasks</h3>
            <span className={styles.statIcon}>✅</span>
          </div>
          <p className={styles.statValue}>{pendingTasksCount}</p>
        </div>
      </div>

      <div className={styles.mainGrid}>
        <div className={styles.projectsCard}>
          <h3 className={styles.cardTitle}>Your Projects</h3>
          {projects.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>You don&apos;t have any projects yet.</p>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Project Name</th>
                  <th>Members</th>
                  <th>Completion</th>
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
                        <Link href={`/dashboard/projects/${project.id}`} style={{ color: 'var(--primary-color)', fontWeight: 600, textDecoration: 'none' }}>
                          {project.name}
                        </Link>
                      </td>
                      <td>{project._count.members}</td>
                      <td>{completionPercentage}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className={styles.recentActivityCard}>
          <h3 className={styles.cardTitle}>My Recent Tasks</h3>
          <div className={styles.activityList}>
            {tasks.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>No recent tasks assigned to you.</p>
            ) : (
              tasks.map(task => (
                <div key={task.id} className={styles.activityItem}>
                  <div className={styles.activityAvatar}>
                    {task.status === 'DONE' ? '✓' : '•'}
                  </div>
                  <div className={styles.activityContent}>
                    <p className={styles.activityText}><strong>{task.title}</strong></p>
                    <p className={styles.activityTime}>Status: {task.status}</p>
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
