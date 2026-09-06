'use client';

import Link from 'next/link';
import { useState } from 'react';
import styles from '../auth.module.css';
import dashboardStyles from '../dashboard/dashboard.module.css'; 

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = (document.getElementById('email') as HTMLInputElement).value;
    
    try {
      await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      // Always show success to prevent email enumeration
      setSubmitted(true);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className={dashboardStyles.dashboardTheme}>
      <div className={styles.authContainer}>
        <div className={styles.authCard}>
          <h1 className={styles.authLogo}>NOVA</h1>
          <p className={styles.authSubtitle}>Reset your password</p>
          
          {!submitted ? (
            <form onSubmit={handleSubmit}>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem', textAlign: 'center' }}>
                Enter your email address and we&apos;ll send you a link to reset your password.
              </p>
              
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
              
              <button type="submit" className={styles.authButton}>
                Send Reset Link
              </button>
            </form>
          ) : (
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✉️</div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>Check your email</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                We&apos;ve sent a password reset link to your email address.
              </p>
            </div>
          )}
          
          <div className={styles.authFooter}>
            Remember your password? <Link href="/login" className={styles.authLink}>Back to login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
