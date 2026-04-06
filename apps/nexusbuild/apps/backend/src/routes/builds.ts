import express, { Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { authenticate, optionalAuth, AuthRequest } from '../middleware/auth';
import { validateBuild } from '../utils/validation';

const router = express.Router();
const prisma = new PrismaClient();

const CATEGORY_ALIASES: Record<string, string> = {
    cpu: 'cpu',
    processor: 'cpu',
    gpu: 'gpu',
    'graphics card': 'gpu',
    'graphics-card': 'gpu',
    'video card': 'gpu',
    'video-card': 'gpu',
    motherboard: 'motherboard',
    mobo: 'motherboard',
    ram: 'ram',
    memory: 'ram',
    storage: 'storage',
    ssd: 'storage',
    hdd: 'storage',
    nvme: 'storage',
    psu: 'psu',
    'power supply': 'psu',
    'power-supply': 'psu',
    case: 'case',
    cooler: 'cooler',
    'cpu cooler': 'cooler',
    'cpu-cooler': 'cooler',
    fan: 'fan',
    fans: 'fan',
    monitor: 'monitor',
    keyboard: 'keyboard',
    mouse: 'mouse',
    os: 'os',
    accessory: 'accessory',
    accessory_id: 'accessory',
    headset: 'headset',
};

const normalizeCategory = (value: string | null | undefined): string => {
    if (!value) return 'part';
    const normalized = value.toLowerCase().replace(/[_-]+/g, ' ').trim();
    return CATEGORY_ALIASES[normalized] || normalized.replace(/\s+/g, '-');
};

const parseNumber = (value: unknown): number => {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return value;
    }
    if (typeof value === 'string') {
        const parsed = Number.parseFloat(value.replace(/[^0-9.]+/g, ''));
        if (Number.isFinite(parsed)) {
            return parsed;
        }
    }
    return 0;
};

const toOptionalString = (value: unknown): string | null => {
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
};

type IncomingPart = {
    name: string;
    category: string;
    price: number;
    url: string | null;
    imageUrl: string | null;
    specifications: Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput | null;
};

const toJsonValue = (value: Record<string, unknown> | null): Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput | null => {
    if (!value) return null;
    return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
};

const normalizeIncomingParts = (parts: unknown): IncomingPart[] => {
    if (!parts) {
        return [];
    }

    const sourceEntries = Array.isArray(parts)
        ? parts.map((value, index) => [String(index), value] as const)
        : typeof parts === 'object'
            ? Object.entries(parts as Record<string, unknown>)
            : [];

    return sourceEntries
        .map(([key, rawValue]) => {
            if (!rawValue || typeof rawValue !== 'object' || Array.isArray(rawValue)) {
                return null;
            }

            const value = rawValue as Record<string, unknown>;
            const name = toOptionalString(value.name) || toOptionalString(value.title) || toOptionalString(value.model);
            if (!name) {
                return null;
            }

            const category = normalizeCategory(
                toOptionalString(value.category) ||
                key.replace(/_id$/i, '').replace(/_/g, ' ')
            );

            const specs =
                (value.specifications && typeof value.specifications === 'object' && !Array.isArray(value.specifications)
                    ? value.specifications
                    : value.specs && typeof value.specs === 'object' && !Array.isArray(value.specs)
                        ? value.specs
                        : null) as Record<string, unknown> | null;

            const url =
                toOptionalString(value.url) ||
                toOptionalString(value.buyLink) ||
                toOptionalString(value.buy_link) ||
                toOptionalString(value.ebayUrl);

            const imageUrl =
                toOptionalString(value.imageUrl) ||
                toOptionalString(value.image_url) ||
                toOptionalString(value.image);

            return {
                name,
                category,
                price: parseNumber(value.price ?? value.salePrice ?? value.amount),
                url,
                imageUrl,
                specifications: toJsonValue(specs),
            } satisfies IncomingPart;
        })
        .filter((part): part is IncomingPart => part !== null);
};

