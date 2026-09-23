export interface AttachedDocument {
  id: string;               // Unique document ID (UUID)
  originalName: string;     // Original filename (e.g. "NID_Card_Front.pdf")
  fileName: string;         // Physical file name on disk (e.g. "a3f5b821-49c0-424a-8107-1b0b5d12093e.jpg")
  filePath: string;         // Relative URL / path (e.g. "uploads/customers/a3f5b821...jpg")
  mimeType: string;         // MIME type (e.g. "image/jpeg", "application/pdf")
  size: number;             // File size in bytes
  tag?: string;             // Document category (e.g. "NID", "PHOTO", "AGREEMENT", "RESUME", "CERTIFICATE", "OTHER")
  uploadedAt: string;       // ISO timestamp
  uploadedBy?: string;      // User who uploaded the document
}
