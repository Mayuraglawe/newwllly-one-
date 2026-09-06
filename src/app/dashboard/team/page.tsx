import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import styles from '../dashboard.module.css';

export default async function TeamPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect('/login');

  // Get all projects the user owns or is a member of, with members
  const projects = await prisma.project.findMany({
    where: {
      OR: [
        { ownerId: (session.user as { id: string }).id },
        { members: { some: { userId: (session.user as { id: string }).id } } },
      ],
    },
    include: {
      owner: { select: { id: true, name: true, email: true } },
      members: {
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      },
    },
  });

  // Collect unique members across all projects
  const memberMap = new Map<string, { name: string | null; email: string; role: string; projects: string[] }>();

  for (const project of projects) {
    // Add owner
    if (!memberMap.has(project.owner.email)) {
      memberMap.set(project.owner.email, { name: project.owner.name, email: project.owner.email, role: 'Owner', projects: [] });
    }
    memberMap.get(project.owner.email)!.projects.push(project.name);

    // Add members
    for (const m of project.members) {
      if (!memberMap.has(m.user.email)) {
        memberMap.set(m.user.email, { name: m.user.name, email: m.user.email, role: m.role, projects: [] });
      }
      memberMap.get(m.user.email)!.projects.push(project.name);
    }
  }

  const members = Array.from(memberMap.values());

  return (
    <div className={styles.dashboardContainer}>
      <header className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Team Directory</h1>
          <p className={styles.pageSubtitle}>All collaborators across your workspace ({members.length})</p>
        </div>
      </header>

      {members.length === 0 ? (
        <div className={styles.emptyState}>
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>👥</div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-main)' }}>No Team Members Yet</h3>
          <p style={{ color: 'var(--text-muted)' }}>Invite collaborators into your project boards to start working together.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {members.map((member) => {
            const initial = (member.name || member.email)[0].toUpperCase();
            const isOwnerRole = member.role === 'Owner';

            return (
              <div
                key={member.email}
                style={{
                  background: 'rgba(17, 24, 39, 0.75)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.25rem',
                  boxShadow: 'var(--shadow-md)',
                }}
              >
                <div style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '50%',
                  background: isOwnerRole ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' : 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 800,
                  fontSize: '1.4rem',
                  flexShrink: 0,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                }}>
                  {initial}
                </div>

                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {member.name || 'Team Member'}
                    </h3>
                    <span className={`${styles.badge} ${isOwnerRole ? styles.badgeActive : styles.badgeSuccess}`}>
                      {member.role}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    ✉️ {member.email}
                  </p>

                  <div style={{ fontSize: '0.8rem', color: '#a5b4fc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    📁 Projects: {member.projects.join(', ')}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

