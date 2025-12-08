import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables!');
  console.error('Please create a .env file with:');
  console.error('VITE_SUPABASE_URL=your_project_url');
  console.error('VITE_SUPABASE_ANON_KEY=your_anon_key');
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

/**
 * Sign up a new user
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {object} metadata - Additional user data (name, role, etc.)
 * @returns {Promise} - Supabase auth response
 */
export const signUp = async (email, password, metadata = {}) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata, // Stored in auth.users.raw_user_meta_data
    },
  });

  if (error) throw error;
  return data;
};

/**
 * Sign in existing user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise} - Supabase auth response
 */
export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
};

/**
 * Sign out current user
 * @returns {Promise}
 */
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

/**
 * Get current user
 * @returns {Promise} - Current user object or null
 */
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
};

/**
 * Get current session
 * @returns {Promise} - Current session or null
 */
export const getSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  return session;
};

/**
 * Reset password for email
 * @param {string} email - User email
 * @returns {Promise}
 */
export const resetPassword = async (email) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  if (error) throw error;
};

/**
 * Update user password
 * @param {string} newPassword - New password
 * @returns {Promise}
 */
export const updatePassword = async (newPassword) => {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });
  if (error) throw error;
};

// ============================================
// DATABASE HELPERS
// ============================================

/**
 * Get user profile by ID
 * @param {string} userId - User ID
 * @returns {Promise} - User profile object
 */
export const getProfile = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
};

/**
 * Update user profile
 * @param {string} userId - User ID
 * @param {object} updates - Profile fields to update
 * @returns {Promise}
 */
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

/**
 * Create a new profile (usually called after signup)
 * @param {object} profileData - Profile data
 * @returns {Promise}
 */
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

/**
 * Upload file to Supabase Storage
 * @param {File} file - File object
 * @param {string} bucket - Bucket name (default: 'employee-files')
 * @param {string} folder - Optional folder path
 * @returns {Promise} - File URL
 */
export const uploadFile = async (file, bucket = 'employee-files', folder = null) => {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
  const filePath = folder ? `${folder}/${fileName}` : `${user.id}/${fileName}`;

  // Upload file
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file);

  if (error) throw error;

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return {
    path: data.path,
    url: publicUrl,
  };
};

/**
 * Delete file from storage
 * @param {string} filePath - File path in storage
 * @param {string} bucket - Bucket name
 * @returns {Promise}
 */
export const deleteFile = async (filePath, bucket = 'employee-files') => {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([filePath]);

  if (error) throw error;
};

/**
 * Get file URL from storage
 * @param {string} filePath - File path in storage
 * @param {string} bucket - Bucket name
 * @returns {string} - Public URL
 */
export const getFileUrl = (filePath, bucket = 'employee-files') => {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return data.publicUrl;
};

// ============================================
// REALTIME HELPERS
// ============================================

/**
 * Subscribe to table changes
 * @param {string} table - Table name
 * @param {function} callback - Callback function for changes
 * @param {string} event - Event type ('INSERT', 'UPDATE', 'DELETE', '*')
 * @returns {RealtimeChannel} - Subscription object (call .unsubscribe() to stop)
 */
export const subscribeToTable = (table, callback, event = '*') => {
  return supabase
    .channel(`${table}-changes`)
    .on('postgres_changes', { event, schema: 'public', table }, callback)
    .subscribe();
};

/**
 * Subscribe to user's notifications
 * @param {string} userId - User ID
 * @param {function} callback - Callback for new notifications
 * @returns {RealtimeChannel}
 */
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

/**
 * Handle Supabase errors and return user-friendly messages
 * @param {object} error - Supabase error object
 * @returns {string} - User-friendly error message
 */
export const handleSupabaseError = (error) => {
  if (!error) return null;

  // Auth errors
  if (error.message?.includes('Invalid login credentials')) {
    return 'Invalid email or password';
  }
  if (error.message?.includes('Email not confirmed')) {
    return 'Please verify your email address';
  }
  if (error.message?.includes('User already registered')) {
    return 'An account with this email already exists';
  }

  // Database errors
  if (error.code === '23505') {
    return 'This record already exists';
  }
  if (error.code === '23503') {
    return 'Cannot delete: record is referenced elsewhere';
  }

  // Default
  return error.message || 'An unexpected error occurred';
};

// ============================================
// CONNECTION TEST
// ============================================

/**
 * Test Supabase connection
 * @returns {Promise<boolean>}
 */
export const testConnection = async () => {
  try {
    const { error } = await supabase.from('profiles').select('count').limit(1);
    if (error) throw error;
    console.log('✅ Supabase connection successful');
    return true;
  } catch (error) {
    console.error('❌ Supabase connection failed:', error.message);
    return false;
  }
};

// Log connection status in development
if (import.meta.env.DEV) {
  console.log('🔌 Supabase client initialized');
  console.log('📍 URL:', supabaseUrl);
}

export default supabase;
