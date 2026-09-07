import Link from 'next/link';
import Image from 'next/image';
import styles from './page.module.css';

export default function Home() {
  return (
    <div className={styles.pageWrapper}>
      
      {/* Navigation Bar */}
      <nav className={styles.navbar}>
        <Link href="/" className={styles.navLogo}>
          <div className={styles.navLogoIcon}>⚡</div>
          <span>NOVA</span>
        </Link>
        <div className={styles.navLinks}>
          <Link href="#features" className={styles.navLink}>Features</Link>
          <Link href="#pricing" className={styles.navLink}>Pricing</Link>
          <Link href="/login" className={styles.navLink}>Sign In</Link>
        </div>
        <div className={styles.navActions}>
          <Link href="/dashboard" className={styles.getStartedBtn}>Get Started</Link>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <div className={styles.badge}>
              <span className={styles.badgeHighlight}>Nova 2.0</span>
              <span>The next generation workspace is here</span>
            </div>

            <h1 className={styles.title}>
              <span className={styles.titleGradient}>Manage Work</span>
              <br />
              <span className={styles.titleAccent}>At Light Speed</span>
            </h1>

            <p className={styles.tagline}>
              Plan with precision, collaborate seamlessly, and deliver projects on time. The ultimate all-in-one workspace designed for high-performing, agile teams.
            </p>

            <div className={styles.heroActions}>
              <Link href="/dashboard" className={styles.btnPrimary}>
                Start Building Free
              </Link>
              <Link href="#features" className={styles.btnSecondary}>
                Explore Features
              </Link>
            </div>
          </div>

          <div className={styles.heroImageContainer}>
            <div className={styles.heroGlow}></div>
            <Image 
              src="/hero-abstract.jpg" 
              alt="Nova Premium Abstract Hero" 
              width={600} 
              height={600} 
              className={styles.heroImage}
              priority
            />
          </div>
        </section>

        {/* Features Bento Grid */}
        <section id="features" className={styles.featuresSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Everything you need to manage work</h2>
            <p className={styles.tagline} style={{ margin: '0 auto' }}>
              Built for modern teams who need power without the complexity.
            </p>
          </div>

          <div className={styles.bentoGrid}>
            <div className={`${styles.bentoCard} ${styles.bentoLarge}`}>
              <div className={styles.featureIconWrapper}>🚀</div>
              <h3 className={styles.featureTitle}>Plan with Precision</h3>
              <p className={styles.featureDesc}>
                Create detailed project roadmaps, set milestones, and break down complex objectives into manageable Kanban task boards. Visually track progress and never miss a deadline.
              </p>
            </div>
            <div className={styles.bentoCard}>
              <div className={styles.featureIconWrapper}>🔒</div>
              <h3 className={styles.featureTitle}>Role-Based Access</h3>
              <p className={styles.featureDesc}>
                Secure your workspace. Admins allocate tasks and manage projects, while team members focus on executing their assigned work.
              </p>
            </div>
            <div className={styles.bentoCard}>
              <div className={styles.featureIconWrapper}>🤝</div>
              <h3 className={styles.featureTitle}>Seamless Collaboration</h3>
              <p className={styles.featureDesc}>
                Invite team members instantly. Maintain a single source of truth for all project communications and file sharing.
              </p>
            </div>
            <div className={`${styles.bentoCard} ${styles.bentoLarge}`}>
              <div className={styles.featureIconWrapper}>📈</div>
              <h3 className={styles.featureTitle}>Deliver on Time</h3>
              <p className={styles.featureDesc}>
                Track progress visually with live stats, monitor deadlines, and ensure your team crosses the finish line successfully with automated reminders.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerLogo}>
            <div className={styles.navLogoIcon} style={{ width: '28px', height: '28px', fontSize: '0.9rem' }}>⚡</div>
            <span>NOVA</span>
          </div>
          <div className={styles.footerLinks}>
            <Link href="#" className={styles.footerLink}>Privacy</Link>
            <Link href="#" className={styles.footerLink}>Terms</Link>
            <Link href="#" className={styles.footerLink}>Security</Link>
            <Link href="#" className={styles.footerLink}>Contact</Link>
          </div>
        </div>
        <div className={styles.copyright}>
          &copy; {new Date().getFullYear()} NOVA Workspace. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
