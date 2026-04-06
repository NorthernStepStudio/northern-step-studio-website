import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';

export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.error('Error:', err);

    // Prisma errors
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
        switch (err.code) {
            case 'P2002':
                return res.status(409).json({
                    message: 'A record with this value already exists',
                    field: err.meta?.target,
                });
            case 'P2025':
                return res.status(404).json({ message: 'Record not found' });
            case 'P2003':
                return res.status(400).json({ message: 'Invalid reference' });
            default:
                return res.status(400).json({ message: 'Database error' });
        }
    }

    // Validation errors
    if (err.name === 'ValidationError') {
        return res.status(400).json({ message: err.message });
    }

    // Multer errors
    if (err.message.includes('Only image files')) {
        return res.status(400).json({ message: err.message });
    }

    if (err.message.includes('File too large')) {
        return res.status(413).json({ message: 'File size exceeds limit (5MB)' });
    }

    // Default error
    res.status(500).json({
        message: process.env.NODE_ENV === 'production'
            ? 'Internal server error'
            : err.message,
    });
};
