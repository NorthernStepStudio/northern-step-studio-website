import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AuthRequest, requireAuth } from '../middleware/auth';
import { isValidEmail, isValidPassword, isValidUsername, sanitizeInput } from '../utils/validation';

const router = Router();
let prisma: PrismaClient | null = null;

function getPrismaClient() {
    if (!prisma) {
        prisma = new PrismaClient();
    }

    return prisma;
}

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', async (req: Request, res: Response) => {
    try {
        const { username, email, password } = req.body;

        // Validate required fields
        if (!username || !email || !password) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Validate username
        const usernameValidation = isValidUsername(username);
        if (!usernameValidation.valid) {
            return res.status(400).json({ message: usernameValidation.message });
        }

        // Validate email
        if (!isValidEmail(email)) {
            return res.status(400).json({ message: 'Invalid email address' });
        }

        // Validate password
        const passwordValidation = isValidPassword(password);
        if (!passwordValidation.valid) {
            return res.status(400).json({ message: passwordValidation.message });
        }

        // Check if user exists
        const existingUser = await getPrismaClient().user.findFirst({
            where: {
                OR: [
                    { username: sanitizeInput(username) },
                    { email: email.toLowerCase() },
                ],
            },
        });

        if (existingUser) {
            if (existingUser.username === username) {
                return res.status(409).json({ message: 'Username already exists' });
            }
            return res.status(409).json({ message: 'Email already exists' });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Auto-promote ONLY the official admin email
        const isAdminEmail = email.toLowerCase() === 'admin@nexusbuild.app';

        // Create user
        const user = await getPrismaClient().user.create({
            data: {
                username: sanitizeInput(username),
                email: email.toLowerCase(),
                passwordHash,
                isAdmin: isAdminEmail,
                isModerator: isAdminEmail,
                bio: isAdminEmail ? 'NexusBuild Administrator' : undefined,
            },
        });

        // Generate tokens
        const accessToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' } as jwt.SignOptions);
        const refreshToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '30d' } as jwt.SignOptions);

        console.log(`✅ User registered: ${user.username} (ID: ${user.id})`);

        res.status(201).json({
            message: 'User created successfully',
            token: accessToken,
            refresh_token: refreshToken,
            user: {
                id: user.id,
                username: user.username,
                displayName: user.username,
                email: user.email,
                bio: user.bio,
                profile_image: user.profileImage,
                avatar: user.profileImage,
                is_admin: user.isAdmin,
                is_moderator: user.isModerator,
                is_suspended: user.isSuspended,
                tokens: user.tokens,
                role: user.isAdmin ? 'admin' : user.isModerator ? 'moderator' : 'user',
                profile: {
                    bio: user.bio,
                    frameId: user.avatarFrame,
                },
            },
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Error creating user' });
    }
});

/**
 * POST /api/auth/login
 * Login user
 */
router.post('/login', async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Missing email or password' });
        }

        // Find user
        const user = await getPrismaClient().user.findUnique({
            where: { email: email.toLowerCase() },
        });

        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.passwordHash);
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Check suspension
        if (user.isSuspended) {
            return res.status(403).json({ message: 'Account suspended. Contact support.' });
        }

        // Generate tokens
        const accessToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' } as jwt.SignOptions);
        const refreshToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '30d' } as jwt.SignOptions);

        console.log(`✅ User logged in: ${user.username} (ID: ${user.id})`);

        res.json({
            message: 'Login successful',
            token: accessToken,
            refresh_token: refreshToken,
            user: {
                id: user.id,
                username: user.username,
                displayName: user.username,
                email: user.email,
                bio: user.bio,
                profile_image: user.profileImage,
                avatar: user.profileImage,
                is_admin: user.isAdmin,
                is_moderator: user.isModerator,
                is_suspended: user.isSuspended,
                tokens: user.tokens,
                role: user.isAdmin ? 'admin' : user.isModerator ? 'moderator' : 'user',
                profile: {
                    bio: user.bio,
                    frameId: user.avatarFrame,
                },
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Error logging in' });
    }
});

