import type { APIRoute } from 'astro';
import { crmService } from '../../../../lib/integrations/crm';
import { fileUploadService } from '../../../../lib/utils/file-upload';

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const clientId = formData.get('clientId') as string;
    const uploadedBy = formData.get('uploadedBy') as string;

    if (!files.length || !clientId || !uploadedBy) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Files, clientId, and uploadedBy are required'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    // Validate files
    for (const file of files) {
      const validation = fileUploadService.validateFile(file);
      if (!validation.valid) {
        return new Response(JSON.stringify({
          success: false,
          error: `File ${file.name}: ${validation.error}`
        }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        });
      }
    }

    // Upload files
    const uploadedFiles = await fileUploadService.uploadMultipleFiles(files, clientId);
    
    // Save document records to database
    const documents = [];
    for (const uploadedFile of uploadedFiles) {
      const document = await crmService.createDocument({
        clientId,
        filename: uploadedFile.filename,
        originalName: uploadedFile.originalName,
        fileSize: uploadedFile.size,
        mimeType: uploadedFile.mimeType,
        filePath: uploadedFile.filePath,
        uploadedBy
      });
      documents.push(document);
    }

    return new Response(JSON.stringify({
      success: true,
      data: documents
    }), {
      status: 201,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error uploading documents:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to upload documents'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};