const serializePart = (part: any) => ({
    id: part.id,
    name: part.name,
    category: normalizeCategory(part.category),
    price: Number(part.price || 0),
    url: part.url ?? null,
    image_url: part.imageUrl ?? null,
    imageUrl: part.imageUrl ?? null,
    specs: part.specifications ?? {},
    specifications: part.specifications ?? {},
});

const serializeBuild = (build: any) => {
    const serializedParts: Array<ReturnType<typeof serializePart>> = Array.isArray(build.parts)
        ? build.parts.map(serializePart)
        : [];
    const partsByCategory: Record<string, ReturnType<typeof serializePart>> = {};
    serializedParts.forEach((part) => {
        partsByCategory[part.category] = part;
    });

    return {
        id: build.id,
        name: build.name,
        description: build.description,
        total_price: Number(build.totalPrice || 0),
        totalPrice: Number(build.totalPrice || 0),
        image_url: build.imageUrl ?? null,
        imageUrl: build.imageUrl ?? null,
        is_public: Boolean(build.isPublic),
        is_featured: Boolean(build.isFeatured),
        likes: build.likesCount ?? 0,
        likes_count: build.likesCount ?? 0,
        created_at: build.createdAt?.toISOString?.() ?? build.createdAt,
        updated_at: build.updatedAt?.toISOString?.() ?? build.updatedAt,
        username: build.user?.username ?? null,
        user: build.user
            ? {
                id: build.user.id,
                username: build.user.username,
                email: build.user.email ?? null,
            }
            : null,
        parts: partsByCategory,
        parts_list: serializedParts,
        parts_count: serializedParts.length,
    };
};

const getSortOrder = (sort: string) => {
    switch (sort) {
        case 'popular':
            return { likesCount: 'desc' as const };
        case 'price_low':
            return { totalPrice: 'asc' as const };
        case 'price_high':
            return { totalPrice: 'desc' as const };
        case 'recent':
        default:
            return { createdAt: 'desc' as const };
    }
};

const parseLimit = (value: unknown, fallback: number, max: number) => {
    const parsed = Number.parseInt(String(value ?? fallback), 10);
    if (!Number.isFinite(parsed) || parsed < 1) {
        return fallback;
    }
    return Math.min(parsed, max);
};

const computeTotalPrice = (provided: unknown, parts: IncomingPart[]) => {
    const explicit = parseNumber(provided);
    if (explicit > 0) {
        return explicit;
    }
    return parts.reduce((sum, part) => sum + part.price, 0);
};

const buildInclude = {
    parts: true,
    user: {
        select: {
            id: true,
            username: true,
            email: true,
        },
    },
};

/**
 * GET /api/builds/community
 * List public community builds
 */
router.get('/community', optionalAuth, async (req: Request, res: Response) => {
    try {
        const sort = typeof req.query.sort === 'string' ? req.query.sort : 'recent';
        const limit = parseLimit(req.query.limit, 20, 50);
        const offset = Math.max(Number.parseInt(String(req.query.offset ?? 0), 10) || 0, 0);

        const [builds, total] = await Promise.all([
            prisma.build.findMany({
                where: { isPublic: true },
                include: buildInclude,
                orderBy: getSortOrder(sort),
                skip: offset,
                take: limit,
            }),
            prisma.build.count({
                where: { isPublic: true },
            }),
        ]);

        const serialized = builds.map(serializeBuild);
        res.json({
            builds: serialized,
            total,
            has_more: offset + serialized.length < total,
        });
    } catch (error) {
        console.error('Error fetching community builds:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch community builds',
        });
    }
});

/**
 * GET /api/builds/featured
 * List featured public builds
 */
