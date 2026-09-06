import Link from 'next/link';
import styles from './page.module.css';

export default function Home() {
  return (
    <main>
      <section className={styles.hero}>
        <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div className={styles.badge}>
            <span>✨ Next-Gen Project Workspace</span>
          </div>

          <h1 className={styles.title}>NOVA</h1>

          <p className={styles.tagline}>
            Plan with precision, collaborate seamlessly, and deliver projects on time. The ultimate all-in-one workspace designed for high-performing teams.
          </p>

          <div className={styles.actions}>
            <Link href="/dashboard" className="btn btn-primary">
              🚀 Go to Dashboard
            </Link>
            <Link href="/login" className="btn btn-secondary">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      <section className="container">
        <div className={styles.features}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🚀</div>
            <h3 className={styles.featureTitle}>Plan with Precision</h3>
            <p className={styles.featureDesc}>
              Create detailed project roadmaps, set milestones, and break down complex objectives into manageable Kanban task boards.
            </p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🤝</div>
            <h3 className={styles.featureTitle}>Collaborate Seamlessly</h3>
            <p className={styles.featureDesc}>
              Invite team members, assign task responsibilities, and maintain a single source of truth for all project communications.
            </p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>📈</div>
            <h3 className={styles.featureTitle}>Deliver on Time</h3>
            <p className={styles.featureDesc}>
              Track progress visually with live stats, monitor deadlines, and ensure your team crosses the finish line successfully.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

