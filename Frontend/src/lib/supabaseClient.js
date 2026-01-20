import { createClient } from '@supabase/supabase-js';
import AppLogger from '../utils/AppLogger';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  AppLogger.error('Missing Supabase environment variables!');
  throw new Error('Missing Supabase configuration');
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'x-application-name': 'HiveHR',
    },
  },
});

// ============================================
// AUTH HELPERS
// ============================================

export const signUp = async (email, password, metadata = {}) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata,
    },
  });

  if (error) throw error;
  return data;
};

export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
};

export const getSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  return session;
};

export const resetPassword = async (email) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  if (error) throw error;
};

export const updatePassword = async (newPassword) => {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });
  if (error) throw error;
};

// ============================================
// DATABASE HELPERS
// ============================================

export const getProfile = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
};

export const updateProfile = async (userId, updates) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const createProfile = async (profileData) => {
  const { data, error } = await supabase
    .from('profiles')
    .insert([profileData])
    .select()
    .single();

  if (error) throw error;
  return data;
};

// ============================================
// STORAGE HELPERS
// ============================================

export const uploadFile = async (file, bucket = 'employee-files', folder = null) => {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
  const filePath = folder ? `${folder}/${fileName}` : `${user.id}/${fileName}`;

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file);

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return {
    path: data.path,
    url: publicUrl,
  };
};

export const deleteFile = async (filePath, bucket = 'employee-files') => {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([filePath]);

  if (error) throw error;
};

export const getFileUrl = (filePath, bucket = 'employee-files') => {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return data.publicUrl;
};

// ============================================
// REALTIME HELPERS
// ============================================

export const subscribeToTable = (table, callback, event = '*') => {
  return supabase
    .channel(`${table}-changes`)
    .on('postgres_changes', { event, schema: 'public', table }, callback)
    .subscribe();
};

export const subscribeToNotifications = (userId, callback) => {
  return supabase
    .channel('notifications')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      },
      callback
    )
    .subscribe();
};

// ============================================
// ERROR HANDLING HELPER
// ============================================

export const handleSupabaseError = (error) => {
  if (!error) return null;

  if (error.message?.includes('Invalid login credentials')) {
    return 'Invalid email or password';
  }
  if (error.message?.includes('Email not confirmed')) {
    return 'Please verify your email address';
  }
  if (error.message?.includes('User already registered')) {
    return 'An account with this email already exists';
  }

  if (error.code === '23505') {
    return 'This record already exists';
  }
  if (error.code === '23503') {
    return 'Cannot delete: record is referenced elsewhere';
  }

  return error.message || 'An unexpected error occurred';
};

// ============================================
// CONNECTION TEST
// ============================================

export const testConnection = async () => {
  try {
    const { error } = await supabase.from('profiles').select('count').limit(1);
    if (error) throw error;
    AppLogger.info('Supabase connection verified successfully');
    return true;
  } catch (error) {
    AppLogger.error('Supabase connection synchronization failure', error.message);
    return false;
  }
};

// Log connection status in development
if (import.meta.env.DEV) {
  AppLogger.info('Supabase client initialized');
}

export default supabase;
