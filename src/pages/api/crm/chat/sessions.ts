import type { APIRoute } from 'astro';
import { crmService } from '../../../../lib/integrations/crm';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { clientId, title } = body;

    if (!clientId) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Client ID is required'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    const chatSession = await crmService.createChatSession({
      clientId,
      title: title || 'New Chat'
    });

    return new Response(JSON.stringify({
      success: true,
      data: chatSession
    }), {
      status: 201,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error creating chat session:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to create chat session'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};

export const GET: APIRoute = async ({ url }) => {
  try {
    const searchParams = new URL(url).searchParams;
    const clientId = searchParams.get('clientId') || undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined;

    const chatSessions = await crmService.getChatSessions({
      clientId,
      limit,
      offset
    });

    return new Response(JSON.stringify({
      success: true,
      data: chatSessions
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error fetching chat sessions:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to fetch chat sessions'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};
