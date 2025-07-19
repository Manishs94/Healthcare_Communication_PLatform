import React, { useState, useEffect } from 'react';
import { Bell, X, CheckCircle, Clock, AlertTriangle, MessageSquare, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { useAuthStore } from '../store/authStore';

interface Notification {
  id: string;
  type: 'consent_request' | 'message' | 'urgent' | 'info';
  title: string;
  message: string;
  created_at: string;
  read: boolean;
  action_url?: string;
  patient_name?: string;
  sender_name?: string;
}

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const fetchNotifications = async () => {
    // Mock notifications based on user role
    const mockNotifications: Notification[] = [];

    if (user?.role === 'poa') {
      mockNotifications.push(
        {
          id: '1',
          type: 'consent_request',
          title: 'Consent Required',
          message: 'Dr. Smith has requested consent for MRI procedure for John Johnson',
          created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
          read: false,
          patient_name: 'John Johnson',
          sender_name: 'Dr. Smith',
          action_url: '/consent/1'
        },
        {
          id: '2',
          type: 'message',
          title: 'New Message',
          message: 'Patient has been moved to recovery room and is resting comfortably',
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
          read: true,
          patient_name: 'John Johnson',
          sender_name: 'Nurse Williams'
        },
        {
          id: '3',
          type: 'urgent',
          title: 'Urgent: Response Needed',
          message: 'Emergency procedure consent required within 1 hour',
          created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
          read: false,
          patient_name: 'John Johnson',
          sender_name: 'Dr. Emergency'
        }
      );
    } else if (user?.role === 'doctor') {
      mockNotifications.push(
        {
          id: '4',
          type: 'info',
          title: 'Consent Signed',
          message: 'Sarah Johnson has signed the consent form for MRI procedure',
          created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 minutes ago
          read: false,
          patient_name: 'John Johnson',
          sender_name: 'Sarah Johnson (POA)'
        },
        {
          id: '5',
          type: 'message',
          title: 'Question from POA',
          message: 'Can you explain the risks of this procedure in more detail?',
          created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
          read: true,
          patient_name: 'Michael Chen',
          sender_name: 'Linda Chen (POA)'
        }
      );
    }

    setNotifications(mockNotifications);
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'consent_request':
        return <FileText className="h-5 w-5 text-blue-600" />;
      case 'message':
        return <MessageSquare className="h-5 w-5 text-green-600" />;
      case 'urgent':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'info':
        return <CheckCircle className="h-5 w-5 text-blue-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const getNotificationColor = (type: string, read: boolean) => {
    const baseColor = read ? 'bg-gray-50' : 'bg-white';
    const borderColor = type === 'urgent' ? 'border-l-red-500' : 'border-l-blue-500';
    return `${baseColor} ${borderColor} border-l-4`;
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-gray-500 bg-opacity-75" onClick={onClose}></div>
      <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
            {unreadCount > 0 && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                {unreadCount} new
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {notifications.length > 0 && unreadCount > 0 && (
          <div className="p-4 border-b border-gray-200">
            <button
              onClick={markAllAsRead}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Mark all as read
            </button>
          </div>
        )}

        <div className="overflow-y-auto h-full pb-20">
          {notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Notifications</h3>
              <p className="text-gray-600">You're all caught up!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 cursor-pointer ${getNotificationColor(notification.type, notification.read)}`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className={`text-sm font-medium ${notification.read ? 'text-gray-700' : 'text-gray-900'}`}>
                          {notification.title}
                        </h3>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        )}
                      </div>
                      <p className={`text-sm ${notification.read ? 'text-gray-500' : 'text-gray-700'} mb-2`}>
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div>
                          {notification.patient_name && (
                            <span>Patient: {notification.patient_name}</span>
                          )}
                          {notification.sender_name && (
                            <span className="ml-2">From: {notification.sender_name}</span>
                          )}
                        </div>
                        <span>{format(new Date(notification.created_at), 'h:mm a')}</span>
                      </div>
                      {notification.action_url && !notification.read && (
                        <button className="mt-2 text-xs text-blue-600 hover:text-blue-700 font-medium">
                          Take Action →
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;