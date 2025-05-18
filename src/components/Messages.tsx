import React, { useState } from 'react';
import { Send, Paperclip, Search } from 'lucide-react';

const Messages = () => {
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const mockConversations = [
    {
      id: '1',
      name: 'Sarah Johnson (POA)',
      lastMessage: 'Thank you for sending the consent form.',
      time: '10:30 AM',
      unread: 2,
    },
    {
      id: '2',
      name: 'Michael Chen (POA)',
      lastMessage: 'When can we schedule the follow-up?',
      time: 'Yesterday',
      unread: 0,
    },
  ];

  return (
    <div className="h-full flex">
      {/* Conversations List */}
      <div className="w-1/3 border-r border-gray-200 bg-white">
        <div className="p-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
          </div>
        </div>

        <div className="overflow-y-auto">
          {mockConversations.map((conv) => (
            <div
              key={conv.id}
              className="p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-200"
            >
              <div className="flex justify-between items-start">
                <h3 className="font-medium text-gray-900">{conv.name}</h3>
                <span className="text-sm text-gray-500">{conv.time}</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">{conv.lastMessage}</p>
              {conv.unread > 0 && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-2">
                  {conv.unread} new
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-gray-50">
        <div className="p-4 bg-white border-b border-gray-200">
          <h2 className="text-lg font-semibold">Sarah Johnson (POA)</h2>
          <p className="text-sm text-gray-600">Patient: John Johnson</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {/* Messages will go here */}
        </div>

        <div className="p-4 bg-white border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <button className="p-2 text-gray-500 hover:text-gray-600">
              <Paperclip className="h-5 w-5" />
            </button>
            <input
              type="text"
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button className="p-2 text-blue-600 hover:text-blue-700">
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;