import React from 'react';
import { MessageSquare, FileText, ClipboardCheck, Bell, UserCog, Database, Users, Activity } from 'lucide-react';

const Sidebar = () => {
  const menuItems = [
    { icon: MessageSquare, label: 'Messages' },
    { icon: FileText, label: 'Consent Forms' },
    { icon: ClipboardCheck, label: 'Treatment Plans' },
    { icon: Database, label: 'EHR Records' },
    { icon: Activity, label: 'Telehealth' },
    { icon: Users, label: 'Patient Portal' },
    { icon: Bell, label: 'Notifications' },
    { icon: UserCog, label: 'Settings' },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 px-3 py-4">
      <div className="flex items-center mb-8 px-2">
        <MessageSquare className="h-8 w-8 text-blue-600" />
        <h1 className="ml-2 text-xl font-bold text-gray-800">MedConnect</h1>
      </div>
      
      <nav>
        {menuItems.map((item, index) => (
          <button
            key={index}
            className="w-full flex items-center px-2 py-2 mb-1 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors"
          >
            <item.icon className="h-5 w-5" />
            <span className="ml-3">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;