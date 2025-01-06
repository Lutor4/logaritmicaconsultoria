import { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import type { Profile } from '../types/profile';

// Admin profile for development
const ADMIN_PROFILE: Profile = {
  id: '00000000-0000-0000-0000-000000000000',
  email: 'admin@admin.com',
  full_name: 'Administrador',
  municipality: 'Sistema',
  role: 'admin'
};

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    // Use admin profile for admin@admin.com
    if (user.email === 'admin@admin.com') {
      setProfile(ADMIN_PROFILE);
      setLoading(false);
      return;
    }

    setLoading(false);
  }, [user]);

  return { profile, loading, error };
}