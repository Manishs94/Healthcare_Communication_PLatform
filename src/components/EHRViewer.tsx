import React, { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import EHRRecord from './EHRRecord';

const mockPatientRecord = {
  demographics: {
    name: "Sarah Johnson",
    dob: "1985-03-15",
    gender: "Female",
    mrn: "MRN-2024-001"
  },
  vitals: {
    bp: "120/80 mmHg",
    temp: "98.6°F",
    pulse: "72 bpm",
    weight: "145 lbs"
  },
  medications: [
    {
      name: "Lisinopril",
      dosage: "10mg",
      frequency: "Once daily",
      startDate: "2023-12-01"
    },
    {
      name: "Metformin",
      dosage: "500mg",
      frequency: "Twice daily",
      startDate: "2023-11-15"
    }
  ],
  allergies: ["Penicillin", "Sulfa Drugs", "Latex"],
  conditions: [
    {
      name: "Type 2 Diabetes",
      status: "Active",
      diagnosedDate: "2023-10-01"
    },
    {
      name: "Hypertension",
      status: "Controlled",
      diagnosedDate: "2023-09-15"
    }
  ]
};

const EHRViewer: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Electronic Health Records</h1>
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Filter className="h-4 w-4 mr-2" />
            Filter Records
          </button>
        </div>
        <div className="mt-4 relative">
          <input
            type="text"
            placeholder="Search records by patient name, MRN, or condition..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
        </div>
      </div>

      <EHRRecord patientId="1" record={mockPatientRecord} />
    </div>
  );
};

export default EHRViewer;