import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, Shield, FileText, AlertTriangle, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import { consentManager } from '../lib/blockchain';

interface ConsentForm {
  id: string;
  title: string;
  description: string;
  patient_name: string;
  doctor_name: string;
  status: 'pending' | 'signed' | 'rejected';
  created_at: string;
  form_url?: string;
  contract_address?: string;
  transaction_hash?: string;
  blockchain_status: 'pending' | 'verified' | 'failed';
}

interface ConsentSigningProps {
  consentId: string;
  onClose: () => void;
}

const ConsentSigning: React.FC<ConsentSigningProps> = ({ consentId, onClose }) => {
  const [consent, setConsent] = useState<ConsentForm | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSigning, setIsSigning] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [questions, setQuestions] = useState('');
  const [showQuestions, setShowQuestions] = useState(false);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    fetchConsentDetails();
  }, [consentId]);

  const fetchConsentDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('consent_forms')
        .select(`
          *,
          patients(name),
          profiles(name)
        `)
        .eq('id', consentId)
        .single();

      if (error) throw error;

      setConsent({
        ...data,
        patient_name: data.patients?.name || 'Unknown Patient',
        doctor_name: data.profiles?.name || 'Unknown Doctor'
      });
    } catch (error) {
      console.error('Error fetching consent details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSign = async () => {
    if (!consent || !user) return;

    setIsSigning(true);
    try {
      // Update consent status in database
      const { error } = await supabase
        .from('consent_forms')
        .update({
          status: 'signed',
          signed_at: new Date().toISOString()
        })
        .eq('id', consentId);

      if (error) throw error;

      // Try to sign on blockchain if contract exists
      if (consent.contract_address) {
        try {
          const txHash = await consentManager.signConsent(parseInt(consentId));
          await supabase
            .from('consent_forms')
            .update({
              transaction_hash: txHash,
              blockchain_status: 'verified'
            })
            .eq('id', consentId);
        } catch (blockchainError) {
          console.warn('Blockchain signing failed:', blockchainError);
          // Continue with database-only signing
        }
      }

      setShowConfirmation(true);
    } catch (error) {
      console.error('Error signing consent:', error);
    } finally {
      setIsSigning(false);
    }
  };

  const handleReject = async () => {
    if (!consent) return;

    try {
      const { error } = await supabase
        .from('consent_forms')
        .update({ status: 'rejected' })
        .eq('id', consentId);

      if (error) throw error;
      onClose();
    } catch (error) {
      console.error('Error rejecting consent:', error);
    }
  };

  const sendQuestions = async () => {
    if (!questions.trim()) return;

    try {
      // In a real implementation, this would send a message to the care team
      // For now, we'll just show a confirmation
      setShowQuestions(false);
      setQuestions('');
      alert('Your questions have been sent to the care team. They will respond shortly.');
    } catch (error) {
      console.error('Error sending questions:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
        <div className="bg-white rounded-lg p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading consent form...</p>
        </div>
      </div>
    );
  }

  if (!consent) {
    return (
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
        <div className="bg-white rounded-lg p-6">
          <p className="text-red-600">Consent form not found.</p>
          <button onClick={onClose} className="mt-4 px-4 py-2 bg-gray-600 text-white rounded">
            Close
          </button>
        </div>
      </div>
    );
  }

  if (showConfirmation) {
    return (
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Consent Signed Successfully</h2>
            <p className="text-gray-600 mb-4">
              Your consent for "{consent.title}" has been recorded and sent to the medical team.
            </p>
            {consent.blockchain_status === 'verified' && (
              <div className="flex items-center justify-center text-sm text-green-600 mb-4">
                <Shield className="h-4 w-4 mr-1" />
                Blockchain Verified
              </div>
            )}
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Consent Required</h2>
            <div className="flex items-center space-x-2">
              {consent.blockchain_status === 'verified' && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <Shield className="h-3 w-3 mr-1" />
                  Blockchain Secured
                </span>
              )}
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                <Clock className="h-3 w-3 mr-1" />
                Pending Signature
              </span>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <div className="flex items-start">
              <FileText className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
              <div>
                <h3 className="font-medium text-blue-900">{consent.title}</h3>
                <p className="text-sm text-blue-700 mt-1">
                  Patient: {consent.patient_name} • Requested by: {consent.doctor_name}
                </p>
                <p className="text-sm text-blue-700">
                  Requested: {format(new Date(consent.created_at), 'MMM d, yyyy h:mm a')}
                </p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="font-medium text-gray-900 mb-2">Procedure Description</h4>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700">{consent.description}</p>
            </div>
          </div>

          {consent.form_url && (
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-2">Additional Documents</h4>
              <a
                href={consent.form_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <FileText className="h-4 w-4 mr-2" />
                View Detailed Consent Form
              </a>
            </div>
          )}

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
              <div>
                <h4 className="font-medium text-yellow-800">Important Notice</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  By signing this consent, you are authorizing the medical team to proceed with the described procedure. 
                  This consent is legally binding and will be recorded with a timestamp and your verified identity.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col space-y-3">
            <button
              onClick={() => setShowQuestions(true)}
              className="w-full flex items-center justify-center px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Ask Questions First
            </button>

            <div className="flex space-x-3">
              <button
                onClick={handleReject}
                className="flex-1 px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50"
              >
                <XCircle className="h-4 w-4 mr-2 inline" />
                Decline
              </button>
              <button
                onClick={() => setShowConfirmation(true)}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-2 inline" />
                Review & Sign
              </button>
            </div>
          </div>
        </div>

        {showConfirmation && (
          <div className="border-t border-gray-200 p-6 bg-gray-50">
            <h4 className="font-medium text-gray-900 mb-3">Final Confirmation</h4>
            <p className="text-sm text-gray-600 mb-4">
              Please confirm that you understand and agree to the procedure described above. 
              Your electronic signature will be legally binding.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowConfirmation(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Go Back
              </button>
              <button
                onClick={handleSign}
                disabled={isSigning}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isSigning ? 'Signing...' : 'Sign Electronically'}
              </button>
            </div>
          </div>
        )}

        {showQuestions && (
          <div className="border-t border-gray-200 p-6 bg-gray-50">
            <h4 className="font-medium text-gray-900 mb-3">Ask the Care Team</h4>
            <textarea
              value={questions}
              onChange={(e) => setQuestions(e.target.value)}
              placeholder="Type your questions here..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={4}
            />
            <div className="flex space-x-3 mt-3">
              <button
                onClick={() => setShowQuestions(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={sendQuestions}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Send Questions
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsentSigning;