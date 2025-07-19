import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, Shield, Clock, User, FileText, MessageSquare, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';

interface AuditEvent {
  id: string;
  event_type: 'consent_created' | 'consent_signed' | 'consent_rejected' | 'message_sent' | 'user_login';
  user_id: string;
  user_name: string;
  user_role: string;
  patient_id?: string;
  patient_name?: string;
  description: string;
  metadata: any;
  created_at: string;
  ip_address?: string;
  blockchain_hash?: string;
}

const AuditTrail: React.FC = () => {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    fetchAuditEvents();
  }, []);

  const fetchAuditEvents = async () => {
    try {
      // In a real implementation, this would fetch from an audit_events table
      // For now, we'll create mock data based on existing consent forms
      const { data: consents, error } = await supabase
        .from('consent_forms')
        .select(`
          *,
          patients(name),
          profiles(name, role)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mockEvents: AuditEvent[] = [];

      consents?.forEach((consent) => {
        // Consent creation event
        mockEvents.push({
          id: `${consent.id}_created`,
          event_type: 'consent_created',
          user_id: consent.doctor_id,
          user_name: consent.profiles?.name || 'Unknown Doctor',
          user_role: consent.profiles?.role || 'doctor',
          patient_id: consent.patient_id,
          patient_name: consent.patients?.name || 'Unknown Patient',
          description: `Created consent form: ${consent.title}`,
          metadata: {
            consent_id: consent.id,
            title: consent.title,
            blockchain_status: consent.blockchain_status
          },
          created_at: consent.created_at,
          ip_address: '192.168.1.100',
          blockchain_hash: consent.transaction_hash
        });

        // Consent signing event (if signed)
        if (consent.status === 'signed' && consent.signed_at) {
          mockEvents.push({
            id: `${consent.id}_signed`,
            event_type: 'consent_signed',
            user_id: 'poa_user_id', // In real implementation, this would be the actual POA user ID
            user_name: 'POA User',
            user_role: 'poa',
            patient_id: consent.patient_id,
            patient_name: consent.patients?.name || 'Unknown Patient',
            description: `Signed consent form: ${consent.title}`,
            metadata: {
              consent_id: consent.id,
              title: consent.title,
              blockchain_verified: consent.blockchain_status === 'verified'
            },
            created_at: consent.signed_at,
            ip_address: '192.168.1.101',
            blockchain_hash: consent.transaction_hash
          });
        }
      });

      // Add some mock login events
      mockEvents.push({
        id: 'login_1',
        event_type: 'user_login',
        user_id: user?.id || '',
        user_name: user?.name || 'Current User',
        user_role: user?.role || 'doctor',
        description: 'User logged into MEDRelay platform',
        metadata: { login_method: 'email_password' },
        created_at: new Date().toISOString(),
        ip_address: '192.168.1.100'
      });

      setEvents(mockEvents.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
    } catch (error) {
      console.error('Error fetching audit events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'consent_created':
        return <FileText className="h-5 w-5 text-blue-600" />;
      case 'consent_signed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'consent_rejected':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'message_sent':
        return <MessageSquare className="h-5 w-5 text-purple-600" />;
      case 'user_login':
        return <User className="h-5 w-5 text-gray-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const getEventColor = (eventType: string) => {
    switch (eventType) {
      case 'consent_created':
        return 'bg-blue-50 border-blue-200';
      case 'consent_signed':
        return 'bg-green-50 border-green-200';
      case 'consent_rejected':
        return 'bg-red-50 border-red-200';
      case 'message_sent':
        return 'bg-purple-50 border-purple-200';
      case 'user_login':
        return 'bg-gray-50 border-gray-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const exportAuditLog = () => {
    const csvContent = [
      ['Timestamp', 'Event Type', 'User', 'Role', 'Patient', 'Description', 'IP Address', 'Blockchain Hash'].join(','),
      ...events.map(event => [
        format(new Date(event.created_at), 'yyyy-MM-dd HH:mm:ss'),
        event.event_type,
        event.user_name,
        event.user_role,
        event.patient_name || '',
        event.description,
        event.ip_address || '',
        event.blockchain_hash || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `medrelay_audit_log_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = searchTerm === '' || 
      event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (event.patient_name && event.patient_name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = filterType === 'all' || event.event_type === filterType;
    
    return matchesSearch && matchesType;
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Audit Trail</h1>
        <button
          onClick={exportAuditLog}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Download className="h-4 w-4 mr-2" />
          Export Log
        </button>
      </div>

      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search events..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
        </div>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">All Events</option>
          <option value="consent_created">Consent Created</option>
          <option value="consent_signed">Consent Signed</option>
          <option value="consent_rejected">Consent Rejected</option>
          <option value="message_sent">Message Sent</option>
          <option value="user_login">User Login</option>
        </select>

        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-gray-400" />
          <span className="text-sm text-gray-600">{filteredEvents.length} events</span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">System Activity Log</h2>
          <p className="text-sm text-gray-600">Complete audit trail of all platform activities</p>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredEvents.map((event) => (
            <div key={event.id} className={`p-4 ${getEventColor(event.event_type)} border-l-4`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {getEventIcon(event.event_type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-sm font-medium text-gray-900">{event.description}</h3>
                      {event.blockchain_hash && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          <Shield className="h-3 w-3 mr-1" />
                          Blockchain
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-600 space-y-1">
                      <div className="flex items-center space-x-4">
                        <span>User: {event.user_name} ({event.user_role})</span>
                        {event.patient_name && <span>Patient: {event.patient_name}</span>}
                        {event.ip_address && <span>IP: {event.ip_address}</span>}
                      </div>
                      {event.blockchain_hash && (
                        <div className="font-mono text-xs">
                          Tx: {event.blockchain_hash}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-900">
                    {format(new Date(event.created_at), 'MMM d, yyyy')}
                  </div>
                  <div className="text-xs text-gray-600">
                    {format(new Date(event.created_at), 'h:mm a')}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredEvents.length === 0 && (
          <div className="p-8 text-center">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Events Found</h3>
            <p className="text-gray-600">No audit events match your current filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditTrail;