'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type PlatformUser = {
  id: string;
  name: string | null;
  email: string;
};

export default function InviteMemberModal({ projectId, isOwner }: { projectId: string, isOwner: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [platformUsers, setPlatformUsers] = useState<PlatformUser[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;
    if (!isOpen) return;

    fetch('/api/users')
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        if (isMounted) setPlatformUsers(data);
      })
      .catch(() => {
        if (isMounted) setPlatformUsers([]);
      })
      .finally(() => {
        if (isMounted) setIsLoadingUsers(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  if (!isOwner) return null; // Only owners can invite

  const handleOpenModal = () => {
    setIsLoadingUsers(true);
    setIsOpen(true);
  };

  const handleInviteEmail = async (targetEmail: string) => {
    if (!targetEmail.trim()) return;

    setIsLoading(true);
    setError('');
    
    try {
      const res = await fetch(`/api/projects/${projectId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail }),
      });

      if (res.ok) {
        setIsOpen(false);
        setEmail('');
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to invite member');
      }
    } catch {
      setError('Network error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleInviteEmail(email);
  };

  if (!isOpen) {
    return (
      <button onClick={handleOpenModal} className="btn btn-secondary">
        + Invite Teammate
      </button>
    );
  }

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 1000,
      padding: '1rem',
    }}>
      <div style={{
        backgroundColor: 'var(--surface-card)',
        backdropFilter: 'blur(20px)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-xl)',
        padding: '2rem',
        width: '100%', maxWidth: '480px',
        boxShadow: 'var(--shadow-lg)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>Invite Teammate</h2>
          <button onClick={() => { setIsOpen(false); setError(''); }} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
        </div>

        {error && (
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.12)', color: 'var(--accent-rose)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        {/* Quick Select Teammate from Platform Users */}
        {platformUsers.length > 0 && (
          <div style={{ marginBottom: '1.5rem', paddingBottom: '1.25rem', borderBottom: '1px solid var(--border-color)' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              ⚡ Quick Select Platform Teammate
            </label>
            <select
              onChange={(e) => {
                if (e.target.value) {
                  handleInviteEmail(e.target.value);
                }
              }}
              defaultValue=""
              disabled={isLoading || isLoadingUsers}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                background: 'var(--surface-hover)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-main)',
                fontSize: '0.9rem',
              }}
            >
              <option value="" disabled>
                {isLoadingUsers ? 'Loading registered users...' : '-- Choose a user to add --'}
              </option>
              {platformUsers.map(user => (
                <option key={user.id} value={user.email}>
                  {user.name || user.email} ({user.email})
                </option>
              ))}
            </select>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>
              Or Enter Teammate Email
            </label>
            <input 
              type="email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                background: 'var(--surface-hover)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-main)',
                fontSize: '0.95rem',
              }}
              placeholder="colleague@company.com"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.85rem' }}>
            <button 
              type="button" 
              onClick={() => { setIsOpen(false); setError(''); }}
              className="btn btn-secondary"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? 'Inviting...' : 'Add Teammate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
