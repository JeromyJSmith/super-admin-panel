import type { APIRoute } from 'astro';
import { IntercomService } from '../../../lib/integrations/intercom';

export const GET: APIRoute = async ({ request }) => {
  try {
    const intercomService = new IntercomService();
    const response = await intercomService.getMetrics();

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
