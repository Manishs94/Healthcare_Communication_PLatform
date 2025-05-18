/*
  # Add consent forms table and blockchain integration

  1. New Tables
    - `consent_forms`
      - Stores consent form data and blockchain references
      - Links to patients and doctors
      - Tracks blockchain verification status

  2. Security
    - Enable RLS
    - Add policies for doctors and POAs
*/

-- Create consent_forms table
CREATE TABLE consent_forms (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    description text NOT NULL,
    patient_id uuid REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id uuid REFERENCES profiles(id),
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'signed', 'rejected')),
    created_at timestamptz DEFAULT now(),
    signed_at timestamptz,
    form_url text,
    contract_address text,
    transaction_hash text,
    blockchain_status text NOT NULL DEFAULT 'pending' CHECK (blockchain_status IN ('pending', 'verified', 'failed'))
);

-- Enable RLS
ALTER TABLE consent_forms ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX idx_consent_forms_patient ON consent_forms(patient_id);
CREATE INDEX idx_consent_forms_doctor ON consent_forms(doctor_id);
CREATE INDEX idx_consent_forms_status ON consent_forms(status);
CREATE INDEX idx_consent_forms_created_at ON consent_forms(created_at);

-- Create policies
CREATE POLICY "Doctors can view their patients' consent forms"
    ON consent_forms FOR SELECT
    TO authenticated
    USING (
        doctor_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM patients
            WHERE id = consent_forms.patient_id
            AND primary_doctor_id = auth.uid()
        )
    );

CREATE POLICY "POAs can view their patients' consent forms"
    ON consent_forms FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM patient_poa_links
            WHERE patient_id = consent_forms.patient_id
            AND poa_id = auth.uid()
            AND is_active = true
        )
    );

CREATE POLICY "Doctors can create consent forms"
    ON consent_forms FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND role = 'doctor'
        )
    );

CREATE POLICY "POAs can sign consent forms"
    ON consent_forms FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM patient_poa_links
            WHERE patient_id = consent_forms.patient_id
            AND poa_id = auth.uid()
            AND is_active = true
        )
    )
    WITH CHECK (
        status = 'signed'
        AND signed_at IS NOT NULL
    );

-- Create trigger for updated_at
CREATE TRIGGER set_consent_forms_updated_at
    BEFORE UPDATE ON consent_forms
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();