/**
 * POST /api/auth/refresh
 * Refresh access token
 */
router.post('/refresh', async (req: Request, res: Response) => {
    try {
        const { refresh_token } = req.body;

        if (!refresh_token) {
            return res.status(400).json({ message: 'Refresh token required' });
        }

        const decoded = jwt.verify(refresh_token, JWT_SECRET) as { userId: number };
        const accessToken = jwt.sign({ userId: decoded.userId }, JWT_SECRET, { expiresIn: '24h' } as jwt.SignOptions);

        res.json({ token: accessToken });
    } catch (error) {
        res.status(401).json({ message: 'Invalid or expired refresh token' });
    }
});

/**
 * GET /api/auth/me
 * Get current user info
 */
router.get('/me', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
        const user = await getPrismaClient().user.findUnique({
            where: { id: req.userId },
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            id: user.id,
            username: user.username,
            displayName: user.username,
            email: user.email,
            bio: user.bio,
            profile_image: user.profileImage,
            avatar: user.profileImage,
            is_admin: user.isAdmin,
            is_moderator: user.isModerator,
            is_suspended: user.isSuspended,
            tokens: user.tokens,
            avatar_frame: user.avatarFrame,
            showcase_build_id: user.showcaseBuildId,
            is_public_profile: user.isPublicProfile,
            created_at: user.createdAt.toISOString(),
            role: user.isAdmin ? 'admin' : user.isModerator ? 'moderator' : 'user',
            profile: {
                bio: user.bio,
                frameId: user.avatarFrame,
            },
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ message: 'Error getting user' });
    }
});

/**
 * PUT /api/auth/update
 * Update user profile
 */
router.put('/update', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
        const requestedUsername = typeof req.body?.username === 'string'
            ? req.body.username
            : typeof req.body?.displayName === 'string'
                ? req.body.displayName
                : undefined;
        const nextUsername = requestedUsername
            ? sanitizeInput(requestedUsername).replace(/\s+/g, '_')
            : undefined;
        const nextBio = typeof req.body?.bio === 'string'
            ? sanitizeInput(req.body.bio)
            : typeof req.body?.profile?.bio === 'string'
                ? sanitizeInput(req.body.profile.bio)
                : undefined;
        const nextProfileImage =
            typeof req.body?.profile_image === 'string'
                ? req.body.profile_image
                : typeof req.body?.avatar === 'string'
                    ? req.body.avatar
                    : undefined;
        const nextAvatarFrame = typeof req.body?.avatar_frame === 'string'
            ? req.body.avatar_frame
            : typeof req.body?.profile?.frameId === 'string'
                ? req.body.profile.frameId
                : undefined;
        const nextPassword = typeof req.body?.password === 'string' ? req.body.password : undefined;

        if (nextUsername) {
            const usernameValidation = isValidUsername(nextUsername);
            if (!usernameValidation.valid) {
                return res.status(400).json({ message: usernameValidation.message });
            }

            const existingUser = await getPrismaClient().user.findFirst({
                where: {
                    username: nextUsername,
                    NOT: { id: req.userId },
                },
            });
            if (existingUser) {
                return res.status(409).json({ message: 'Username already exists' });
            }
        }

        let nextPasswordHash: string | undefined;
        if (nextPassword) {
            const passwordValidation = isValidPassword(nextPassword);
            if (!passwordValidation.valid) {
                return res.status(400).json({ message: passwordValidation.message });
            }
            nextPasswordHash = await bcrypt.hash(nextPassword, 10);
        }

        const user = await getPrismaClient().user.update({
            where: { id: req.userId },
            data: {
                username: nextUsername,
                bio: nextBio,
                profileImage: nextProfileImage !== undefined ? nextProfileImage : undefined,
                showcaseBuildId: req.body?.showcase_build_id !== undefined ? req.body.showcase_build_id : undefined,
                avatarFrame: nextAvatarFrame !== undefined ? nextAvatarFrame : undefined,
                isPublicProfile:
                    req.body?.is_public_profile !== undefined
                        ? req.body.is_public_profile
                        : req.body?.is_public !== undefined
                            ? req.body.is_public
                            : undefined,
                passwordHash: nextPasswordHash,
            },
        });

        res.json({
            message: 'Profile updated successfully',
            user: {
                id: user.id,
                username: user.username,
                displayName: user.username,
                email: user.email,
                bio: user.bio,
                profile_image: user.profileImage,
                avatar: user.profileImage,
                is_admin: user.isAdmin,
                is_moderator: user.isModerator,
                is_suspended: user.isSuspended,
                tokens: user.tokens,
                avatar_frame: user.avatarFrame,
                showcase_build_id: user.showcaseBuildId,
                is_public_profile: user.isPublicProfile,
                role: user.isAdmin ? 'admin' : user.isModerator ? 'moderator' : 'user',
                profile: {
                    bio: user.bio,
                    frameId: user.avatarFrame,
                },
            },
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'Error updating profile' });
    }
});

