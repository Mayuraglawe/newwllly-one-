'use client';

import Link from 'next/link';
import styles from '../auth.module.css';
import dashboardStyles from '../dashboard/dashboard.module.css'; // Reuse dashboard theme

export default function LoginPage() {
  return (
    <div className={dashboardStyles.dashboardTheme}>
      <div className={styles.authContainer}>
        <div className={styles.authCard}>
          <h1 className={styles.authLogo}>NOVA</h1>
          <p className={styles.authSubtitle}>Sign in to your account</p>
          
          <form onSubmit={(e) => e.preventDefault()}>
            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.label}>Email Address</label>
              <input 
                type="email" 
                id="email" 
                className={styles.input} 
                placeholder="name@company.com" 
                required 
              />
            </div>
            
            <div className={styles.formGroup}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label htmlFor="password" className={styles.label} style={{ marginBottom: 0 }}>Password</label>
                <Link href="/forgot-password" className={styles.authLink} style={{ fontSize: '0.8rem' }}>Forgot password?</Link>
              </div>
              <input 
                type="password" 
                id="password" 
                className={styles.input} 
                placeholder="••••••••" 
                required 
                style={{ marginTop: '0.5rem' }}
              />
            </div>
            
            <button type="submit" className={styles.authButton}>
              Sign In
            </button>
          </form>
          
          <div className={styles.authFooter}>
            Don&apos;t have an account? <Link href="/register" className={styles.authLink}>Create one now</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
