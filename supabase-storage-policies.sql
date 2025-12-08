-- ============================================
-- STORAGE BUCKET POLICIES FOR SUPABASE
-- ============================================
-- Run this in Supabase SQL Editor after creating storage buckets

-- ============================================
-- STEP 1: Create Storage Bucket (Do in UI or SQL)
-- ============================================
-- Go to Storage in Supabase Dashboard
-- Create a bucket named: employee-files
-- Settings: Private bucket, 50MB file size limit

-- OR run this SQL:
INSERT INTO storage.buckets (id, name, public)
VALUES ('employee-files', 'employee-files', false);

-- ============================================
-- STEP 2: Storage Policies for employee-files bucket
-- ============================================

-- Policy 1: Users can upload files to their own folder
CREATE POLICY "Users can upload to own folder"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'employee-files'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 2: Users can view their own files
CREATE POLICY "Users can view own files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'employee-files'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 3: Users can update their own files
CREATE POLICY "Users can update own files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'employee-files'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 4: Users can delete their own files
CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'employee-files'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 5: HR/Admins can view all files
CREATE POLICY "HR can view all files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'employee-files'
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'hr')
  )
);

-- Policy 6: Shared files can be accessed
CREATE POLICY "Users can view shared files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'employee-files'
  AND EXISTS (
    SELECT 1 FROM files
    WHERE file_url LIKE '%' || name || '%'
    AND (
      is_public = true
      OR auth.uid() = ANY(shared_with)
      OR auth.uid() = user_id
    )
  )
);

-- ============================================
-- OPTIONAL: Public Documents Bucket
-- ============================================
-- For company policies, handbooks, announcements etc.

INSERT INTO storage.buckets (id, name, public)
VALUES ('public-documents', 'public-documents', true);

-- Everyone can read public documents
CREATE POLICY "Public documents are viewable by all"
ON storage.objects FOR SELECT
USING (bucket_id = 'public-documents');

-- Only HR/Admins can upload public documents
CREATE POLICY "HR can upload public documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'public-documents'
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'hr')
  )
);

-- ============================================
-- STORAGE HELPER FUNCTIONS
-- ============================================

-- Function to get file path for user
CREATE OR REPLACE FUNCTION get_user_file_path(file_name TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN auth.uid()::text || '/' || file_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to validate file size (50MB limit)
CREATE OR REPLACE FUNCTION validate_file_size()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.file_size > 52428800 THEN -- 50MB in bytes
    RAISE EXCEPTION 'File size exceeds 50MB limit';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_file_size_trigger
BEFORE INSERT ON files
FOR EACH ROW EXECUTE FUNCTION validate_file_size();

-- ============================================
-- FILE UPLOAD EXAMPLE
-- ============================================

/*
In your JavaScript frontend, use this pattern:

// Upload file to Supabase Storage
const uploadFile = async (file) => {
  const userId = supabase.auth.user().id;
  const filePath = `${userId}/${Date.now()}_${file.name}`;
  
  const { data, error } = await supabase.storage
    .from('employee-files')
    .upload(filePath, file);
    
  if (error) throw error;
  
  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('employee-files')
    .getPublicUrl(filePath);
    
  // Save metadata to files table
  await supabase.from('files').insert({
    file_name: file.name,
    file_type: file.type,
    file_size: file.size,
    file_url: publicUrl,
    category: 'resume',
    uploaded_by: userId,
    user_id: userId
  });
  
  return publicUrl;
};
*/

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '✅ Storage policies created successfully!';
  RAISE NOTICE '📁 Bucket: employee-files';
  RAISE NOTICE '📋 Next step: Configure frontend Supabase client';
END $$;
