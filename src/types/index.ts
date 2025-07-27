// Integration Status Types
export type IntegrationStatus = 'connected' | 'disconnected' | 'error' | 'loading';

export interface Integration {
  id: string;
  name: string;
  description: string;
  status: IntegrationStatus;
  lastSync?: Date;
  icon: string;
  color: string;
  stats?: {
    [key: string]: number | string;
  };
}

// Linear Types
export interface LinearIssue {
  id: string;
  title: string;
  state: {
    name: string;
    type: string;
  };
  assignee?: {
    name: string;
    email: string;
  };
  priority: number;
  createdAt: string;
  updatedAt: string;
  url: string;
}

export interface LinearProject {
  id: string;
  name: string;
  description?: string;
  state: string;
  progress: number;
  startDate?: string;
  targetDate?: string;
  lead?: {
    name: string;
    email: string;
  };
  issueCount: number;
}

// Intercom Types
export interface IntercomConversation {
  id: string;
  subject?: string;
  state: 'open' | 'closed' | 'snoozed';
  priority: 'priority' | 'not_priority';
  assignee?: {
    name: string;
    email: string;
  };
  contact: {
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface IntercomContact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  lastSeen?: string;
  segments: string[];
  customAttributes: Record<string, any>;
}

// Supabase Types
export interface SupabaseTable {
  name: string;
  schema: string;
  rowCount: number;
  size: string;
  lastModified: string;
}

export interface SupabaseMetrics {
  totalRows: number;
  totalTables: number;
  databaseSize: string;
  activeConnections: number;
  queriesPerSecond: number;
}

// Blog Types
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  status: 'draft' | 'published' | 'archived';
  author: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  views: number;
  tags: string[];
}

// Website Types
export interface WebsiteMetrics {
  pageViews: number;
  uniqueVisitors: number;
  bounceRate: number;
  avgSessionDuration: number;
  topPages: Array<{
    path: string;
    views: number;
    uniqueViews: number;
  }>;
}

// CRM Types
export interface CRMContact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  status: 'lead' | 'prospect' | 'customer' | 'inactive';
  createdAt: string;
  lastActivity?: string;
  value?: number;
}

export interface CRMDeal {
  id: string;
  title: string;
  value: number;
  stage: string;
  probability: number;
  contact: CRMContact;
  expectedCloseDate?: string;
  createdAt: string;
  updatedAt: string;
}

// Dashboard Types
export interface DashboardWidget {
  id: string;
  title: string;
  type: 'metric' | 'chart' | 'list' | 'table';
  size: 'small' | 'medium' | 'large';
  data: any;
  integration: string;
}

export interface DashboardMetrics {
  totalIntegrations: number;
  activeIntegrations: number;
  totalIssues: number;
  openConversations: number;
  websiteVisitors: number;
  blogPosts: number;
  crmContacts: number;
  supabaseRows: number;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Settings Types
export interface AdminSettings {
  theme: 'light' | 'dark' | 'auto';
  notifications: {
    email: boolean;
    push: boolean;
    slack: boolean;
  };
  integrations: {
    [key: string]: {
      enabled: boolean;
      syncInterval: number;
      lastSync?: string;
    };
  };
  dashboard: {
    widgets: DashboardWidget[];
    refreshInterval: number;
  };
}
