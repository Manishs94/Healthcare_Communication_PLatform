/*
  # Initial schema setup for healthcare platform

  1. New Tables
    - `profiles`
      - Extends auth.users with additional user information
      - Stores role and name for each user
    - `patients`
      - Stores patient information
      - Links to POAs and primary doctor
    - `patient_poa_links`
      - Links patients with their POAs
      - Includes relationship type and status

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Restrict access based on user roles
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('doctor', 'poa', 'nurse', 'admin')),
  name text NOT NULL,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create patients table
CREATE TABLE IF NOT EXISTS patients (
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
CREATE TABLE IF NOT EXISTS patient_poa_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES patients(id) ON DELETE CASCADE,
  poa_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  relationship text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(patient_id, poa_id)
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_poa_links ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Patients policies
CREATE POLICY "Doctors can view their patients"
  ON patients
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'doctor'
      AND (
        primary_doctor_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM patient_poa_links
          WHERE patient_id = patients.id
          AND poa_id = auth.uid()
          AND is_active = true
        )
      )
    )
  );

CREATE POLICY "POAs can view their linked patients"
  ON patients
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM patient_poa_links
      WHERE patient_id = patients.id
      AND poa_id = auth.uid()
      AND is_active = true
    )
  );

-- Patient-POA links policies
CREATE POLICY "Users can view their patient links"
  ON patient_poa_links
  FOR SELECT
  TO authenticated
  USING (
    poa_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM patients
      WHERE id = patient_poa_links.patient_id
      AND primary_doctor_id = auth.uid()
    )
  );

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, role, name)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'role', 'poa'),
    COALESCE(new.raw_user_meta_data->>'name', new.email)
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();