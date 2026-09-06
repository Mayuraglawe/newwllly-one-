'use client';

import Link from 'next/link';
import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import styles from '../auth.module.css';
import dashboardStyles from '../dashboard/dashboard.module.css';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    
    setStatus('loading');
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      });
      
      if (response.ok) {
        setStatus('success');
      } else {
        const data = await response.json();
        setErrorMessage(data.message || 'Something went wrong');
        setStatus('error');
      }
    } catch {
      setErrorMessage('Network error occurred');
      setStatus('error');
    }
  };

  if (!token) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem 0' }}>
        <p style={{ color: 'var(--text-muted)' }}>Invalid or missing password reset token.</p>
        <Link href="/forgot-password" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>
          Request New Link
        </Link>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div style={{ textAlign: 'center', padding: '1rem 0' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>Password Updated!</h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          Your password has been successfully reset.
        </p>
        <Link href="/login" className="btn btn-primary">
          Sign In Now
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem', textAlign: 'center' }}>
        Enter your new secure password below.
      </p>
      
      {status === 'error' && (
        <div style={{ padding: '0.75rem', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.875rem' }}>
          {errorMessage}
        </div>
      )}
      
      <div className={styles.formGroup}>
        <label htmlFor="password" className={styles.label}>New Password</label>
        <input 
          type="password" 
          id="password" 
          className={styles.input} 
          placeholder="••••••••" 
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      
      <button type="submit" className={styles.authButton} disabled={status === 'loading'}>
        {status === 'loading' ? 'Updating...' : 'Update Password'}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className={dashboardStyles.dashboardTheme}>
      <div className={styles.authContainer}>
        <div className={styles.authCard}>
          <h1 className={styles.authLogo}>NOVA</h1>
          <p className={styles.authSubtitle}>Set a new password</p>
          
          <Suspense fallback={<div style={{ textAlign: 'center' }}>Loading...</div>}>
            <ResetPasswordForm />
          </Suspense>
          
        </div>
      </div>
    </div>
  );
}