router.get('/featured', optionalAuth, async (_req: Request, res: Response) => {
    try {
        const builds = await prisma.build.findMany({
            where: { isPublic: true, isFeatured: true },
            include: buildInclude,
            orderBy: [{ likesCount: 'desc' }, { createdAt: 'desc' }],
            take: 12,
        });

        res.json({
            success: true,
            builds: builds.map(serializeBuild),
        });
    } catch (error) {
        console.error('Error fetching featured builds:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch featured builds',
        });
    }
});

/**
 * POST /api/builds/calculate-score
 * Lightweight benchmark score calculator
 */
router.post('/calculate-score', async (req: Request, res: Response) => {
    try {
        const cpuScore = Math.max(parseNumber(req.body?.cpu_score), 0);
        const gpuScore = Math.max(parseNumber(req.body?.gpu_score), 0);

        const nexusPowerScore = Math.round((gpuScore * 0.7) + (cpuScore * 0.3));
        const bottleneckDetected =
            cpuScore > 0 &&
            gpuScore > 0 &&
            Math.abs(cpuScore - gpuScore) / Math.max(cpuScore, gpuScore) > 0.4;

        res.json({
            nexus_power_score: nexusPowerScore,
            cpu_score: cpuScore,
            gpu_score: gpuScore,
            bottleneck_detected: bottleneckDetected,
        });
    } catch (error) {
        console.error('Error calculating build score:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to calculate build score',
        });
    }
});

/**
 * GET /api/builds
 * List all builds for the authenticated user
 */
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId!;

        const builds = await prisma.build.findMany({
            where: { userId },
            include: buildInclude,
            orderBy: { createdAt: 'desc' },
        });

        res.json({
            success: true,
            builds: builds.map(serializeBuild),
            count: builds.length,
        });
    } catch (error) {
        console.error('Error fetching builds:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch builds',
        });
    }
});

/**
 * POST /api/builds
 * Create a new build
 */
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId!;
        const parts = normalizeIncomingParts(req.body?.parts);
        const totalPrice = computeTotalPrice(req.body?.totalPrice ?? req.body?.total_price, parts);
        const name = typeof req.body?.name === 'string' && req.body.name.trim().length > 0
            ? req.body.name.trim()
            : 'My Build';
        const description = toOptionalString(req.body?.description);

        const validation = validateBuild({ name, description, totalPrice });
        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                error: validation.errors.join(', '),
            });
        }

        const build = await prisma.$transaction(async (tx) => {
            const createdBuild = await tx.build.create({
                data: {
                    userId,
                    name,
                    description,
                    totalPrice,
                    imageUrl: toOptionalString(req.body?.imageUrl ?? req.body?.image_url),
                    isPublic: typeof req.body?.isPublic === 'boolean'
                        ? req.body.isPublic
                        : typeof req.body?.is_public === 'boolean'
                            ? req.body.is_public
                            : true,
                },
            });

            if (parts.length > 0) {
                await tx.part.createMany({
                    data: parts.map((part) => ({
                        buildId: createdBuild.id,
                        name: part.name,
                        category: part.category,
                        price: part.price,
                        url: part.url ?? null,
                        imageUrl: part.imageUrl ?? null,
                        specifications: part.specifications ?? undefined,
                    })),
                });
            }

            return tx.build.findUniqueOrThrow({
                where: { id: createdBuild.id },
                include: buildInclude,
            });
        });

        res.status(201).json({
            success: true,
            build: serializeBuild(build),
            message: 'Build created successfully',
        });
    } catch (error) {
        console.error('Error creating build:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create build',
        });
    }
});

/**
 * POST /api/builds/sync
 * Sync local builds into the authenticated account
 */
