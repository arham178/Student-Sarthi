
-- Add new columns to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS father_name text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS mother_name text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS address text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS pincode text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS aadhaar_last4 text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bank_account_last4 text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS ifsc_code text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bank_name text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS institution_name text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_percentage numeric;

-- Add validation trigger for aadhaar_last4 and bank_account_last4
CREATE OR REPLACE FUNCTION public.validate_profile_sensitive_fields()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.aadhaar_last4 IS NOT NULL AND length(NEW.aadhaar_last4) > 4 THEN
    RAISE EXCEPTION 'aadhaar_last4 must be at most 4 characters';
  END IF;
  IF NEW.bank_account_last4 IS NOT NULL AND length(NEW.bank_account_last4) > 4 THEN
    RAISE EXCEPTION 'bank_account_last4 must be at most 4 characters';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER validate_profile_sensitive_fields_trigger
BEFORE INSERT OR UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.validate_profile_sensitive_fields();

-- Attach the update_updated_at trigger to profiles (it was defined but not attached)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_profiles_updated_at') THEN
    CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- Storage policies for user-documents bucket
CREATE POLICY "Users can upload own documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'user-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view own documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'user-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own documents"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'user-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
