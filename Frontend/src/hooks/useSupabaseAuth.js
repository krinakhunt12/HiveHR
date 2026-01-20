import { supabase, signIn, signUp, signOut, getSession } from '../lib/supabaseClient';
import { useState, useEffect } from 'react';
import AppLogger from '../utils/AppLogger';

/**
 * Custom hook for Supabase authentication
 * Replaces the mock authentication in routes.jsx
 */
export const useSupabaseAuth = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Safety Break: Force loading to false after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        AppLogger.warn('Auth Safety Break: Forcing loading to false');
        setLoading(false);
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [loading]);

  const fetchProfile = async (userId) => {
    AppLogger.info('Fetching profile for:', userId);
    try {
      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        if (profileError.code === 'PGRST116') {
          AppLogger.info('No profile record found in database for user');
          return null;
        }
        throw profileError;
      }

      AppLogger.info('Profile synchronized:', data.role);
      setProfile(data);
      return data;
    } catch (err) {
      AppLogger.error('Profile fetch failed:', err.message);
      return null;
    }
  };

  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      AppLogger.info('Initializing System Auth...');
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (isMounted) {
          if (session?.user) {
            AppLogger.info('Session restored:', session.user.email);
            setUser(session.user);
            await fetchProfile(session.user.id);
          } else {
            AppLogger.info('No active session found.');
          }
          setLoading(false);
        }
      } catch (err) {
        AppLogger.error('Auth Initialization Failure:', err);
        if (isMounted) setLoading(false);
      }
    };

    initialize();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        AppLogger.info('Auth Event Detected:', event);

        if (isMounted) {
          if (session?.user) {
            setUser(session.user);
            fetchProfile(session.user.id).then(() => {
              if (isMounted) setLoading(false);
            });
          } else {
            setUser(null);
            setProfile(null);
            setLoading(false);
          }
        }
      }
    );

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      const sessionData = await signIn(email, password);

      if (!sessionData?.user) {
        throw new Error('Login failed: Authentication provider returned no user');
      }

      const userProfile = await fetchProfile(sessionData.user.id);

      // Store minimal data for persistence bridge if needed
      localStorage.setItem('hive_session_active', 'true');

      return { ...sessionData, profile: userProfile };
    } catch (err) {
      AppLogger.error('Login Error:', err.message);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, password, profileData) => {
    try {
      setLoading(true);
      setError(null);

      const { user } = await signUp(email, password, {
        full_name: profileData.full_name,
      });

      if (!user) throw new Error('Registration failed');

      const { error: profileError } = await supabase.from('profiles').insert([{
        id: user.id,
        email: user.email,
        ...profileData,
      }]);

      if (profileError) throw profileError;

      AppLogger.info('New Admin account registered successfully');
      return user;
    } catch (err) {
      AppLogger.error('Registration Error:', err.message);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      AppLogger.info('Executing system-wide logout...');
      await signOut();
      localStorage.clear(); // Clear all data as requested
      setUser(null);
      setProfile(null);
    } catch (err) {
      AppLogger.error('Logout Failure:', err);
    }
  };

  const updateProfile = async (updates) => {
    if (!user) return;
    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (updateError) throw updateError;
      await fetchProfile(user.id);
      AppLogger.info('Profile updated successfully');
      return true;
    } catch (err) {
      AppLogger.error('Update Profile Failure:', err);
      throw err;
    }
  };

  return {
    user,
    profile,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated: !!user,
  };
};

export default useSupabaseAuth;