router.post('/sync', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId!;
        const localBuilds = Array.isArray(req.body?.local_builds) ? req.body.local_builds : [];
        let created = 0;
        let updated = 0;

        for (const rawBuild of localBuilds) {
            if (!rawBuild || typeof rawBuild !== 'object') {
                continue;
            }

            const build = rawBuild as Record<string, unknown>;
            const name = typeof build.name === 'string' && build.name.trim().length > 0
                ? build.name.trim()
                : null;
            if (!name) {
                continue;
            }

            const parts = normalizeIncomingParts(build.parts);
            const totalPrice = computeTotalPrice(build.totalPrice ?? build.total_price, parts);

            const existing = await prisma.build.findFirst({
                where: {
                    userId,
                    name,
                },
            });

            if (!existing) {
                await prisma.build.create({
                    data: {
                        userId,
                        name,
                        description: toOptionalString(build.description),
                        totalPrice,
                        imageUrl: toOptionalString(build.imageUrl ?? build.image_url),
                        isPublic: typeof build.is_public === 'boolean' ? build.is_public : true,
                        parts: {
                            create: parts.map((part) => ({
                                name: part.name,
                                category: part.category,
                                price: part.price,
                                url: part.url ?? null,
                                imageUrl: part.imageUrl ?? null,
                                specifications: part.specifications ?? undefined,
                            })),
                        },
                    },
                });
                created += 1;
                continue;
            }

            await prisma.$transaction(async (tx) => {
                await tx.part.deleteMany({
                    where: { buildId: existing.id },
                });

                await tx.build.update({
                    where: { id: existing.id },
                    data: {
                        description: toOptionalString(build.description),
                        totalPrice,
                        imageUrl: toOptionalString(build.imageUrl ?? build.image_url),
                        isPublic: typeof build.is_public === 'boolean' ? build.is_public : existing.isPublic,
                    },
                });

                if (parts.length > 0) {
                    await tx.part.createMany({
                        data: parts.map((part) => ({
                            buildId: existing.id,
                            name: part.name,
                            category: part.category,
                            price: part.price,
                            url: part.url ?? null,
                            imageUrl: part.imageUrl ?? null,
                            specifications: part.specifications ?? undefined,
                        })),
                    });
                }
            });

            updated += 1;
        }

        const syncedBuilds = await prisma.build.findMany({
            where: { userId },
            include: buildInclude,
            orderBy: { createdAt: 'desc' },
        });

        res.json({
            success: true,
            builds: syncedBuilds.map(serializeBuild),
            stats: {
                total: created + updated,
                created,
                updated,
            },
        });
    } catch (error) {
        console.error('Error syncing builds:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to sync builds',
        });
    }
});

/**
 * GET /api/builds/:id
 * Get a single build with all parts
 */
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId!;
        const buildId = Number.parseInt(req.params.id, 10);

        if (Number.isNaN(buildId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid build ID',
            });
        }

        const build = await prisma.build.findFirst({
            where: {
                id: buildId,
                userId,
            },
            include: buildInclude,
        });

        if (!build) {
            return res.status(404).json({
                success: false,
                error: 'Build not found or access denied',
            });
        }

        res.json({
            success: true,
            build: serializeBuild(build),
        });
    } catch (error) {
        console.error('Error fetching build:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch build',
        });
    }
});

/**
 * POST /api/builds/:id/like
 * Increment a build like counter
 */
router.post('/:id/like', optionalAuth, async (req: Request, res: Response) => {
    try {
        const buildId = Number.parseInt(req.params.id, 10);

        if (Number.isNaN(buildId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid build ID',
            });
        }

        const build = await prisma.build.update({
            where: { id: buildId },
            data: {
                likesCount: {
                    increment: 1,
                },
            },
            include: buildInclude,
        });

        res.json({
            success: true,
            build: serializeBuild(build),
        });
    } catch (error) {
        console.error('Error liking build:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to like build',
        });
    }
});

/**
 * POST /api/builds/:id/clone
 * Clone a public build into the authenticated account
 */
