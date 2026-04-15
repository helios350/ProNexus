import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useTheme } from '../contexts/ThemeContext';

export const useAuth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { setTheme } = useTheme();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) throw authError;

      // Use role from user_metadata (set during user creation) to avoid
      // a race condition with AuthContext's onAuthStateChange listener
      // both competing for the same Navigator Lock on the auth token.
      const role = data.user.user_metadata?.role;
      if (!role) {
        throw new Error('Account exists but no role assigned. Contact your administrator.');
      }

      // Reset to default (light) theme on login
      setTheme('light');

      // Redirect to the appropriate dashboard
      navigate(`/${role}`, { replace: true });
    } catch (err: unknown) {
      if (err instanceof Error) {
        // Friendlier error messages
        if (err.message === 'Invalid login credentials') {
          setError('Invalid email or password. Please try again.');
        } else {
          setError(err.message);
        }
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  return { email, setEmail, password, setPassword, loading, error, handleLogin };
};
