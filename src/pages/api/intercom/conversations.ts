import type { APIRoute } from 'astro';
import { IntercomService } from '../../../lib/integrations/intercom';

export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const state = url.searchParams.get('state');
    const unassigned = url.searchParams.get('unassigned') === 'true';

    const intercomService = new IntercomService();

    let response;
    if (state === 'open') {
      response = await intercomService.getOpenConversations();
    } else if (unassigned) {
      response = await intercomService.getUnassignedConversations();
    } else {
      response = await intercomService.getConversations(page, limit);
    }

    if (!response.success) {
      return new Response(JSON.stringify({
        success: false,
        error: response.error
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    return new Response(JSON.stringify({
      success: true,
      data: response.data
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('API Error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Internal server error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};

export const PUT: APIRoute = async ({ request, params }) => {
  try {
    const body = await request.json();
    const { conversationId, action, adminId, message } = body;

    if (!conversationId || !action) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Conversation ID and action are required'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    const intercomService = new IntercomService();
    let response;

    switch (action) {
      case 'assign':
        if (!adminId) {
          return new Response(JSON.stringify({
            success: false,
            error: 'Admin ID is required for assignment'
          }), {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
            },
          });
        }
        response = await intercomService.assignConversation(conversationId, adminId);
        break;
      
      case 'close':
        response = await intercomService.closeConversation(conversationId);
        break;
      
      case 'reply':
        if (!message) {
          return new Response(JSON.stringify({
            success: false,
            error: 'Message is required for reply'
          }), {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
            },
          });
        }
        response = await intercomService.replyToConversation(conversationId, message);
        break;
      
      default:
        return new Response(JSON.stringify({
          success: false,
          error: 'Invalid action'
        }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        });
    }

    if (!response.success) {
      return new Response(JSON.stringify({
        success: false,
        error: response.error
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    return new Response(JSON.stringify({
      success: true,
      data: response.data
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('API Error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Internal server error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};
