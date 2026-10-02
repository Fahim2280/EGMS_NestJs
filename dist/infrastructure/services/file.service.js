"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var FileService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileService = void 0;
const common_1 = require("@nestjs/common");
const fs_1 = require("fs");
const path_1 = require("path");
const uuid_1 = require("uuid");
let FileService = FileService_1 = class FileService {
    logger = new common_1.Logger(FileService_1.name);
    baseUploadPath;
    maxFileSize = 5 * 1024 * 1024;
    constructor() {
        this.baseUploadPath = process.env.UPLOAD_DIR
            ? (0, path_1.resolve)(process.cwd(), process.env.UPLOAD_DIR)
            : (0, path_1.resolve)(process.cwd(), 'storage', 'uploads');
        this.ensureDirectory(this.baseUploadPath);
    }
    ensureDirectory(dirPath) {
        if (!(0, fs_1.existsSync)(dirPath)) {
            (0, fs_1.mkdirSync)(dirPath, { recursive: true });
        }
    }
    async uploadFile(file, folderName, tag, uploadedBy, compress = true) {
        if (!file || !file.buffer || file.buffer.length === 0) {
            throw new Error('No file content provided.');
        }
        const folderDir = (0, path_1.resolve)(this.baseUploadPath, folderName);
        this.ensureDirectory(folderDir);
        const ext = (0, path_1.extname)(file.originalname).toLowerCase() || '.bin';
        const isImage = ['.jpg', '.jpeg', '.png', '.webp', '.heic', '.heif'].includes(ext);
        const needsConversionToJpeg = ext === '.heic' || ext === '.heif';
        const uniqueId = (0, uuid_1.v4)();
        let finalExtension = ext;
        let finalBuffer = file.buffer;
        let finalMime = file.mimetype;
        if (compress && isImage && (file.size > this.maxFileSize || needsConversionToJpeg)) {
            try {
                let sharp;
                try {
                    sharp = require('sharp');
                }
                catch {
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
            }
            catch (err) {
                this.logger.warn(`Image compression failed: ${err.message}. Saving original buffer.`);
            }
        }
        const uniqueFileName = `${uniqueId}${finalExtension}`;
        const physicalPath = (0, path_1.resolve)(folderDir, uniqueFileName);
        (0, fs_1.writeFileSync)(physicalPath, finalBuffer);
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
    async uploadFiles(files, folderName, tags, uploadedBy) {
        if (!files || files.length === 0)
            return [];
        const results = [];
        for (let i = 0; i < files.length; i++) {
            const tag = Array.isArray(tags) ? (tags[i] || 'OTHER') : (tags || 'OTHER');
            const doc = await this.uploadFile(files[i], folderName, tag, uploadedBy);
            results.push(doc);
        }
        return results;
    }
    async replaceFile(newFile, oldRelativePath, folderName, tag, uploadedBy) {
        const newDoc = await this.uploadFile(newFile, folderName, tag, uploadedBy);
        if (newDoc && oldRelativePath) {
            await this.deleteFile(oldRelativePath);
        }
        return newDoc;
    }
    async deleteFile(relativePath) {
        if (!relativePath)
            return false;
        try {
            const fullPath = this.getPhysicalPath(relativePath);
            if ((0, fs_1.existsSync)(fullPath)) {
                (0, fs_1.unlinkSync)(fullPath);
                return true;
            }
        }
        catch (err) {
            this.logger.warn(`Failed to delete file at ${relativePath}: ${err.message}`);
        }
        return false;
    }
    getPhysicalPath(relativePath) {
        const cleaned = relativePath
            .replace(/^[\/\\]+/, '')
            .replace(/^storage[\/\\]+/, '')
            .replace(/^public[\/\\]+/, '');
        if (cleaned.includes('..')) {
            throw new Error('Access denied: Invalid path traversal detected.');
        }
        const strippedUploads = cleaned.replace(/^uploads[\/\\]+/, '');
        const primaryPath = (0, path_1.resolve)(this.baseUploadPath, strippedUploads);
        const storageRoot = (0, path_1.resolve)(this.baseUploadPath);
        if ((0, fs_1.existsSync)(primaryPath) && primaryPath.startsWith(storageRoot)) {
            return primaryPath;
        }
        const legacyPath = (0, path_1.resolve)(process.cwd(), 'public', cleaned);
        const legacyRoot = (0, path_1.resolve)(process.cwd(), 'public');
        if ((0, fs_1.existsSync)(legacyPath) && legacyPath.startsWith(legacyRoot)) {
            return legacyPath;
        }
        if (!primaryPath.startsWith(storageRoot)) {
            throw new Error('Access denied: Invalid path traversal detected.');
        }
        return primaryPath;
    }
    formatSize(bytes) {
        if (!bytes || bytes === 0)
            return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
    }
};
exports.FileService = FileService;
exports.FileService = FileService = FileService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], FileService);
//# sourceMappingURL=file.service.js.map