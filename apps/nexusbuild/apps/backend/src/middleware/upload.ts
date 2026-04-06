import multer from 'multer';
import path from 'path';
import fs from 'fs';

const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '5242880'); // 5MB

// Ensure upload directories exist
const ensureDir = (dir: string) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
};

ensureDir(path.join(UPLOAD_DIR, 'reports'));
ensureDir(path.join(UPLOAD_DIR, 'profiles'));

// Storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const subdir = req.path.includes('report') ? 'reports' : 'profiles';
        const dest = path.join(UPLOAD_DIR, subdir);
        cb(null, dest);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, `${uniqueSuffix}${ext}`);
    },
});

// File filter
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only image files are allowed (jpeg, jpg, png, gif)'));
    }
};

// Multer instance
export const upload = multer({
    storage,
    limits: { fileSize: MAX_FILE_SIZE },
    fileFilter,
});

// Helper to get public URL for uploaded file
export const getFileUrl = (filePath: string): string => {
    return `/${filePath.replace(/\\/g, '/')}`;
};
