import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './routes/auth';
import reportsRoutes from './routes/reports';
import buildsRoutes from './routes/builds';
import partsRoutes from './routes/parts';
import entitlementsRoutes from './routes/entitlements';
import aiRoutes from './routes/ai';
import chatRoutes from './routes/chat';
import tokensRoutes from './routes/tokens';
import subscriptionsRoutes from './routes/subscriptions';
import feedbackRoutes from './routes/feedback';
import adminRoutes from './routes/admin';
import pricesRoutes from './routes/prices';
import testersRoutes from './routes/testers';

// Import middleware
import { errorHandler } from './middleware/errorHandler';

const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration - matching Python backend
const ALLOWED_ORIGINS = [
    // Production
    'https://nexusbuild.app',
    'https://www.nexusbuild.app',
    'https://api.nexusbuild.app',
    'https://lokyg3d.github.io',
    // Environment overrides
    process.env.FRONTEND_URL || 'http://localhost:5173',
    process.env.MOBILE_URL || 'http://localhost:8081',
    // Local development
    'http://localhost:8081',
    'http://localhost:8082',
    'http://localhost:19006',
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:8081',
    'http://127.0.0.1:8082',
    'http://127.0.0.1:19006',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000',
    // Local Network (for mobile dev)
    'http://192.168.1.166:8081',
    'http://192.168.1.166:8082',
    'http://192.168.1.166:19006',
];

app.use(
    cors({
        origin: (origin, callback) => {
            // Allow requests with no origin (mobile apps, curl, etc.)
            if (!origin) return callback(null, true);

            if (ALLOWED_ORIGINS.includes(origin)) {
                callback(null, true);
            } else {
                console.warn(`Blocked CORS request from origin: ${origin}`);
                callback(null, true); // Allow in dev mode, change to false in strict prod
            }
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    })
);

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static uploaded files
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Request logging
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});

// Health check
app.get('/api/health', (req: Request, res: Response) => {
    res.json({
        status: 'healthy',
        message: 'NexusBuild API is running (Node.js)',
        timestamp: new Date().toISOString(),
    });
});

// Version endpoint
app.get('/api/version', (req: Request, res: Response) => {
    res.json({
        version: '2.0.0',
        environment: process.env.NODE_ENV || 'development',
        backend: 'Node.js/TypeScript',
    });
});

// Root endpoint
app.get('/', (req: Request, res: Response) => {
    res.json({
        message: 'Welcome to NexusBuild API',
        version: '2.0.0',
        docs: '/api/health',
    });
});

// Register API routes
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/builds', buildsRoutes);
app.use('/api/parts', partsRoutes);
app.use('/api/entitlements', entitlementsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/tokens', tokensRoutes);
app.use('/api/subscriptions', subscriptionsRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/prices', pricesRoutes);
app.use('/api', testersRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
    res.status(404).json({ message: 'Endpoint not found' });
});

// Error handler (must be last)
app.use(errorHandler);

const isVercelRuntime = Boolean(process.env.VERCEL);
let server: ReturnType<typeof app.listen> | null = null;

if (!isVercelRuntime) {
    // Start a local HTTP server in development. Vercel invokes the exported app directly.
    server = app.listen(PORT, () => {
        console.log('');
        console.log('â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—');
        console.log('â•‘     NexusBuild API Server Started     â•‘');
        console.log('â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•');
        console.log('');
        console.log(`ðŸš€ Server running on port ${PORT}`);
        console.log(`ðŸ“ Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`ðŸ—„ï¸  Database: ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}`);
        console.log('');
        console.log('Available endpoints:');
        console.log(`  GET  /api/health`);
        console.log(`  GET  /api/version`);
        console.log(`  GET  /api/admin/migrate (DEV ONLY)`); // Added for the new endpoint
        console.log(`  POST /api/auth/register`);
        console.log(`  POST /api/auth/login`);
        console.log(`  GET  /api/auth/me`);
        console.log(`  POST /api/reports`);
        console.log(`  GET  /api/reports`);
        console.log(`  GET  /api/builds`);
        console.log(`  POST /api/builds`);
        console.log(`  GET  /api/parts`);
        console.log(`  POST /api/parts`);
        console.log(`  GET  /api/entitlements`);
        console.log(`  GET  /api/ai/usage`);
        console.log(`  POST /api/chat (PC Expert AI)`);
        console.log('');
    });
}

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully...');
    if (server) {
        server.close(() => {
            console.log('Server closed');
            process.exit(0);
        });
        return;
    }

    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('\nSIGINT received, shutting down gracefully...');
    if (server) {
        server.close(() => {
            console.log('Server closed');
            process.exit(0);
        });
        return;
    }

    process.exit(0);
});

export default app;

