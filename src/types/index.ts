export interface User {
  id: string;
  email: string;
  role: 'doctor' | 'poa' | 'nurse' | 'admin';
  name: string;
  avatar_url?: string;
}

export interface Patient {
  id: string;
  name: string;
  dob: string;
  mrn: string;
  gender: string;
  poa_id: string[];
  primary_doctor_id: string;
}

export interface ConsentForm {
  id: string;
  title: string;
  description: string;
  patient_id: string;
  doctor_id: string;
  status: 'pending' | 'signed' | 'rejected';
  created_at: string;
  signed_at?: string;
  form_url: string;
  contract_address?: string;
  transaction_hash?: string;
  blockchain_status: 'pending' | 'verified' | 'failed';
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  read: boolean;
  attachments?: {
    name: string;
    url: string;
    type: string;
  }[];
}

export interface TreatmentPlan {
  id: string;
  patient_id: string;
  doctor_id: string;
  title: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected' | 'in_progress' | 'completed';
  created_at: string;
  updated_at: string;
  procedures: {
    name: string;
    description: string;
    scheduled_date?: string;
    status: 'pending' | 'completed' | 'cancelled';
  }[];
}

export interface BlockchainConsent {
  id: number;
  patientId: string;
  procedureType: string;
  description: string;
  status: boolean;
  transactionHash: string;
}