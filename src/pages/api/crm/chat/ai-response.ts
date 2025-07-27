import type { APIRoute } from 'astro';
import { crmService } from '../../../../lib/integrations/crm';
import { openAIService } from '../../../../lib/integrations/openai';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { chatSessionId, messages, clientContext } = body;

    if (!chatSessionId || !messages) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Chat session ID and messages are required'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    // Convert messages to OpenAI format
    const openAIMessages = messages.map((msg: any) => ({
      role: msg.role.toLowerCase(),
      content: msg.content
    }));

    // Get AI response
    const aiResponse = await openAIService.generateChatResponse(
      openAIMessages,
      clientContext ? { client: clientContext } : undefined
    );

    // Save AI response to database
    const savedMessage = await crmService.addChatMessage({
      chatSessionId,
      content: aiResponse.content,
      role: 'ASSISTANT',
      metadata: JSON.stringify({
        model: aiResponse.model,
        usage: aiResponse.usage
      })
    });

    return new Response(JSON.stringify({
      success: true,
      data: savedMessage
    }), {
      status: 201,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error generating AI response:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to generate AI response'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};
