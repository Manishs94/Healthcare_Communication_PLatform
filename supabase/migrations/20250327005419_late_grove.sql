/*
  # Create test user for development

  1. Changes
    - Creates a test user account for development
    - Sets up profile with doctor role
*/

-- Insert test user if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'test@example.com'
  ) THEN
    -- Create user in auth.users
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      raw_user_meta_data
    )
    VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'test@example.com',
      -- Password is 'password123'
      crypt('password123', gen_salt('bf')),
      now(),
      now(),
      now(),
      '{"role": "doctor", "name": "Dr. Test"}'::jsonb
    );
  END IF;
END $$;