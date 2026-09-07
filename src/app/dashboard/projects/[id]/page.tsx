import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import styles from '../../dashboard.module.css';
import TaskBoard from './components/TaskBoard';
import InviteMemberModal from './components/InviteMemberModal';
import DeleteProjectButton from './components/DeleteProjectButton';

export default async function ProjectDetailsPage(props: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect('/login');
  }

  const params = await props.params;
  const userId = (session.user as { id: string }).id;

  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: {
      owner: { select: { id: true, name: true, email: true } },
      members: {
        include: { user: { select: { id: true, name: true, email: true } } }
      },
      tasks: {
        include: { assignee: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!project) {
    return <div style={{ padding: '2rem' }}>Project not found</div>;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userRole = (session.user as any).role || 'MEMBER';
  const isAdmin = userRole === 'ADMIN';

  // Ensure user is member, owner, or platform admin
  const isOwner = project.ownerId === userId || isAdmin;
  const isMember = project.members.some(m => m.userId === userId);
  
  if (!isOwner && !isMember && !isAdmin) {
    return <div style={{ padding: '2rem' }}>Unauthorized</div>;
  }

  // Combine owner and members into a unified project members array for task assignments
  const projectMembers = [
    { id: project.owner.id, name: project.owner.name, email: project.owner.email, isOwner: true },
    ...project.members.map(m => ({ id: m.user.id, name: m.user.name, email: m.user.email, isOwner: false }))
  ];

  return (
    <div className={styles.dashboardContainer}>
      <header className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>{project.name}</h1>
          <p className={styles.pageSubtitle}>{project.description || 'No description provided.'}</p>
        </div>
        <div className={styles.headerActions} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <DeleteProjectButton projectId={project.id} isOwner={isOwner} />
          <InviteMemberModal projectId={project.id} isOwner={isOwner} />
        </div>
      </header>

      <TaskBoard initialTasks={project.tasks} projectId={project.id} members={projectMembers} isAdminOrOwner={isOwner} />

      <div style={{
        marginTop: '2rem',
        background: 'var(--surface-glass)',
        backdropFilter: 'blur(12px)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.5rem',
        boxShadow: 'var(--shadow-md)'
      }}>
        <h3 className={styles.cardTitle}>Team Members ({projectMembers.length})</h3>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong style={{ color: 'var(--text-main)' }}>{project.owner.name || 'Owner'}</strong>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>({project.owner.email})</span>
            </div>
            <span className={`${styles.badge} ${styles.badgeActive}`}>👑 Project Owner</span>
          </li>
          {project.members.map(member => (
            <li key={member.id} style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ color: 'var(--text-main)' }}>{member.user.name || 'Member'}</strong>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>({member.user.email})</span>
              </div>
              <span className={`${styles.badge} ${styles.badgeSuccess}`}>👥 {member.role}</span>
            </li>
          ))}
        </ul>
      </div>

    </div>
  );
}
