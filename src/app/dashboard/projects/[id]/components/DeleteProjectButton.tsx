'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function DeleteProjectButton({ projectId, isOwner }: { projectId: string, isOwner: boolean }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  if (!isOwner) return null;

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to completely delete this project? This cannot be undone.')) return;
    
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/projects/${projectId}`, { method: 'DELETE' });
      if (res.ok) {
        router.push('/dashboard');
        router.refresh();
      } else {
        alert('Failed to delete project');
      }
    } catch {
      alert('Network error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button 
      onClick={handleDelete}
      disabled={isDeleting}
      className="btn btn-danger"
    >
      🗑️ {isDeleting ? 'Deleting...' : 'Delete Project'}
    </button>
  );
}
