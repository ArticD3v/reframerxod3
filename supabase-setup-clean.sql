-- ===================================
-- Clean Setup Script for Supabase
-- ===================================

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.users;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.users;
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON public.users;

-- Drop trigger and function if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create users table (if not exists)
CREATE TABLE IF NOT EXISTS public.users (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email text NOT NULL,
  status text CHECK (status IN ('pending', 'active', 'banned')) DEFAULT 'pending',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies (using auth.jwt() for admin check)
CREATE POLICY "Users can view their own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.users FOR SELECT
  USING ((auth.jwt() ->> 'email') = 'admin@zorvexra.com');

CREATE POLICY "Admins can update all profiles"
  ON public.users FOR UPDATE
  USING ((auth.jwt() ->> 'email') = 'admin@zorvexra.com');

CREATE POLICY "Allow insert for authenticated users"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create function to handle new user signup
CREATE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, status, created_at)
  VALUES (
    new.id,
    new.email,
    CASE 
      WHEN new.email = 'admin@zorvexra.com' THEN 'active'
      ELSE 'pending'
    END,
    now()
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create user profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.users TO anon, authenticated;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Database setup completed successfully!';
END $$;
