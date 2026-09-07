import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import styles from '../dashboard.module.css';
import PlatformInviteModal from '../components/PlatformInviteModal';


export default async function TeamPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect('/login');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userRole = (session.user as any).role || 'MEMBER';
  const isAdmin = userRole === 'ADMIN';

  // Fetch all users on the platform to show workspace directory
  const platformUsers = await prisma.user.findMany({
    include: {
      memberships: {
        include: { project: { select: { name: true } } }
      },
      projects: {
        select: { name: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className={styles.dashboardContainer}>
      <header className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Team Directory</h1>
          <p className={styles.pageSubtitle}>All workspace collaborators ({platformUsers.length})</p>
        </div>
        {isAdmin && (
          <div className={styles.headerActions} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <PlatformInviteModal />
          </div>
        )}
      </header>

      {platformUsers.length === 0 ? (
        <div className={styles.emptyState}>
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>👥</div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-main)' }}>No Team Members Yet</h3>
          <p style={{ color: 'var(--text-muted)' }}>Invite collaborators into your workspace to start assigning work.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {(platformUsers as any[]).map((user) => {
            const initial = (user.name || user.email)[0].toUpperCase();
            const isAdminRole = user.role === 'ADMIN';
            
            // Collect unique project names where user is owner or member
            const projectNames = Array.from(new Set([
              ...(user.projects || []).map((p: { name: string }) => p.name),
              ...(user.memberships || []).map((m: { project: { name: string } }) => m.project?.name).filter(Boolean)
            ]));

            return (
              <div
                key={user.id}
                style={{
                  background: 'var(--surface-glass)',
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
                  background: isAdminRole ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' : 'linear-gradient(135deg, #0284c7 0%, #0d9488 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 800,
                  fontSize: '1.4rem',
                  flexShrink: 0,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                }}>
                  {initial}
                </div>

                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {user.name || 'Team Member'}
                    </h3>
                    <span className={`${styles.badge} ${isAdminRole ? styles.badgeWarning : styles.badgeActive}`}>
                      {isAdminRole ? '👑 ADMIN' : '👥 MEMBER'}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    ✉️ {user.email}
                  </p>

                  <div style={{ fontSize: '0.8rem', color: 'var(--primary-color)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    📁 Projects: {projectNames.length > 0 ? projectNames.join(', ') : 'None assigned yet'}
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

