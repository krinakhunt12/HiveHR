import { supabase, signIn, signUp, signOut, getSession } from '../lib/supabaseClient';
import { useState, useEffect } from 'react';

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
        console.log('⏰ Auth Safety Break: Forcing loading to false');
        setLoading(false);
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [loading]);

  const fetchProfile = async (userId) => {
    console.log('🔍 Fetching profile for:', userId);
    try {
      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        if (profileError.code === 'PGRST116') {
          console.log('ℹ️ No profile record found in database');
          return null;
        }
        throw profileError;
      }

      console.log('✅ Profile found:', data.role);
      setProfile(data);
      return data;
    } catch (err) {
      console.error('❌ Profile fetch failed:', err.message);
      return null;
    }
  };

  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      console.log('🚀 Initializing Auth...');
      try {
        // 1. Check current session immediately
        const { data: { session } } = await supabase.auth.getSession();

        if (isMounted) {
          if (session?.user) {
            console.log('👤 Session found:', session.user.email);
            setUser(session.user);
            await fetchProfile(session.user.id);
          } else {
            console.log('anonymous user detected');
          }
          setLoading(false);
          console.log('🏁 Initial Load Complete');
        }
      } catch (err) {
        console.error('💥 Auth Initialization Error:', err);
        if (isMounted) setLoading(false);
      }
    };

    initialize();

    // 2. Auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔔 Auth Event:', event);

        if (isMounted) {
          if (session?.user) {
            setUser(session.user);
            // Don't await here to avoid blocking the UI
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

  // Login function
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      const sessionData = await signIn(email, password);

      if (!sessionData?.user) {
        throw new Error('Login failed: No user returned');
      }

      const userProfile = await fetchProfile(sessionData.user.id);

      // Store in localStorage for legacy code compatibility
      localStorage.setItem('user', JSON.stringify({
        id: sessionData.user.id,
        email: sessionData.user.email,
        roles: [userProfile?.role || 'employee'],
      }));

      return { ...sessionData, profile: userProfile };
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (email, password, profileData) => {
    try {
      setLoading(true);
      setError(null);

      const { user } = await signUp(email, password, {
        full_name: profileData.full_name,
      });

      if (!user) throw new Error('Registration failed');

      // Create profile record
      const { error: profileError } = await supabase.from('profiles').insert([{
        id: user.id,
        email: user.email,
        ...profileData,
      }]);

      if (profileError) throw profileError;

      return user;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await signOut();
      localStorage.removeItem('user');
      setUser(null);
      setProfile(null);
    } catch (err) {
      console.error('Logout error:', err);
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
    isAuthenticated: !!user,
  };
};

export default useSupabaseAuth;
