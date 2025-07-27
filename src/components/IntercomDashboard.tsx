import { useState, useEffect } from 'react';
import { MessageCircle, Users, Clock, AlertCircle, CheckCircle, UserPlus } from 'lucide-react';
import type { IntercomConversation, IntercomContact } from '../types';

interface IntercomMetrics {
  totalConversations: number;
  openConversations: number;
  closedConversations: number;
  unassignedConversations: number;
  priorityConversations: number;
  totalContacts: number;
  totalTeammates: number;
  avgResponseTime: string;
  firstResponseTime: string;
  recentConversations: IntercomConversation[];
  recentContacts: IntercomContact[];
}

export default function IntercomDashboard() {
  const [metrics, setMetrics] = useState<IntercomMetrics | null>(null);
  const [conversations, setConversations] = useState<IntercomConversation[]>([]);
  const [contacts, setContacts] = useState<IntercomContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'conversations' | 'contacts'>('overview');

  useEffect(() => {
    fetchMetrics();
    fetchConversations();
    fetchContacts();
  }, []);

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/intercom/metrics');
      const result = await response.json();
      
      if (result.success) {
        setMetrics(result.data);
      } else {
        setError(result.error || 'Failed to fetch metrics');
      }
    } catch (err) {
      setError('Failed to connect to Intercom');
    }
  };

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/intercom/conversations?limit=10');
      const result = await response.json();
      
      if (result.success) {
        setConversations(result.data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchContacts = async () => {
    try {
      const response = await fetch('/api/intercom/contacts?limit=10');
      const result = await response.json();
      
      if (result.success) {
        setContacts(result.data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch contacts:', err);
    }
  };

  const handleConversationAction = async (conversationId: string, action: string, adminId?: string, message?: string) => {
    try {
      const response = await fetch('/api/intercom/conversations', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId,
          action,
          adminId,
          message
        })
      });

      const result = await response.json();
      
      if (result.success) {
        // Refresh conversations
        fetchConversations();
        fetchMetrics();
      } else {
        setError(result.error || 'Failed to perform action');
      }
    } catch (err) {
      setError('Failed to perform action');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStateColor = (state: string) => {
    switch (state) {
      case 'open': return 'text-green-600 bg-green-100';
      case 'closed': return 'text-gray-600 bg-gray-100';
      case 'snoozed': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    return priority === 'priority' ? 'text-red-600 bg-red-100' : 'text-gray-600 bg-gray-100';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-card p-6">
        <div className="flex items-center text-red-600">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Intercom Management</h1>
          <p className="text-gray-600">Manage conversations, contacts, and customer support</p>
        </div>
        <div className="integration-status status-connected">
          <CheckCircle className="w-4 h-4" />
          Connected
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', name: 'Overview', icon: MessageCircle },
            { id: 'conversations', name: 'Conversations', icon: MessageCircle },
            { id: 'contacts', name: 'Contacts', icon: Users }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center px-1 py-4 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && metrics && (
        <div className="space-y-6">
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="admin-card p-6">
              <div className="flex items-center">
                <MessageCircle className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Conversations</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics.totalConversations}</p>
                </div>
              </div>
            </div>

            <div className="admin-card p-6">
              <div className="flex items-center">
                <AlertCircle className="w-8 h-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Open Conversations</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics.openConversations}</p>
                </div>
              </div>
            </div>

            <div className="admin-card p-6">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Contacts</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics.totalContacts}</p>
                </div>
              </div>
            </div>

            <div className="admin-card p-6">
              <div className="flex items-center">
                <Clock className="w-8 h-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics.avgResponseTime}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Conversations */}
            <div className="admin-card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Conversations</h3>
              <div className="space-y-4">
                {metrics.recentConversations.map((conversation) => (
                  <div key={conversation.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {conversation.subject || 'No Subject'}
                      </p>
                      <p className="text-sm text-gray-600">
                        From: {conversation.contact.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(conversation.updatedAt)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStateColor(conversation.state)}`}>
                        {conversation.state}
                      </span>
                      {conversation.priority === 'priority' && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(conversation.priority)}`}>
                          Priority
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Contacts */}
            <div className="admin-card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Contacts</h3>
              <div className="space-y-4">
                {metrics.recentContacts.map((contact) => (
                  <div key={contact.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{contact.name}</p>
                      <p className="text-sm text-gray-600">{contact.email}</p>
                      {contact.lastSeen && (
                        <p className="text-xs text-gray-500">
                          Last seen: {formatDate(contact.lastSeen)}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {contact.segments.length > 0 && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          {contact.segments[0]}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Conversations Tab */}
      {activeTab === 'conversations' && (
        <div className="admin-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Conversations</h3>
            <div className="flex space-x-2">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Refresh
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    State
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assignee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Updated
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {conversations.map((conversation) => (
                  <tr key={conversation.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {conversation.subject || 'No Subject'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{conversation.contact.name}</div>
                      <div className="text-sm text-gray-500">{conversation.contact.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStateColor(conversation.state)}`}>
                        {conversation.state}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {conversation.assignee?.name || 'Unassigned'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(conversation.updatedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {conversation.state === 'open' && (
                          <button
                            onClick={() => handleConversationAction(conversation.id, 'close')}
                            className="text-red-600 hover:text-red-900"
                          >
                            Close
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Contacts Tab */}
      {activeTab === 'contacts' && (
        <div className="admin-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Contacts</h3>
            <div className="flex space-x-2">
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center">
                <UserPlus className="w-4 h-4 mr-2" />
                Add Contact
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Segments
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Seen
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {contacts.map((contact) => (
                  <tr key={contact.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{contact.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{contact.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-1">
                        {contact.segments.slice(0, 2).map((segment, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                            {segment}
                          </span>
                        ))}
                        {contact.segments.length > 2 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
                            +{contact.segments.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {contact.lastSeen ? formatDate(contact.lastSeen) : 'Never'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
