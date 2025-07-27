import type { APIRoute } from 'astro';
import { crmService } from '../../../lib/integrations/crm';

export const GET: APIRoute = async ({ url, request }) => {
  try {
    const searchParams = new URL(url).searchParams;
    const status = searchParams.get('status') as any;
    const search = searchParams.get('search') || undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined;

    const clients = await crmService.getClients({
      status,
      search,
      limit,
      offset
    });

    // Parse tags for each client
    const clientsWithParsedTags = clients.map(client => ({
      ...client,
      tags: JSON.parse(client.tags)
    }));

    return new Response(JSON.stringify({
      success: true,
      data: clientsWithParsedTags
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error fetching clients:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to fetch clients'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { name, email, phone, company, status, tags, notes } = body;

    if (!name || !email) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Name and email are required'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    const client = await crmService.createClient({
      name,
      email,
      phone,
      company,
      status,
      tags,
      notes
    });

    return new Response(JSON.stringify({
      success: true,
      data: {
        ...client,
        tags: JSON.parse(client.tags)
      }
    }), {
      status: 201,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error creating client:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to create client'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};
