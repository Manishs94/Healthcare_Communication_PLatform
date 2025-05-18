import React from 'react';
import { Clock, Users, FileCheck, Database, Link, AlertCircle } from 'lucide-react';

const Dashboard = () => {
  const pendingActions = [
    {
      title: "Consent Form Required",
      patient: "Sarah Johnson",
      type: "MRI Procedure",
      deadline: "Today, 5:00 PM",
      priority: "high"
    },
    {
      title: "Treatment Plan Review",
      patient: "Michael Chen",
      type: "Physical Therapy",
      deadline: "Tomorrow, 2:00 PM",
      priority: "medium"
    }
  ];

  const connectedSystems = [
    {
      name: "Epic Systems",
      status: "connected",
      lastSync: "5 minutes ago",
      recordsCount: 1420
    },
    {
      name: "Cerner",
      status: "syncing",
      lastSync: "in progress",
      recordsCount: 892
    },
    {
      name: "Meditech",
      status: "error",
      lastSync: "1 hour ago",
      recordsCount: 645
    }
  ];

  return (
    <div className="p-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, Dr. Smith</h1>
        <p className="text-gray-600">You have 2 pending actions requiring attention</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm text-gray-600">Pending Actions</p>
              <p className="text-2xl font-semibold">8</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm text-gray-600">Active Patients</p>
              <p className="text-2xl font-semibold">12</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center">
            <FileCheck className="h-8 w-8 text-purple-500" />
            <div className="ml-4">
              <p className="text-sm text-gray-600">Completed Today</p>
              <p className="text-2xl font-semibold">5</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Pending Actions</h2>
            <div className="space-y-4">
              {pendingActions.map((action, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">{action.title}</h3>
                    <p className="text-sm text-gray-600">Patient: {action.patient}</p>
                    <p className="text-sm text-gray-600">{action.type}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">{action.deadline}</p>
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                      action.priority === 'high' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {action.priority.charAt(0).toUpperCase() + action.priority.slice(1)} Priority
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Connected EHR Systems</h2>
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center">
                <Link className="h-4 w-4 mr-1" />
                Connect New System
              </button>
            </div>
            <div className="space-y-4">
              {connectedSystems.map((system, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center">
                    <Database className="h-5 w-5 text-gray-500" />
                    <div className="ml-3">
                      <h3 className="font-medium text-gray-900">{system.name}</h3>
                      <p className="text-sm text-gray-600">
                        {system.recordsCount.toLocaleString()} records • Last sync: {system.lastSync}
                      </p>
                    </div>
                  </div>
                  <div>
                    {system.status === 'connected' && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Connected
                      </span>
                    )}
                    {system.status === 'syncing' && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Syncing...
                      </span>
                    )}
                    {system.status === 'error' && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Error
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;