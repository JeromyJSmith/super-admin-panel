import type { APIRoute } from 'astro';
import { crmService } from '../../../../lib/integrations/crm';

export const GET: APIRoute = async ({ params }) => {
  try {
    const { id } = params;
    
    if (!id) {
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

    const client = await crmService.getClientById(id);

    if (!client) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Client not found'
      }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      data: client
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error fetching client:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to fetch client'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};

export const PUT: APIRoute = async ({ params, request }) => {
  try {
    const { id } = params;
    
    if (!id) {
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

    const body = await request.json();
    const { name, email, phone, company, status, tags, notes } = body;

    const client = await crmService.updateClient(id, {
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
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error updating client:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to update client'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};

export const DELETE: APIRoute = async ({ params }) => {
  try {
    const { id } = params;
    
    if (!id) {
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

    await crmService.deleteClient(id);

    return new Response(JSON.stringify({
      success: true,
      message: 'Client deleted successfully'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error deleting client:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to delete client'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};
