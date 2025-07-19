import React from 'react';
import { Clock, Users, FileCheck, Database, Link, AlertCircle, MessageSquare, Shield, TrendingUp } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const Dashboard = () => {
  const user = useAuthStore((state) => state.user);

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

  const poaPendingActions = [
    {
      title: "Urgent Consent Required",
      patient: "John Johnson",
      type: "Emergency Surgery",
      deadline: "Within 30 minutes",
      priority: "urgent"
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

  const recentActivity = [
    {
      type: "consent_signed",
      message: "Consent for MRI procedure signed",
      patient: "John Johnson",
      time: "5 minutes ago"
    },
    {
      type: "message_received",
      message: "New message from Dr. Smith",
      patient: "John Johnson", 
      time: "15 minutes ago"
    }
  ];

  const currentActions = user?.role === 'poa' ? poaPendingActions : pendingActions;
  const welcomeMessage = user?.role === 'poa' 
    ? `Welcome back, ${user.name}` 
    : `Welcome back, ${user?.name}`;
  const subtitle = user?.role === 'poa'
    ? `You have ${currentActions.length} consent request${currentActions.length !== 1 ? 's' : ''} requiring attention`
    : `You have ${currentActions.length} pending action${currentActions.length !== 1 ? 's' : ''} requiring attention`;

  return (
    <div className="p-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{welcomeMessage}</h1>
        <p className="text-gray-600">{subtitle}</p>
      </header>

      {user?.role === 'poa' && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <Shield className="h-5 w-5 text-blue-600 mr-2" />
            <p className="text-blue-800 font-medium">
              All communications are HIPAA-compliant and blockchain-secured for your protection.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm text-gray-600">
                {user?.role === 'poa' ? 'Consent Requests' : 'Pending Actions'}
              </p>
              <p className="text-2xl font-semibold">{currentActions.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center">
            <MessageSquare className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm text-gray-600">
                {user?.role === 'poa' ? 'Active Conversations' : 'Active Patients'}
              </p>
              <p className="text-2xl font-semibold">{user?.role === 'poa' ? '3' : '12'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm text-gray-600">
                {user?.role === 'poa' ? 'Forms Signed Today' : 'Completed Today'}
              </p>
              <p className="text-2xl font-semibold">{user?.role === 'poa' ? '2' : '5'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {user?.role === 'poa' ? 'Consent Requests' : 'Pending Actions'}
            </h2>
            <div className="space-y-4">
              {currentActions.map((action, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">{action.title}</h3>
                    <p className="text-sm text-gray-600">Patient: {action.patient}</p>
                    <p className="text-sm text-gray-600">{action.type}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">{action.deadline}</p>
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                      action.priority === 'urgent' ? 'bg-red-100 text-red-800' : 
                      action.priority === 'high' ? 'bg-orange-100 text-orange-800' : 
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {action.priority.charAt(0).toUpperCase() + action.priority.slice(1)} Priority
                    </span>
                    {user?.role === 'poa' && (
                      <button className="block mt-2 text-xs text-blue-600 hover:text-blue-700 font-medium">
                        Review & Sign →
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {user?.role === 'poa' ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                    <div className="flex-shrink-0 mt-1">
                      {activity.type === 'consent_signed' ? (
                        <FileCheck className="h-4 w-4 text-green-600" />
                      ) : (
                        <MessageSquare className="h-4 w-4 text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                      <p className="text-xs text-gray-600">Patient: {activity.patient}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
};

export default Dashboard;