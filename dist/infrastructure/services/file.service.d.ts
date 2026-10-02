import { AttachedDocument } from '../../domain/common/attached-document.interface';
export declare class FileService {
    private readonly logger;
    private readonly baseUploadPath;
    private readonly maxFileSize;
    constructor();
    private ensureDirectory;
    uploadFile(file: {
        originalname: string;
        buffer: Buffer;
        size: number;
        mimetype: string;
    }, folderName: string, tag?: string, uploadedBy?: string, compress?: boolean): Promise<AttachedDocument>;
    uploadFiles(files: Array<{
        originalname: string;
        buffer: Buffer;
        size: number;
        mimetype: string;
    }>, folderName: string, tags?: string | string[], uploadedBy?: string): Promise<AttachedDocument[]>;
    replaceFile(newFile: {
        originalname: string;
        buffer: Buffer;
        size: number;
        mimetype: string;
    }, oldRelativePath: string, folderName: string, tag?: string, uploadedBy?: string): Promise<AttachedDocument>;
    deleteFile(relativePath: string): Promise<boolean>;
    getPhysicalPath(relativePath: string): string;
    formatSize(bytes: number): string;
}
