import type { APIRoute } from 'astro';
import { crmService } from '../../../../lib/integrations/crm';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { chatSessionId, content, role, metadata } = body;

    if (!chatSessionId || !content || !role) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Chat session ID, content, and role are required'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    const message = await crmService.addChatMessage({
      chatSessionId,
      content,
      role,
      metadata: metadata ? JSON.stringify(metadata) : undefined
    });

    return new Response(JSON.stringify({
      success: true,
      data: message
    }), {
      status: 201,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error creating chat message:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to create chat message'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};
