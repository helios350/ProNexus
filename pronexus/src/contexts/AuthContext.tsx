import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  role: 'admin' | 'teacher' | 'student';
  roll_no: string | null;
  contact: string | null;
  batch_id: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  loading: true,
  signOut: async () => {},
});

export const useAuthContext = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, role, roll_no, contact, batch_id')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Failed to fetch profile:', error.message);
      return null;
    }
    return data as Profile;
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  useEffect(() => {
    let cancelled = false;

    // Get initial session — this runs on every page load/refresh
    supabase.auth.getSession().then(async ({ data: { session: currentSession } }) => {
      if (cancelled) return;
      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (currentSession?.user) {
        const p = await fetchProfile(currentSession.user.id);
        if (!cancelled) setProfile(p);
      }

      if (!cancelled) setLoading(false);
    });

    // Listen for auth changes (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        // Synchronously update session/user — safe inside the lock
        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (event === 'SIGNED_IN' && newSession?.user) {
          // Defer profile fetch to run AFTER the Navigator Lock is released.
          // Making async Supabase calls inside onAuthStateChange causes
          // NavigatorLockAcquireTimeoutError because both calls compete for
          // the same "sb-<project>-auth-token" lock.
          const userId = newSession.user.id;
          setTimeout(async () => {
            const p = await fetchProfile(userId);
            if (!cancelled) setProfile(p);
          }, 0);
        }

        if (event === 'SIGNED_OUT') {
          setProfile(null);
        }
      }
    );

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, signOut: handleSignOut }}>
      {children}
    </AuthContext.Provider>
  );
};
