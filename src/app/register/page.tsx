'use client';

import Link from 'next/link';
import styles from '../auth.module.css';
import dashboardStyles from '../dashboard/dashboard.module.css'; // Reuse dashboard theme

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      if (res.ok) {
        // Redirect to login page for manual sign in
        router.push('/login?registered=true');
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={dashboardStyles.dashboardTheme}>
      <div className={styles.authContainer}>
        <div className={styles.authCard}>
          <h1 className={styles.authLogo}>NOVA</h1>
          <p className={styles.authSubtitle}>Create your account</p>
          
          {error && <div style={{ color: 'red', marginBottom: '1rem', fontSize: '0.9rem', textAlign: 'center' }}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="name" className={styles.label}>Full Name</label>
              <input 
                type="text" 
                id="name" 
                value={name}
                onChange={(e) => setName(e.target.value)}
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.input} 
                placeholder="••••••••" 
                required 
              />
            </div>
            
            <button type="submit" className={styles.authButton} disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
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
