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
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>Team Members</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>All collaborators across your projects</p>
      </div>

      {members.length === 0 ? (
        <div className={styles.emptyState}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👥</div>
          <p style={{ color: 'var(--text-muted)' }}>No team members yet. Invite people to your projects!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {members.map((member) => (
            <div key={member.email} className={styles.projectCard} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--primary-color), var(--accent-color))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontWeight: 700, fontSize: '1.2rem', flexShrink: 0
              }}>
                {(member.name || member.email)[0].toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{member.name || 'Unknown'}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{member.email}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  Projects: {member.projects.join(', ')}
                </div>
              </div>
              <span style={{
                padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.8rem',
                background: member.role === 'Owner' ? '#d1fae5' : '#e0f2fe',
                color: member.role === 'Owner' ? '#065f46' : '#0369a1',
                fontWeight: 600,
              }}>
                {member.role}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
