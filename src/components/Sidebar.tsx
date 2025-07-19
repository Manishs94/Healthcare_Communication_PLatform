import React from 'react';
import { MessageSquare, FileText, ClipboardCheck, Bell, UserCog, Database, Users, Activity, Shield, BarChart3 } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const Sidebar = () => {
  const location = useLocation();
  const user = useAuthStore((state) => state.user);

  const menuItems = [
    { icon: BarChart3, label: 'Dashboard', path: '/', roles: ['doctor', 'poa', 'nurse', 'admin'] },
    { icon: MessageSquare, label: 'Messages', path: '/messages', roles: ['doctor', 'poa', 'nurse'] },
    { icon: FileText, label: 'Consent Forms', path: '/consent-forms', roles: ['doctor', 'poa'] },
    { icon: ClipboardCheck, label: 'Treatment Plans', path: '/treatment-plans', roles: ['doctor', 'nurse'] },
    { icon: Database, label: 'EHR Records', path: '/ehr', roles: ['doctor', 'nurse'] },
    { icon: Shield, label: 'Audit Trail', path: '/audit', roles: ['admin', 'doctor'] },
    { icon: UserCog, label: 'Settings', path: '/settings', roles: ['doctor', 'poa', 'nurse', 'admin'] },
  ];

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(user?.role || '')
  );

  return (
    <div className="w-64 bg-white border-r border-gray-200 px-3 py-4">
      <div className="flex items-center mb-8 px-2">
        <MessageSquare className="h-8 w-8 text-blue-600" />
        <h1 className="ml-2 text-xl font-bold text-gray-800">MEDRelay</h1>
      </div>
      
      <nav>
        {filteredMenuItems.map((item, index) => {
          const isActive = location.pathname === item.path;
          return (
          <Link
            key={index}
            to={item.path}
            className={`w-full flex items-center px-2 py-2 mb-1 rounded-lg transition-colors ${
              isActive 
                ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-600' 
                : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
            }`}
          >
            <item.icon className="h-5 w-5" />
            <span className="ml-3">{item.label}</span>
          </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;