import type { APIRoute } from 'astro';
import { IntercomService } from '../../../lib/integrations/intercom';

export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const search = url.searchParams.get('search');

    const intercomService = new IntercomService();

    let response;
    if (search) {
      response = await intercomService.searchContacts(search);
    } else {
      response = await intercomService.getContacts(page, limit);
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

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { name, email, customAttributes } = body;

    if (!name || !email) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Name and email are required'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    const intercomService = new IntercomService();
    const response = await intercomService.createContact(name, email, customAttributes);

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
      status: 201,
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
