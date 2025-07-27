import axios, { type AxiosInstance } from 'axios';
import type { IntercomConversation, IntercomContact, ApiResponse, PaginatedResponse } from '../../types';

const intercomAccessToken = import.meta.env.INTERCOM_ACCESS_TOKEN;

export class IntercomService {
  private client: AxiosInstance;

  constructor() {
    if (!intercomAccessToken) {
      throw new Error('Intercom access token is required');
    }

    this.client = axios.create({
      baseURL: 'https://api.intercom.io',
      headers: {
        'Authorization': `Bearer ${intercomAccessToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Intercom-Version': '2.11'
      }
    });
  }

  async testConnection(): Promise<ApiResponse<boolean>> {
    try {
      const response = await this.client.get('/me');
      return { success: true, data: !!response.data };
    } catch (error) {
      console.error('Intercom connection test failed:', error);
      return { success: false, error: 'Failed to connect to Intercom' };
    }
  }

  async getConversations(page = 1, limit = 50): Promise<ApiResponse<PaginatedResponse<IntercomConversation>>> {
    try {
      const response = await this.client.get('/conversations', {
        params: {
          per_page: limit,
          page: page,
          order: 'desc',
          sort: 'updated_at'
        }
      });

      const conversations: IntercomConversation[] = response.data.conversations.map((conv: any) => ({
        id: conv.id,
        subject: conv.source?.subject || undefined,
        state: conv.state,
        priority: conv.priority ? 'priority' : 'not_priority',
        assignee: conv.assignee ? {
          name: conv.assignee.name,
          email: conv.assignee.email
        } : undefined,
        contact: {
          name: conv.contacts?.contacts?.[0]?.name || 'Unknown',
          email: conv.contacts?.contacts?.[0]?.email || 'unknown@example.com'
        },
        createdAt: new Date(conv.created_at * 1000).toISOString(),
        updatedAt: new Date(conv.updated_at * 1000).toISOString()
      }));

      return {
        success: true,
        data: {
          data: conversations,
          total: response.data.total_count || conversations.length,
          page,
          limit,
          hasNext: response.data.pages?.next !== null,
          hasPrev: page > 1
        }
      };
    } catch (error) {
      console.error('Failed to fetch Intercom conversations:', error);
      return { success: false, error: 'Failed to fetch conversations' };
    }
  }

  async getContacts(page = 1, limit = 50): Promise<ApiResponse<PaginatedResponse<IntercomContact>>> {
    try {
      const response = await this.client.get('/contacts', {
        params: {
          per_page: limit,
          page: page
        }
      });

      const contacts: IntercomContact[] = response.data.data.map((contact: any) => ({
        id: contact.id,
        name: contact.name || 'Unknown',
        email: contact.email || '',
        phone: contact.phone || undefined,
        lastSeen: contact.last_seen_at ? new Date(contact.last_seen_at * 1000).toISOString() : undefined,
        segments: contact.segments?.data?.map((seg: any) => seg.name) || [],
        customAttributes: contact.custom_attributes || {}
      }));

      return {
        success: true,
        data: {
          data: contacts,
          total: response.data.total_count || contacts.length,
          page,
          limit,
          hasNext: response.data.pages?.next !== null,
          hasPrev: page > 1
        }
      };
    } catch (error) {
      console.error('Failed to fetch Intercom contacts:', error);
      return { success: false, error: 'Failed to fetch contacts' };
    }
  }

  async getOpenConversations(): Promise<ApiResponse<IntercomConversation[]>> {
    try {
      const response = await this.client.get('/conversations', {
        params: {
          state: 'open',
          per_page: 100,
          order: 'desc',
          sort: 'updated_at'
        }
      });

      const conversations: IntercomConversation[] = response.data.conversations.map((conv: any) => ({
        id: conv.id,
        subject: conv.source?.subject || undefined,
        state: conv.state,
        priority: conv.priority ? 'priority' : 'not_priority',
        assignee: conv.assignee ? {
          name: conv.assignee.name,
          email: conv.assignee.email
        } : undefined,
        contact: {
          name: conv.contacts?.contacts?.[0]?.name || 'Unknown',
          email: conv.contacts?.contacts?.[0]?.email || 'unknown@example.com'
        },
        createdAt: new Date(conv.created_at * 1000).toISOString(),
        updatedAt: new Date(conv.updated_at * 1000).toISOString()
      }));

      return { success: true, data: conversations };
    } catch (error) {
      console.error('Failed to fetch open conversations:', error);
      return { success: false, error: 'Failed to fetch open conversations' };
    }
  }

  async getUnassignedConversations(): Promise<ApiResponse<IntercomConversation[]>> {
    try {
      const response = await this.client.get('/conversations', {
        params: {
          state: 'open',
          assigned: false,
          per_page: 100,
          order: 'desc',
          sort: 'updated_at'
        }
      });

      const conversations: IntercomConversation[] = response.data.conversations.map((conv: any) => ({
        id: conv.id,
        subject: conv.source?.subject || undefined,
        state: conv.state,
        priority: conv.priority ? 'priority' : 'not_priority',
        assignee: undefined,
        contact: {
          name: conv.contacts?.contacts?.[0]?.name || 'Unknown',
          email: conv.contacts?.contacts?.[0]?.email || 'unknown@example.com'
        },
        createdAt: new Date(conv.created_at * 1000).toISOString(),
        updatedAt: new Date(conv.updated_at * 1000).toISOString()
      }));

      return { success: true, data: conversations };
    } catch (error) {
      console.error('Failed to fetch unassigned conversations:', error);
      return { success: false, error: 'Failed to fetch unassigned conversations' };
    }
  }

  async getConversationById(conversationId: string): Promise<ApiResponse<IntercomConversation>> {
    try {
      const response = await this.client.get(`/conversations/${conversationId}`);
      const conv = response.data;

      const conversation: IntercomConversation = {
        id: conv.id,
        subject: conv.source?.subject || undefined,
        state: conv.state,
        priority: conv.priority ? 'priority' : 'not_priority',
        assignee: conv.assignee ? {
          name: conv.assignee.name,
          email: conv.assignee.email
        } : undefined,
        contact: {
          name: conv.contacts?.contacts?.[0]?.name || 'Unknown',
          email: conv.contacts?.contacts?.[0]?.email || 'unknown@example.com'
        },
        createdAt: new Date(conv.created_at * 1000).toISOString(),
        updatedAt: new Date(conv.updated_at * 1000).toISOString()
      };

      return { success: true, data: conversation };
    } catch (error) {
      console.error('Failed to fetch conversation:', error);
      return { success: false, error: 'Failed to fetch conversation' };
    }
  }

  async searchContacts(query: string): Promise<ApiResponse<IntercomContact[]>> {
    try {
      const response = await this.client.post('/contacts/search', {
        query: {
          operator: 'OR',
          value: [
            {
              field: 'name',
              operator: '~',
              value: query
            },
            {
              field: 'email',
              operator: '~',
              value: query
            }
          ]
        }
      });

      const contacts: IntercomContact[] = response.data.data.map((contact: any) => ({
        id: contact.id,
        name: contact.name || 'Unknown',
        email: contact.email || '',
        phone: contact.phone || undefined,
        lastSeen: contact.last_seen_at ? new Date(contact.last_seen_at * 1000).toISOString() : undefined,
        segments: contact.segments?.data?.map((seg: any) => seg.name) || [],
        customAttributes: contact.custom_attributes || {}
      }));

      return { success: true, data: contacts };
    } catch (error) {
      console.error('Failed to search contacts:', error);
      return { success: false, error: 'Failed to search contacts' };
    }
  }

  async getTeammates(): Promise<ApiResponse<any[]>> {
    try {
      const response = await this.client.get('/admins');
      return { success: true, data: response.data.admins || [] };
    } catch (error) {
      console.error('Failed to fetch teammates:', error);
      return { success: false, error: 'Failed to fetch teammates' };
    }
  }

  async assignConversation(conversationId: string, adminId: string): Promise<ApiResponse<boolean>> {
    try {
      await this.client.put(`/conversations/${conversationId}`, {
        assignee_id: adminId
      });
      return { success: true, data: true };
    } catch (error) {
      console.error('Failed to assign conversation:', error);
      return { success: false, error: 'Failed to assign conversation' };
    }
  }

  async closeConversation(conversationId: string): Promise<ApiResponse<boolean>> {
    try {
      await this.client.put(`/conversations/${conversationId}`, {
        state: 'closed'
      });
      return { success: true, data: true };
    } catch (error) {
      console.error('Failed to close conversation:', error);
      return { success: false, error: 'Failed to close conversation' };
    }
  }

  async replyToConversation(conversationId: string, message: string, type: 'comment' | 'note' = 'comment'): Promise<ApiResponse<boolean>> {
    try {
      await this.client.post(`/conversations/${conversationId}/reply`, {
        message_type: type,
        type: 'admin',
        body: message
      });
      return { success: true, data: true };
    } catch (error) {
      console.error('Failed to reply to conversation:', error);
      return { success: false, error: 'Failed to reply to conversation' };
    }
  }

  async getMetrics(): Promise<ApiResponse<any>> {
    try {
      const [conversationsResponse, contactsResponse, teammatesResponse] = await Promise.all([
        this.getConversations(1, 100),
        this.getContacts(1, 100),
        this.getTeammates()
      ]);

      if (!conversationsResponse.success || !contactsResponse.success || !teammatesResponse.success) {
        return { success: false, error: 'Failed to fetch metrics data' };
      }

      const conversations = conversationsResponse.data?.data || [];
      const contacts = contactsResponse.data?.data || [];
      const teammates = teammatesResponse.data || [];

      const openConversations = conversations.filter(conv => conv.state === 'open').length;
      const closedConversations = conversations.filter(conv => conv.state === 'closed').length;
      const unassignedConversations = conversations.filter(conv => !conv.assignee).length;
      const priorityConversations = conversations.filter(conv => conv.priority === 'priority').length;

      // Calculate response time metrics (mock data - would need conversation parts for real data)
      const avgResponseTime = '2.5 hours';
      const firstResponseTime = '45 minutes';

      return {
        success: true,
        data: {
          totalConversations: conversations.length,
          openConversations,
          closedConversations,
          unassignedConversations,
          priorityConversations,
          totalContacts: contacts.length,
          totalTeammates: teammates.length,
          avgResponseTime,
          firstResponseTime,
          // Recent activity
          recentConversations: conversations.slice(0, 5),
          recentContacts: contacts.slice(0, 5)
        }
      };
    } catch (error) {
      console.error('Failed to fetch Intercom metrics:', error);
      return { success: false, error: 'Failed to fetch Intercom metrics' };
    }
  }

  async getInboxes(): Promise<ApiResponse<any[]>> {
    try {
      const response = await this.client.get('/inboxes');
      return { success: true, data: response.data.data || [] };
    } catch (error) {
      console.error('Failed to fetch inboxes:', error);
      return { success: false, error: 'Failed to fetch inboxes' };
    }
  }

  async getTags(): Promise<ApiResponse<any[]>> {
    try {
      const response = await this.client.get('/tags');
      return { success: true, data: response.data.data || [] };
    } catch (error) {
      console.error('Failed to fetch tags:', error);
      return { success: false, error: 'Failed to fetch tags' };
    }
  }

  async tagConversation(conversationId: string, tagId: string): Promise<ApiResponse<boolean>> {
    try {
      await this.client.post(`/conversations/${conversationId}/tags`, {
        id: tagId
      });
      return { success: true, data: true };
    } catch (error) {
      console.error('Failed to tag conversation:', error);
      return { success: false, error: 'Failed to tag conversation' };
    }
  }

  async createContact(name: string, email: string, customAttributes?: Record<string, any>): Promise<ApiResponse<IntercomContact>> {
    try {
      const response = await this.client.post('/contacts', {
        name,
        email,
        custom_attributes: customAttributes || {}
      });

      const contact: IntercomContact = {
        id: response.data.id,
        name: response.data.name || 'Unknown',
        email: response.data.email || '',
        phone: response.data.phone || undefined,
        lastSeen: response.data.last_seen_at ? new Date(response.data.last_seen_at * 1000).toISOString() : undefined,
        segments: response.data.segments?.data?.map((seg: any) => seg.name) || [],
        customAttributes: response.data.custom_attributes || {}
      };

      return { success: true, data: contact };
    } catch (error) {
      console.error('Failed to create contact:', error);
      return { success: false, error: 'Failed to create contact' };
    }
  }
}
