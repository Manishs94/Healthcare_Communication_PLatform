import React from 'react';
import { FileText, Calendar, Activity, Clipboard, Pill as Pills, AlertTriangle } from 'lucide-react';

interface EHRRecordProps {
  patientId: string;
  record: {
    demographics: {
      name: string;
      dob: string;
      gender: string;
      mrn: string;
    };
    vitals: {
      bp: string;
      temp: string;
      pulse: string;
      weight: string;
    };
    medications: Array<{
      name: string;
      dosage: string;
      frequency: string;
      startDate: string;
    }>;
    allergies: string[];
    conditions: Array<{
      name: string;
      status: string;
      diagnosedDate: string;
    }>;
  };
}

const EHRRecord: React.FC<EHRRecordProps> = ({ patientId, record }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="border-b border-gray-200 pb-4 mb-4">
        <h2 className="text-xl font-semibold text-gray-900">{record.demographics.name}</h2>
        <div className="mt-2 flex items-center text-sm text-gray-600">
          <Calendar className="h-4 w-4 mr-2" />
          <span>DOB: {record.demographics.dob}</span>
          <span className="mx-2">•</span>
          <span>MRN: {record.demographics.mrn}</span>
          <span className="mx-2">•</span>
          <span>Gender: {record.demographics.gender}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-blue-900 flex items-center">
              <Activity className="h-4 w-4 mr-2" />
              Vital Signs
            </h3>
            <div className="mt-2 space-y-2 text-sm">
              <p>Blood Pressure: {record.vitals.bp}</p>
              <p>Temperature: {record.vitals.temp}</p>
              <p>Pulse: {record.vitals.pulse}</p>
              <p>Weight: {record.vitals.weight}</p>
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-medium text-purple-900 flex items-center">
              <Clipboard className="h-4 w-4 mr-2" />
              Active Conditions
            </h3>
            <div className="mt-2 space-y-2">
              {record.conditions.map((condition, index) => (
                <div key={index} className="text-sm">
                  <p className="font-medium text-purple-900">{condition.name}</p>
                  <p className="text-purple-700">
                    Status: {condition.status} • Diagnosed: {condition.diagnosedDate}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-medium text-green-900 flex items-center">
              <Pills className="h-4 w-4 mr-2" />
              Current Medications
            </h3>
            <div className="mt-2 space-y-3">
              {record.medications.map((med, index) => (
                <div key={index} className="text-sm">
                  <p className="font-medium text-green-900">{med.name}</p>
                  <p className="text-green-700">
                    {med.dosage} • {med.frequency}
                    <br />
                    Started: {med.startDate}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-red-50 p-4 rounded-lg">
            <h3 className="font-medium text-red-900 flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Allergies
            </h3>
            <div className="mt-2">
              {record.allergies.map((allergy, index) => (
                <span
                  key={index}
                  className="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full mr-2 mb-2"
                >
                  {allergy}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EHRRecord;