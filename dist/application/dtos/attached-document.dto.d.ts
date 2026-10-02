import { AttachedDocument } from '../../domain/common/attached-document.interface';
export declare class AttachedDocumentDto implements AttachedDocument {
    id: string;
    originalName: string;
    fileName: string;
    filePath: string;
    mimeType: string;
    size: number;
    tag?: string;
    uploadedAt: string;
    uploadedBy?: string;
}
export declare function parseDocumentsInput(input: any): AttachedDocument[];
