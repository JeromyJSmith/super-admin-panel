import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

export interface UploadedFile {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  filePath: string;
}

export class FileUploadService {
  private uploadDir: string;

  constructor(uploadDir: string = 'uploads') {
    this.uploadDir = uploadDir;
  }

  async ensureUploadDir(clientId: string) {
    const clientDir = join(process.cwd(), 'public', this.uploadDir, clientId);
    try {
      await mkdir(clientDir, { recursive: true });
      return clientDir;
    } catch (error) {
      console.error('Error creating upload directory:', error);
      throw new Error('Failed to create upload directory');
    }
  }

  async uploadFile(file: File, clientId: string): Promise<UploadedFile> {
    try {
      // Create upload directory for client if it doesn't exist
      const clientDir = await this.ensureUploadDir(clientId);
      
      // Generate unique filename
      const fileExtension = file.name.split('.').pop();
      const filename = `${uuidv4()}.${fileExtension}`;
      const filePath = join(clientDir, filename);
      const publicPath = `/${this.uploadDir}/${clientId}/${filename}`;

      // Convert file to buffer and write to disk
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      await writeFile(filePath, buffer);

      return {
        filename,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        filePath: publicPath
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      throw new Error('Failed to upload file');
    }
  }

  async uploadMultipleFiles(files: File[], clientId: string): Promise<UploadedFile[]> {
    const uploadPromises = files.map(file => this.uploadFile(file, clientId));
    return Promise.all(uploadPromises);
  }

  validateFile(file: File): { valid: boolean; error?: string } {
    // Check file size (50MB limit)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return { valid: false, error: 'File size exceeds 50MB limit' };
    }

    // Check file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'text/csv',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/zip',
      'application/x-zip-compressed'
    ];

    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'File type not allowed' };
    }

    return { valid: true };
  }

  getFileIcon(mimeType: string): string {
    const iconMap: Record<string, string> = {
      'application/pdf': '📄',
      'application/msword': '📝',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '📝',
      'application/vnd.ms-excel': '📊',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '📊',
      'application/vnd.ms-powerpoint': '📈',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': '📈',
      'text/plain': '📄',
      'text/csv': '📊',
      'image/jpeg': '🖼️',
      'image/png': '🖼️',
      'image/gif': '🖼️',
      'image/webp': '🖼️',
      'application/zip': '🗜️',
      'application/x-zip-compressed': '🗜️'
    };

    return iconMap[mimeType] || '📁';
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

export const fileUploadService = new FileUploadService();
