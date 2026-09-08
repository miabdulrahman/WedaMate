import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class StorageService {
  constructor() {
    this.provider = process.env.STORAGE_PROVIDER || 'local';
    this.uploadDir = path.join(__dirname, '../../uploads');
    this.publicDir = path.join(this.uploadDir, 'public');
    this.protectedDir = path.join(this.uploadDir, 'protected'); // For sensitive KYC verification documents

    this._ensureDirectories();
  }

  _ensureDirectories() {
    [this.uploadDir, this.publicDir, this.protectedDir].forEach((dir) => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  getPublicUploadPath() {
    return this.publicDir;
  }

  getProtectedUploadPath() {
    return this.protectedDir;
  }

  getRelativeUrl(filename, isProtected = false) {
    return isProtected ? `/api/verification/docs/${filename}` : `/uploads/public/${filename}`;
  }
}

export default new StorageService();
