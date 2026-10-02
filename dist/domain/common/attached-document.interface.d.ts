export interface AttachedDocument {
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
