import React, { useState } from 'react';
import { Plus, Search, Filter, FileText, CheckCircle, XCircle, Clock, Shield, Link as LinkIcon, X } from 'lucide-react';
import { format } from 'date-fns';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import { consentManager } from '../lib/blockchain';

interface NewConsentForm {
  title: string;
  description: string;
  patientId: string;
  procedureType: string;
}

const ConsentForms = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewFormModal, setShowNewFormModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [patients, setPatients] = useState<Array<{ id: string; name: string; mrn: string }>>([]);
  const [newForm, setNewForm] = useState<NewConsentForm>({
    title: '',
    description: '',
    patientId: '',
    procedureType: '',
  });

  const user = useAuthStore((state) => state.user);

  // Fetch patients when modal opens
  const fetchPatients = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('id, name, mrn')
        .eq('primary_doctor_id', user?.id);

      if (error) throw error;
      setPatients(data || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const handleCreateConsent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    try {
      // Create consent on blockchain
      const transactionHash = await consentManager.createConsent(
        newForm.patientId,
        newForm.procedureType,
        newForm.description
      );

      // Store consent form in database
      const { error } = await supabase.from('consent_forms').insert({
        title: newForm.title,
        description: newForm.description,
        patient_id: newForm.patientId,
        doctor_id: user.id,
        status: 'pending',
        transaction_hash: transactionHash,
        blockchain_status: 'pending'
      });

      if (error) throw error;

      // Reset form and close modal
      setNewForm({
        title: '',
        description: '',
        patientId: '',
        procedureType: '',
      });
      setShowNewFormModal(false);
    } catch (error) {
      console.error('Error creating consent form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const mockForms = [
    {
      id: '1',
      title: 'MRI Procedure Consent',
      patient: 'John Johnson',
      poa: 'Sarah Johnson',
      status: 'pending',
      created: '2024-03-10',
      contractAddress: '0x1234...5678',
      blockchainStatus: 'verified'
    },
    {
      id: '2',
      title: 'Physical Therapy Authorization',
      patient: 'Michael Chen',
      poa: 'Linda Chen',
      status: 'signed',
      created: '2024-03-09',
      contractAddress: '0x8765...4321',
      blockchainStatus: 'verified'
    },
  ];

  const getStatusBadge = (status: string, blockchainStatus: string) => {
    const badges = [];

    // Contract Status Badge
    if (blockchainStatus === 'verified') {
      badges.push(
        <span key="blockchain" className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 mr-2">
          <Shield className="h-3 w-3 mr-1" />
          Blockchain Verified
        </span>
      );
    }

    // Form Status Badge
    switch (status) {
      case 'pending':
        badges.push(
          <span key="status" className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </span>
        );
        break;
      case 'signed':
        badges.push(
          <span key="status" className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Signed
          </span>
        );
        break;
      case 'rejected':
        badges.push(
          <span key="status" className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </span>
        );
        break;
      default:
        return null;
    }

    return <div className="flex items-center">{badges}</div>;
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Consent Forms</h1>
        <button 
          onClick={() => {
            setShowNewFormModal(true);
            fetchPatients();
          }}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Consent Form
        </button>
      </div>

      <div className="mb-6 flex space-x-4">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search forms by patient name or type..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
        </div>
        <button className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Form
                </th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  POA
                </th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contract
                </th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 bg-gray-50"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {mockForms.map((form) => (
                <tr key={form.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-900">{form.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {form.patient}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {form.poa}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(form.status, form.blockchainStatus)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm">
                      <LinkIcon className="h-4 w-4 text-gray-400 mr-1" />
                      <span className="font-mono text-gray-500">{form.contractAddress}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(form.created), 'MMM d, yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Form Modal */}
      {showNewFormModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">New Consent Form</h2>
              <button
                onClick={() => setShowNewFormModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateConsent}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={newForm.title}
                    onChange={(e) => setNewForm({ ...newForm, title: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="patient" className="block text-sm font-medium text-gray-700">
                    Patient
                  </label>
                  <select
                    id="patient"
                    value={newForm.patientId}
                    onChange={(e) => setNewForm({ ...newForm, patientId: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select a patient</option>
                    {patients.map((patient) => (
                      <option key={patient.id} value={patient.id}>
                        {patient.name} (MRN: {patient.mrn})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="procedureType" className="block text-sm font-medium text-gray-700">
                    Procedure Type
                  </label>
                  <input
                    type="text"
                    id="procedureType"
                    value={newForm.procedureType}
                    onChange={(e) => setNewForm({ ...newForm, procedureType: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    id="description"
                    rows={4}
                    value={newForm.description}
                    onChange={(e) => setNewForm({ ...newForm, description: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowNewFormModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Create Contract'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsentForms;