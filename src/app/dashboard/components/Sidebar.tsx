'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import styles from '../dashboard.module.css';

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: '📊' },
    { label: 'Projects', href: '/dashboard/projects', icon: '📁' },
    { label: 'My Tasks', href: '/dashboard/tasks', icon: '✅' },
    { label: 'Team', href: '/dashboard/team', icon: '👥' },
  ];

  const userName = session?.user?.name || 'User';
  const userEmail = session?.user?.email || '';
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
          <span>NOVA</span>
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
        <div className={styles.userInfo}>
          <div className={styles.userAvatar}>{initial}</div>
          <div className={styles.userDetails}>
            <div className={styles.userName}>{userName}</div>
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
