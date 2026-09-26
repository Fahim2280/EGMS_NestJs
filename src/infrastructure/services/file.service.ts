import { Injectable, Logger } from '@nestjs/common';
import { existsSync, mkdirSync, writeFileSync, unlinkSync } from 'fs';
import { resolve, extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { AttachedDocument } from '../../domain/common/attached-document.interface';

@Injectable()
export class FileService {
  private readonly logger = new Logger(FileService.name);
  private readonly baseUploadPath: string;
  private readonly maxFileSize = 5 * 1024 * 1024; // 5 MB

  constructor() {
    this.baseUploadPath = process.env.UPLOAD_DIR
      ? resolve(process.cwd(), process.env.UPLOAD_DIR)
      : resolve(process.cwd(), 'storage', 'uploads');
    this.ensureDirectory(this.baseUploadPath);
  }

  private ensureDirectory(dirPath: string): void {
    if (!existsSync(dirPath)) {
      mkdirSync(dirPath, { recursive: true });
    }
  }

  /**
   * Uploads a single file, applies compression under 5MB if image, and returns document metadata
   */
  async uploadFile(
    file: { originalname: string; buffer: Buffer; size: number; mimetype: string },
    folderName: string,
    tag?: string,
    uploadedBy?: string,
    compress: boolean = true,
  ): Promise<AttachedDocument> {
    if (!file || !file.buffer || file.buffer.length === 0) {
      throw new Error('No file content provided.');
    }

    const folderDir = resolve(this.baseUploadPath, folderName);
    this.ensureDirectory(folderDir);

    const ext = extname(file.originalname).toLowerCase() || '.bin';
    const isImage = ['.jpg', '.jpeg', '.png', '.webp', '.heic', '.heif'].includes(ext);
    const needsConversionToJpeg = ext === '.heic' || ext === '.heif';

    const uniqueId = uuidv4();
    let finalExtension = ext;
    let finalBuffer = file.buffer;
    let finalMime = file.mimetype;

    // Server-side compression under 5MB if image exceeds 5MB or needs conversion
    if (compress && isImage && (file.size > this.maxFileSize || needsConversionToJpeg)) {
      try {
        let sharp: any;
        try {
          sharp = require('sharp');
        } catch {
          // Sharp not installed; fallback to original buffer
        }

        if (sharp) {
          finalExtension = '.jpg';
          finalMime = 'image/jpeg';
          let quality = 90;
          let compressed = await sharp(file.buffer).jpeg({ quality }).toBuffer();

          if (compressed.length > this.maxFileSize) {
            quality = 85;
            while (quality > 10) {
              compressed = await sharp(file.buffer).jpeg({ quality }).toBuffer();
              if (compressed.length <= this.maxFileSize) {
                break;
              }
              quality -= 5;
            }
          }
          finalBuffer = compressed;
        }
      } catch (err: any) {
        this.logger.warn(`Image compression failed: ${err.message}. Saving original buffer.`);
      }
    }

    const uniqueFileName = `${uniqueId}${finalExtension}`;
    const physicalPath = resolve(folderDir, uniqueFileName);

    // Save to disk
    writeFileSync(physicalPath, finalBuffer);

    const relativePath = `uploads/${folderName}/${uniqueFileName}`.replace(/\\/g, '/');

    return {
      id: uniqueId,
      originalName: file.originalname,
      fileName: uniqueFileName,
      filePath: relativePath,
      mimeType: finalMime,
      size: finalBuffer.length,
      tag: tag || 'OTHER',
      uploadedAt: new Date().toISOString(),
      uploadedBy: uploadedBy || 'SYSTEM',
    };
  }

  /**
   * Upload multiple files
   */
  async uploadFiles(
    files: Array<{ originalname: string; buffer: Buffer; size: number; mimetype: string }>,
    folderName: string,
    tags?: string | string[],
    uploadedBy?: string,
  ): Promise<AttachedDocument[]> {
    if (!files || files.length === 0) return [];
    const results: AttachedDocument[] = [];
    for (let i = 0; i < files.length; i++) {
      const tag = Array.isArray(tags) ? (tags[i] || 'OTHER') : (tags || 'OTHER');
      const doc = await this.uploadFile(files[i], folderName, tag, uploadedBy);
      results.push(doc);
    }
    return results;
  }

  /**
   * Replaces an existing file with a new one
   */
  async replaceFile(
    newFile: { originalname: string; buffer: Buffer; size: number; mimetype: string },
    oldRelativePath: string,
    folderName: string,
    tag?: string,
    uploadedBy?: string,
  ): Promise<AttachedDocument> {
    const newDoc = await this.uploadFile(newFile, folderName, tag, uploadedBy);
    if (newDoc && oldRelativePath) {
      await this.deleteFile(oldRelativePath);
    }
    return newDoc;
  }

  /**
   * Deletes a file from physical storage safely
   */
  async deleteFile(relativePath: string): Promise<boolean> {
    if (!relativePath) return false;
    try {
      const fullPath = this.getPhysicalPath(relativePath);
      if (existsSync(fullPath)) {
        unlinkSync(fullPath);
        return true;
      }
    } catch (err: any) {
      this.logger.warn(`Failed to delete file at ${relativePath}: ${err.message}`);
    }
    return false;
  }

  /**
   * Safely resolves a relative path to physical path preventing path traversal
   */
  getPhysicalPath(relativePath: string): string {
    const cleaned = relativePath
      .replace(/^[\/\\]+/, '')
      .replace(/^storage[\/\\]+/, '')
      .replace(/^public[\/\\]+/, '');

    // Prevent path traversal
    if (cleaned.includes('..')) {
      throw new Error('Access denied: Invalid path traversal detected.');
    }

    const strippedUploads = cleaned.replace(/^uploads[\/\\]+/, '');
    const primaryPath = resolve(this.baseUploadPath, strippedUploads);
    const storageRoot = resolve(this.baseUploadPath);

    // If file exists in secure storage root
    if (existsSync(primaryPath) && primaryPath.startsWith(storageRoot)) {
      return primaryPath;
    }

    // Fallback: check legacy public/uploads location for backward compatibility
    const legacyPath = resolve(process.cwd(), 'public', cleaned);
    const legacyRoot = resolve(process.cwd(), 'public');
    if (existsSync(legacyPath) && legacyPath.startsWith(legacyRoot)) {
      return legacyPath;
    }

    // Default to primary secure storage path
    if (!primaryPath.startsWith(storageRoot)) {
      throw new Error('Access denied: Invalid path traversal detected.');
    }
    return primaryPath;
  }

  /**
   * Format bytes to readable string (e.g. 1.25 MB)
   */
  formatSize(bytes: number): string {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }
}