router.post('/:id/clone', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId!;
        const buildId = Number.parseInt(req.params.id, 10);

        if (Number.isNaN(buildId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid build ID',
            });
        }

        const sourceBuild = await prisma.build.findFirst({
            where: {
                id: buildId,
                isPublic: true,
            },
            include: {
                parts: true,
            },
        });

        if (!sourceBuild) {
            return res.status(404).json({
                success: false,
                error: 'Build not found',
            });
        }

        const cloned = await prisma.build.create({
            data: {
                userId,
                name: `${sourceBuild.name} Copy`,
                description: sourceBuild.description,
                totalPrice: sourceBuild.totalPrice,
                imageUrl: sourceBuild.imageUrl,
                isPublic: false,
                parts: {
                    create: sourceBuild.parts.map((part) => ({
                        name: part.name,
                        category: part.category,
                        price: part.price,
                        url: part.url,
                        imageUrl: part.imageUrl,
                        specifications: part.specifications ?? undefined,
                    })),
                },
            },
            include: buildInclude,
        });

        res.status(201).json({
            success: true,
            build: serializeBuild(cloned),
        });
    } catch (error) {
        console.error('Error cloning build:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to clone build',
        });
    }
});

/**
 * PUT /api/builds/:id
 * Update an existing build
 */
router.put('/:id', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId!;
        const buildId = Number.parseInt(req.params.id, 10);

        if (Number.isNaN(buildId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid build ID',
            });
        }

        const existingBuild = await prisma.build.findFirst({
            where: { id: buildId, userId },
        });

        if (!existingBuild) {
            return res.status(404).json({
                success: false,
                error: 'Build not found or access denied',
            });
        }

        const parts = normalizeIncomingParts(req.body?.parts);
        const name = typeof req.body?.name === 'string' && req.body.name.trim().length > 0
            ? req.body.name.trim()
            : existingBuild.name;
        const description = toOptionalString(req.body?.description);
        const totalPrice = computeTotalPrice(req.body?.totalPrice ?? req.body?.total_price, parts);

        const validation = validateBuild({ name, description, totalPrice });
        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                error: validation.errors.join(', '),
            });
        }

        const updatedBuild = await prisma.$transaction(async (tx) => {
            if (req.body?.parts !== undefined) {
                await tx.part.deleteMany({
                    where: { buildId },
                });
            }

            await tx.build.update({
                where: { id: buildId },
                data: {
                    name,
                    description,
                    totalPrice,
                    imageUrl: toOptionalString(req.body?.imageUrl ?? req.body?.image_url),
                    isPublic: typeof req.body?.isPublic === 'boolean'
                        ? req.body.isPublic
                        : typeof req.body?.is_public === 'boolean'
                            ? req.body.is_public
                            : existingBuild.isPublic,
                },
            });

            if (req.body?.parts !== undefined && parts.length > 0) {
                await tx.part.createMany({
                    data: parts.map((part) => ({
                        buildId,
                        name: part.name,
                        category: part.category,
                        price: part.price,
                        url: part.url ?? null,
                        imageUrl: part.imageUrl ?? null,
                        specifications: part.specifications ?? undefined,
                    })),
                });
            }

            return tx.build.findUniqueOrThrow({
                where: { id: buildId },
                include: buildInclude,
            });
        });

        res.json({
            success: true,
            build: serializeBuild(updatedBuild),
            message: 'Build updated successfully',
        });
    } catch (error) {
        console.error('Error updating build:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update build',
        });
    }
});

/**
 * DELETE /api/builds/:id
 * Delete a build and all associated parts
 */
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId!;
        const buildId = Number.parseInt(req.params.id, 10);

        if (Number.isNaN(buildId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid build ID',
            });
        }

        const existingBuild = await prisma.build.findFirst({
            where: { id: buildId, userId },
        });

        if (!existingBuild) {
            return res.status(404).json({
                success: false,
                error: 'Build not found or access denied',
            });
        }

        await prisma.build.delete({
            where: { id: buildId },
        });

        res.json({
            success: true,
            message: 'Build deleted successfully',
        });
    } catch (error) {
        console.error('Error deleting build:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete build',
        });
    }
});

export default router;
