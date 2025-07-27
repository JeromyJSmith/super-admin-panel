import OpenAI from 'openai';
import type { Client, Document, Deal } from '../generated/prisma';

export class OpenAIService {
  private openai: OpenAI;
  
  constructor() {
    const apiKey = import.meta.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OpenAI API key is required');
    }
    
    this.openai = new OpenAI({
      apiKey: apiKey,
    });
  }

  async generateChatResponse(
    messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
    clientContext?: {
      client: Client & {
        contacts?: any[];
        deals?: Deal[];
        documents?: Document[];
      };
      recentDocuments?: Document[];
    }
  ) {
    try {
      // Build system message with client context
      let systemMessage = `You are a helpful AI assistant for a CRM system. You help manage client relationships and provide insights based on client data.`;
      
      if (clientContext?.client) {
        const { client } = clientContext;
        systemMessage += `\n\nCurrent client context:
- Name: ${client.name}
- Email: ${client.email}
- Company: ${client.company || 'N/A'}
- Status: ${client.status}
- Phone: ${client.phone || 'N/A'}
- Notes: ${client.notes || 'No notes available'}
- Tags: ${JSON.parse(client.tags || '[]').join(', ') || 'No tags'}`;

        if (client.deals && client.deals.length > 0) {
          systemMessage += `\n\nActive deals:`;
          client.deals.forEach(deal => {
            systemMessage += `\n- ${deal.title}: $${deal.value || 0} (${deal.status})`;
          });
        }

        if (client.contacts && client.contacts.length > 0) {
          systemMessage += `\n\nContacts:`;
          client.contacts.forEach(contact => {
            systemMessage += `\n- ${contact.name} (${contact.email}) - ${contact.role || 'N/A'}`;
          });
        }

        if (clientContext.recentDocuments && clientContext.recentDocuments.length > 0) {
          systemMessage += `\n\nRecent documents:`;
          clientContext.recentDocuments.forEach(doc => {
            systemMessage += `\n- ${doc.originalName} (${doc.mimeType}) - ${doc.description || 'No description'}`;
          });
        }
      }

      systemMessage += `\n\nPlease provide helpful, professional responses. If asked about specific client data that isn't provided in the context, let the user know you'd need access to that information.`;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemMessage },
          ...messages
        ],
        max_tokens: 1000,
        temperature: 0.7,
      });

      return {
        content: completion.choices[0]?.message?.content || '',
        usage: completion.usage,
        model: completion.model
      };
    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw new Error('Failed to generate AI response');
    }
  }

  async generateClientSummary(client: Client & {
    contacts?: any[];
    deals?: Deal[];
    documents?: Document[];
    chatSessions?: any[];
  }) {
    try {
      const prompt = `Please generate a professional client summary based on the following information:

Client: ${client.name}
Email: ${client.email}
Company: ${client.company || 'N/A'}
Status: ${client.status}
Phone: ${client.phone || 'N/A'}
Tags: ${JSON.parse(client.tags || '[]').join(', ') || 'No tags'}
Notes: ${client.notes || 'No notes available'}

Deals (${client.deals?.length || 0}):
${client.deals?.map(deal => `- ${deal.title}: $${deal.value || 0} (${deal.status})`).join('\n') || 'No deals'}

Contacts (${client.contacts?.length || 0}):
${client.contacts?.map(contact => `- ${contact.name} (${contact.email}) - ${contact.role || 'N/A'}`).join('\n') || 'No contacts'}

Documents: ${client.documents?.length || 0} files uploaded
Chat Sessions: ${client.chatSessions?.length || 0} conversations

Please provide a concise but comprehensive summary highlighting key information, relationship status, business opportunities, and any notable insights.`;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "user", content: prompt }
        ],
        max_tokens: 500,
        temperature: 0.5,
      });

      return completion.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw new Error('Failed to generate client summary');
    }
  }

  async generateDealInsights(deals: Deal[], clientName: string) {
    try {
      const dealsInfo = deals.map(deal => 
        `${deal.title}: $${deal.value || 0} (${deal.status}) - Priority: ${deal.priority}`
      ).join('\n');

      const prompt = `Analyze the following deals for client "${clientName}" and provide insights:

${dealsInfo}

Please provide:
1. Overall deal pipeline health
2. Revenue potential analysis
3. Risk assessment
4. Recommended next steps
5. Priority focus areas

Keep the analysis concise and actionable.`;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "user", content: prompt }
        ],
        max_tokens: 600,
        temperature: 0.6,
      });

      return completion.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw new Error('Failed to generate deal insights');
    }
  }

  async generateDocumentSummary(documents: Document[]) {
    try {
      const docsInfo = documents.map(doc => 
        `${doc.originalName} (${doc.mimeType}) - ${doc.description || 'No description'} - Uploaded: ${doc.createdAt}`
      ).join('\n');

      const prompt = `Analyze the following documents and provide a summary:

${docsInfo}

Please provide:
1. Document categorization
2. Key themes or patterns
3. Completeness assessment
4. Suggested organization improvements
5. Missing document types that might be valuable

Keep the summary concise and practical.`;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "user", content: prompt }
        ],
        max_tokens: 400,
        temperature: 0.6,
      });

      return completion.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw new Error('Failed to generate document summary');
    }
  }

  async suggestNextActions(client: Client & {
    contacts?: any[];
    deals?: Deal[];
    documents?: Document[];
  }) {
    try {
      const clientInfo = `
Client: ${client.name} (${client.status})
Company: ${client.company || 'N/A'}
Last Updated: ${client.updatedAt}
Active Deals: ${client.deals?.filter(d => d.status === 'OPEN').length || 0}
Total Deal Value: $${client.deals?.reduce((sum, d) => sum + (d.value || 0), 0) || 0}
Documents: ${client.documents?.length || 0}
Contacts: ${client.contacts?.length || 0}
Notes: ${client.notes || 'No notes'}
`;

      const prompt = `Based on the following client information, suggest 3-5 specific next actions to improve the relationship and business outcomes:

${clientInfo}

Consider:
- Relationship development opportunities
- Deal progression strategies
- Data collection needs
- Communication touchpoints
- Value-add activities

Provide actionable, specific recommendations with reasoning.`;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "user", content: prompt }
        ],
        max_tokens: 500,
        temperature: 0.7,
      });

      return completion.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw new Error('Failed to generate next actions');
    }
  }
}

export const openAIService = new OpenAIService();
