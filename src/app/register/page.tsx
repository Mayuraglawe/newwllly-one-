'use client';

import Link from 'next/link';
import styles from '../auth.module.css';
import dashboardStyles from '../dashboard/dashboard.module.css'; // Reuse dashboard theme

export default function RegisterPage() {
  return (
    <div className={dashboardStyles.dashboardTheme}>
      <div className={styles.authContainer}>
        <div className={styles.authCard}>
          <h1 className={styles.authLogo}>NOVA</h1>
          <p className={styles.authSubtitle}>Create your account</p>
          
          <form onSubmit={(e) => e.preventDefault()}>
            <div className={styles.formGroup}>
              <label htmlFor="name" className={styles.label}>Full Name</label>
              <input 
                type="text" 
                id="name" 
                className={styles.input} 
                placeholder="John Doe" 
                required 
              />
            </div>

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
              <label htmlFor="password" className={styles.label}>Password</label>
              <input 
                type="password" 
                id="password" 
                className={styles.input} 
                placeholder="••••••••" 
                required 
              />
            </div>
            
            <button type="submit" className={styles.authButton}>
              Create Account
            </button>
          </form>
          
          <div className={styles.authFooter}>
            Already have an account? <Link href="/login" className={styles.authLink}>Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