/**
 * GET /api/auth/export
 * Export user data
 */
router.get('/export', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
        const user = await getPrismaClient().user.findUnique({
            where: { id: req.userId },
            include: {
                builds: true,
                bugReports: true,
            },
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const exportData = {
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                bio: user.bio,
                profile_image: user.profileImage,
                created_at: user.createdAt.toISOString(),
            },
            builds: user.builds,
            bug_reports: user.bugReports,
            timestamp: new Date().toISOString(),
            version: '1.0',
        };

        res.json(exportData);
    } catch (error) {
        console.error('Export error:', error);
        res.status(500).json({ message: 'Error exporting profile' });
    }
});

/**
 * GET /api/auth/google/redirect_url
 * Get Google OAuth redirect URL
 */
router.get('/google/redirect_url', (req: Request, res: Response) => {
    try {
        const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
        const protocol = req.protocol;
        const host = req.get('host');
        const baseUrl = `${protocol}://${host}`;

        const options = {
            redirect_uri: `${baseUrl}/api/auth/google/callback`,
            client_id: process.env.GOOGLE_CLIENT_ID || '',
            access_type: 'offline',
            response_type: 'code',
            prompt: 'consent',
            scope: [
                'https://www.googleapis.com/auth/userinfo.profile',
                'https://www.googleapis.com/auth/userinfo.email',
            ].join(' '),
        };

        const qs = new URLSearchParams(options);
        res.json({ redirectUrl: `${rootUrl}?${qs.toString()}` });
    } catch (error) {
        console.error('Google Redirect Error:', error);
        res.status(503).json({ message: 'Google auth is not configured' });
    }
});

/**
 * GET /api/auth/google/callback
 * Google OAuth callback
 */
router.get('/google/callback', async (req: Request, res: Response) => {
    const { code } = req.query;
    if (!code) {
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=missing_code`);
    }

    try {
        const protocol = req.protocol;
        const host = req.get('host');
        const baseUrl = `${protocol}://${host}`;

        const tokenUrl = 'https://oauth2.googleapis.com/token';
        const values = {
            code,
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            redirect_uri: `${baseUrl}/api/auth/google/callback`,
            grant_type: 'authorization_code',
        };

        const { data: tokenData } = await (await import('axios')).default.post(tokenUrl, values);
        const { access_token } = tokenData;

        const { data: googleUser } = await (await import('axios')).default.get('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${access_token}` },
        });

        const email = googleUser.email.toLowerCase();
        let user = await getPrismaClient().user.findUnique({ where: { email } });

        if (!user) {
            const username = email.split('@')[0] + Math.floor(Math.random() * 1000);
            user = await getPrismaClient().user.create({
                data: {
                    email,
                    username,
                    passwordHash: '', // Google users don't have a local password by default
                    profileImage: googleUser.picture,
                    tokens: 5,
                },
            });
        }

        const accessToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });
        const refreshToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '30d' });

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        res.redirect(`${frontendUrl}/auth/callback?token=${accessToken}&refresh_token=${refreshToken}`);
    } catch (error) {
        console.error('Google Auth Callback Error:', error);
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=auth_failed`);
    }
});


export default router;
