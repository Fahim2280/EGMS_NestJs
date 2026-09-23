import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { AttachedDocument } from '../../domain/common/attached-document.interface';

export class AttachedDocumentDto implements AttachedDocument {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  originalName: string;

  @IsString()
  @IsNotEmpty()
  fileName: string;

  @IsString()
  @IsNotEmpty()
  filePath: string;

  @IsString()
  @IsNotEmpty()
  mimeType: string;

  @IsNumber()
  size: number;

  @IsString()
  @IsOptional()
  tag?: string;

  @IsString()
  @IsNotEmpty()
  uploadedAt: string;

  @IsString()
  @IsOptional()
  uploadedBy?: string;
}

/**
 * Safely parses document inputs from form posts or JSON strings
 */
export function parseDocumentsInput(input: any): AttachedDocument[] {
  if (!input) return [];
  if (Array.isArray(input)) return input;
  if (typeof input === 'string') {
    try {
      const parsed = JSON.parse(input);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return [];
    }
  }
  return [];
}
