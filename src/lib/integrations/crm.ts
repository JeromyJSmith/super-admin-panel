import { PrismaClient } from '../generated/prisma';
import type { 
  Client, 
  Contact, 
  Deal, 
  Document, 
  ChatSession, 
  ChatMessage,
  ClientStatus,
  DealStatus,
  Priority,
  DocumentStatus,
  ChatStatus,
  MessageRole
} from '../generated/prisma';

export class CRMService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  // Client Management
  async createClient(data: {
    name: string;
    email: string;
    phone?: string;
    company?: string;
    status?: ClientStatus;
    tags?: string[];
    notes?: string;
  }) {
    return await this.prisma.client.create({
      data: {
        ...data,
        tags: JSON.stringify(data.tags || [])
      },
      include: {
        contacts: true,
        deals: true,
        documents: true,
        chatSessions: true
      }
    });
  }

  async getClients(params?: {
    status?: ClientStatus;
    search?: string;
    limit?: number;
    offset?: number;
  }) {
    const where: any = {};
    
    if (params?.status) {
      where.status = params.status;
    }
    
    if (params?.search) {
      where.OR = [
        { name: { contains: params.search } },
        { email: { contains: params.search } },
        { company: { contains: params.search } }
      ];
    }

    return await this.prisma.client.findMany({
      where,
      include: {
        contacts: true,
        deals: true,
        documents: true,
        chatSessions: true
      },
      take: params?.limit || 50,
      skip: params?.offset || 0,
      orderBy: { createdAt: 'desc' }
    });
  }

  async getClientById(id: string) {
    const client = await this.prisma.client.findUnique({
      where: { id },
      include: {
        contacts: true,
        deals: true,
        documents: true,
        chatSessions: {
          include: {
            messages: true
          }
        }
      }
    });
    
    if (client) {
      return {
        ...client,
        tags: JSON.parse(client.tags)
      };
    }
    
    return null;
  }

  async updateClient(id: string, data: Partial<{
    name: string;
    email: string;
    phone: string;
    company: string;
    status: ClientStatus;
    tags: string[];
    notes: string;
  }>) {
    const updateData: any = { ...data };
    if (data.tags) {
      updateData.tags = JSON.stringify(data.tags);
    }
    
    return await this.prisma.client.update({
      where: { id },
      data: updateData,
      include: {
        contacts: true,
        deals: true,
        documents: true,
        chatSessions: true
      }
    });
  }

  async deleteClient(id: string) {
    return await this.prisma.client.delete({
      where: { id }
    });
  }

  // Contact Management
  async createContact(data: {
    clientId: string;
    name: string;
    email: string;
    phone?: string;
    role?: string;
    isPrimary?: boolean;
  }) {
    return await this.prisma.contact.create({
      data,
      include: {
        client: true
      }
    });
  }

  // Deal Management
  async createDeal(data: {
    clientId: string;
    title: string;
    description?: string;
    value?: number;
    status?: DealStatus;
    priority?: Priority;
    closeDate?: Date;
  }) {
    return await this.prisma.deal.create({
      data,
      include: {
        client: true
      }
    });
  }

  async getDeals(params?: {
    clientId?: string;
    status?: DealStatus;
    priority?: Priority;
    limit?: number;
    offset?: number;
  }) {
    const where: any = {};
    
    if (params?.clientId) where.clientId = params.clientId;
    if (params?.status) where.status = params.status;
    if (params?.priority) where.priority = params.priority;

    return await this.prisma.deal.findMany({
      where,
      include: {
        client: true
      },
      take: params?.limit || 50,
      skip: params?.offset || 0,
      orderBy: { createdAt: 'desc' }
    });
  }

  // Document Management
  async createDocument(data: {
    clientId: string;
    filename: string;
    originalName: string;
    fileSize: number;
    mimeType: string;
    filePath: string;
    description?: string;
    tags?: string[];
    uploadedBy: string;
  }) {
    return await this.prisma.document.create({
      data: {
        ...data,
        tags: JSON.stringify(data.tags || [])
      },
      include: {
        client: true
      }
    });
  }

  async getDocuments(params?: {
    clientId?: string;
    status?: DocumentStatus;
    limit?: number;
    offset?: number;
  }) {
    const where: any = {};
    
    if (params?.clientId) where.clientId = params.clientId;
    if (params?.status) where.status = params.status;

    return await this.prisma.document.findMany({
      where,
      include: {
        client: true
      },
      take: params?.limit || 50,
      skip: params?.offset || 0,
      orderBy: { createdAt: 'desc' }
    });
  }

  async deleteDocument(id: string) {
    return await this.prisma.document.update({
      where: { id },
      data: { status: 'DELETED' }
    });
  }

  // Chat Management
  async createChatSession(data: {
    clientId: string;
    title?: string;
  }) {
    return await this.prisma.chatSession.create({
      data,
      include: {
        client: true,
        messages: true
      }
    });
  }

  async addChatMessage(data: {
    chatSessionId: string;
    content: string;
    role: MessageRole;
    metadata?: string;
  }) {
    return await this.prisma.chatMessage.create({
      data,
      include: {
        chatSession: {
          include: {
            client: true
          }
        }
      }
    });
  }

  async getChatSessions(params?: {
    clientId?: string;
    status?: ChatStatus;
    limit?: number;
    offset?: number;
  }) {
    const where: any = {};
    
    if (params?.clientId) where.clientId = params.clientId;
    if (params?.status) where.status = params.status;

    return await this.prisma.chatSession.findMany({
      where,
      include: {
        client: true,
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      },
      take: params?.limit || 50,
      skip: params?.offset || 0,
      orderBy: { updatedAt: 'desc' }
    });
  }

  async getChatSessionById(id: string) {
    return await this.prisma.chatSession.findUnique({
      where: { id },
      include: {
        client: true,
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });
  }

  // Analytics and Metrics
  async getClientMetrics() {
    const [totalClients, activeClients, prospects, totalDeals, openDeals, wonDeals, totalDocuments] = await Promise.all([
      this.prisma.client.count(),
      this.prisma.client.count({ where: { status: 'ACTIVE' } }),
      this.prisma.client.count({ where: { status: 'PROSPECT' } }),
      this.prisma.deal.count(),
      this.prisma.deal.count({ where: { status: 'OPEN' } }),
      this.prisma.deal.count({ where: { status: 'WON' } }),
      this.prisma.document.count({ where: { status: 'ACTIVE' } })
    ]);

    const totalDealValue = await this.prisma.deal.aggregate({
      _sum: { value: true },
      where: { status: 'WON' }
    });

    return {
      clients: {
        total: totalClients,
        active: activeClients,
        prospects: prospects,
        inactive: totalClients - activeClients - prospects
      },
      deals: {
        total: totalDeals,
        open: openDeals,
        won: wonDeals,
        lost: totalDeals - openDeals - wonDeals,
        totalValue: totalDealValue._sum.value || 0
      },
      documents: {
        total: totalDocuments
      }
    };
  }

  async disconnect() {
    await this.prisma.$disconnect();
  }
}

export const crmService = new CRMService();
