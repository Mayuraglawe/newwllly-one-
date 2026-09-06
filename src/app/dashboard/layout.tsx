import Link from 'next/link';
import styles from './dashboard.module.css';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.dashboardTheme}>
      <div className={styles.dashboardLayout}>
        <aside className={styles.sidebar}>
          <div className={styles.sidebarLogo}>NOVA</div>
          <nav>
            <Link href="/dashboard" className={`${styles.navItem} ${styles.active}`}>
              Dashboard
            </Link>
            <Link href="/dashboard/projects" className={styles.navItem}>
              Projects
            </Link>
            <Link href="/dashboard/tasks" className={styles.navItem}>
              My Tasks
            </Link>
            <Link href="/dashboard/team" className={styles.navItem}>
              Team
            </Link>
          </nav>
        </aside>
        
        <main className={styles.mainContent}>
          <header className={styles.header}>
            <h2>Overview</h2>
            <button className="btn btn-primary" style={{ backgroundColor: 'var(--primary-color)' }}>
              + New Project
            </button>
          </header>
          {children}
        </main>
      </div>
    </div>
  );
}
