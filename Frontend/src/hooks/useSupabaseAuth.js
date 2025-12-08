import { supabase, signIn, signUp, signOut, getCurrentUser, getSession } from '../lib/supabaseClient';
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

  // Check for existing session on mount
  useEffect(() => {
    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event);
        
        if (session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Check current user
  const checkUser = async () => {
    try {
      const session = await getSession();
      
      if (session?.user) {
        setUser(session.user);
        await fetchProfile(session.user.id);
      }
    } catch (err) {
      console.error('Error checking user:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch user profile from profiles table
  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  };

  // Login function
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await signIn(email, password);
      
      // Store user in localStorage for compatibility with existing code
      localStorage.setItem('user', JSON.stringify({
        id: data.user.id,
        email: data.user.email,
        roles: [profile?.role || 'employee'], // Will be updated when profile loads
      }));
      
      return data;
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
      
      // Sign up user
      const { user } = await signUp(email, password, {
        full_name: profileData.full_name,
      });

      // Create profile
      await supabase.from('profiles').insert([{
        id: user.id,
        email: user.email,
        ...profileData,
      }]);

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
      setError(err.message);
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
    isAuthenticated: !!user,
  };
};

export default useSupabaseAuth;
