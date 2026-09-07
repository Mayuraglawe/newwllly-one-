'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { useTheme } from '@/components/ThemeContext';
import styles from '../dashboard.module.css';

import PlatformInviteModal from './PlatformInviteModal';

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: '📊' },
    { label: 'Projects', href: '/dashboard/projects', icon: '📁' },
    { label: 'My Tasks', href: '/dashboard/tasks', icon: '✅' },
    { label: 'Team', href: '/dashboard/team', icon: '👥' },
  ];

  const userName = session?.user?.name || 'User';
  const userEmail = session?.user?.email || '';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userRole = (session?.user as any)?.role || 'MEMBER';
  const isAdmin = userRole === 'ADMIN';
  const initial = (userName || 'U')[0].toUpperCase();

  return (
    <aside className={styles.sidebar}>
      <div>
        <div className={styles.sidebarLogo}>
          <span style={{
            background: 'var(--primary-gradient)',
            color: 'white',
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1rem',
            boxShadow: '0 4px 12px rgba(99,102,241,0.4)'
          }}>⚡</span>
          <span style={{ color: 'var(--text-main)' }}>NOVA</span>
        </div>

        <nav className={styles.sidebarNav}>
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navItem} ${isActive ? styles.active : ''}`}
              >
                <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className={styles.sidebarFooter}>
        {/* Admin Invite Teammate Shortcut */}
        {isAdmin && (
          <div style={{ marginBottom: '0.25rem' }}>
            <PlatformInviteModal />
          </div>
        )}

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="btn btn-secondary"
          style={{
            width: '100%',
            justifyContent: 'space-between',
            padding: '0.6rem 0.85rem',
            fontSize: '0.85rem',
            borderRadius: 'var(--radius-md)',
          }}
          title="Toggle Light / Dark Mode"
        >
          <span>{theme === 'dark' ? '🌙 Dark Mode' : '☀️ Light Mode'}</span>
          <span style={{
            fontSize: '0.75rem',
            padding: '0.15rem 0.5rem',
            borderRadius: '99px',
            background: 'rgba(99,102,241,0.15)',
            color: 'var(--primary-color)',
            fontWeight: 700
          }}>Switch</span>
        </button>

        <div className={styles.userInfo}>
          <div className={styles.userAvatar}>{initial}</div>
          <div className={styles.userDetails}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <div className={styles.userName}>{userName}</div>
              <span style={{
                fontSize: '0.65rem',
                padding: '0.1rem 0.4rem',
                borderRadius: '99px',
                background: isAdmin ? 'rgba(217, 119, 6, 0.15)' : 'rgba(2, 132, 199, 0.15)',
                color: isAdmin ? 'var(--accent-amber)' : 'var(--primary-color)',
                fontWeight: 700,
                textTransform: 'uppercase'
              }}>
                {isAdmin ? 'Admin' : 'Member'}
              </span>
            </div>
            <div className={styles.userEmail}>{userEmail}</div>
          </div>
        </div>

        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className={styles.logoutBtn}
          title="Sign out of account"
        >
          <span>🚪</span> Sign Out
        </button>
      </div>
    </aside>
  );
}
