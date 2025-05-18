/*
  # Fix database schema and authentication

  1. Changes
    - Drop and recreate tables with proper constraints
    - Add policies for authenticated users
    - Create test user with proper role and password
    - Add indexes for performance
    - Enable RLS on all tables

  2. Security
    - Set up proper RLS policies
    - Add policies for profile access
    - Ensure proper role constraints
*/

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Ensure we're in the public schema
SET search_path TO public;

-- Drop existing objects to ensure clean slate
DROP TABLE IF EXISTS patient_poa_links CASCADE;
DROP TABLE IF EXISTS patients CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Create profiles table
CREATE TABLE profiles (
    id uuid PRIMARY KEY,
    role text NOT NULL,
    name text NOT NULL,
    avatar_url text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE,
    CONSTRAINT profiles_role_check CHECK (role IN ('doctor', 'poa', 'nurse', 'admin'))
);

-- Create patients table
CREATE TABLE patients (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    mrn text UNIQUE NOT NULL,
    name text NOT NULL,
    dob date NOT NULL,
    gender text NOT NULL,
    primary_doctor_id uuid REFERENCES profiles(id),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create patient-POA linking table
CREATE TABLE patient_poa_links (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id uuid REFERENCES patients(id) ON DELETE CASCADE,
    poa_id uuid REFERENCES profiles(id),
    relationship text NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(patient_id, poa_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at);
CREATE INDEX IF NOT EXISTS idx_patients_mrn ON patients(mrn);
CREATE INDEX IF NOT EXISTS idx_patients_primary_doctor ON patients(primary_doctor_id);
CREATE INDEX IF NOT EXISTS idx_patient_poa_links_patient ON patient_poa_links(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_poa_links_poa ON patient_poa_links(poa_id);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_poa_links ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile"
    ON profiles FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id);

-- Create policies for patients
CREATE POLICY "POAs can view their linked patients"
    ON patients FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM patient_poa_links
            WHERE patient_poa_links.patient_id = patients.id
            AND patient_poa_links.poa_id = auth.uid()
            AND patient_poa_links.is_active = true
        )
    );

-- Create policies for patient_poa_links
CREATE POLICY "Users can view their patient links"
    ON patient_poa_links FOR SELECT
    TO authenticated
    USING (
        poa_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM patients
            WHERE id = patient_poa_links.patient_id
            AND primary_doctor_id = auth.uid()
        )
    );

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER set_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_patients_updated_at
    BEFORE UPDATE ON patients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_patient_poa_links_updated_at
    BEFORE UPDATE ON patient_poa_links
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, role, name)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'role', 'poa'),
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.email)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- Insert test user if it doesn't exist
DO $$
DECLARE
    test_user_id uuid;
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM auth.users WHERE email = 'test@example.com'
    ) THEN
        -- Generate a UUID for the test user
        test_user_id := gen_random_uuid();
        
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
            raw_user_meta_data,
            confirmation_token
        )
        VALUES (
            '00000000-0000-0000-0000-000000000000',
            test_user_id,
            'authenticated',
            'authenticated',
            'test@example.com',
            crypt('password123', gen_salt('bf')),
            now(),
            now(),
            now(),
            '{"role": "doctor", "name": "Dr. Test"}'::jsonb,
            'CONFIRMED'
        );

        -- Ensure profile exists
        INSERT INTO public.profiles (id, role, name)
        VALUES (
            test_user_id,
            'doctor',
            'Dr. Test'
        )
        ON CONFLICT (id) DO NOTHING;
    END IF;
END $$;