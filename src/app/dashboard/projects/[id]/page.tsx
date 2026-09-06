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
      owner: { select: { name: true, email: true } },
      members: {
        include: { user: { select: { name: true, email: true } } }
      },
      tasks: {
        include: { assignee: { select: { name: true } } },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!project) {
    return <div style={{ padding: '2rem' }}>Project not found</div>;
  }

  // Ensure user is member or owner
  const isOwner = project.ownerId === userId;
  const isMember = project.members.some(m => m.userId === userId);
  
  if (!isOwner && !isMember) {
    return <div style={{ padding: '2rem' }}>Unauthorized</div>;
  }

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

      <TaskBoard initialTasks={project.tasks} projectId={project.id} />

      <div style={{ marginTop: '2rem', backgroundColor: 'white', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
        <h3 className={styles.cardTitle}>Team Members</h3>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li style={{ padding: '0.5rem 0', borderBottom: '1px solid #e2e8f0' }}>
            <strong>{project.owner.name}</strong> ({project.owner.email}) - Owner
          </li>
          {project.members.map(member => (
            <li key={member.id} style={{ padding: '0.5rem 0', borderBottom: '1px solid #e2e8f0' }}>
              <strong>{member.user.name}</strong> ({member.user.email}) - Member
            </li>
          ))}
        </ul>
      </div>

    </div>
  );
}
