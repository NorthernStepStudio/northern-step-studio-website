import { Router, Response, RequestHandler } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAdmin } from '../middleware/auth';
import { sanitizeInput, isValidEmail } from '../utils/validation';
import { sendResendEmail } from '../lib/email';
import { testerApprovalEmail, testerRequestNotificationEmail } from '../email-templates';

type TesterStatus = 'pending' | 'approved' | 'denied';

interface TesterRow {
    id: number;
    email: string;
    name: string;
    appSlug: string | null;
    reason: string;
    status: TesterStatus;
    adminNotes: string;
    createdAt: Date;
    updatedAt: Date;
}

interface TesterCatalogEntry {
    slug: string;
    name: string;
    tagline?: string;
    status?: string;
    accent?: string;
}

interface TesterPrisma {
    nstepTester: {
        findFirst: (args: any) => Promise<TesterRow | null>;
        findMany: (args?: any) => Promise<TesterRow[]>;
        findUnique: (args: any) => Promise<TesterRow | null>;
        create: (args: any) => Promise<TesterRow>;
        update: (args: any) => Promise<TesterRow>;
        delete: (args: any) => Promise<TesterRow>;
    };
}

interface TestersRouterDeps {
    prisma?: TesterPrisma;
    adminGuard?: RequestHandler;
    catalog?: TesterCatalogEntry[];
    sendEmail?: typeof sendResendEmail;
    siteUrl?: string;
}

const DEFAULT_SITE_URL =
    process.env.PUBLIC_SITE_URL ||
    process.env.WEB_APP_URL ||
    process.env.FRONTEND_URL ||
    'http://localhost:5173';

let prismaSingleton: PrismaClient | null = null;

const getPrismaClient = () => {
    if (!prismaSingleton) {
        prismaSingleton = new PrismaClient();
    }

    return prismaSingleton;
};

const getCatalog = async (deps: TestersRouterDeps): Promise<TesterCatalogEntry[]> => {
    if (deps.catalog) {
        return deps.catalog;
    }

    return [];
};

const getAppBySlug = (catalog: TesterCatalogEntry[], slug: string | null) =>
    catalog.find((app) => app.slug === slug) || null;

const getAppLabel = (catalog: TesterCatalogEntry[], slug: string | null) =>
    getAppBySlug(catalog, slug)?.name || slug || 'All apps';

const normalizeAppSlug = (value: unknown): string | null => {
    const normalized = String(value ?? '')
        .trim()
        .toLowerCase();

    if (!normalized || normalized === 'all' || normalized === 'all-apps') {
        return null;
    }

    return normalized;
};

const normalizeStatus = (value: unknown): TesterStatus | null => {
    const normalized = String(value ?? '').trim().toLowerCase();
    if (normalized === 'pending' || normalized === 'approved' || normalized === 'denied') {
        return normalized;
    }
    return null;
};

const normalizeSearch = (value: unknown): string => String(value ?? '').trim().toLowerCase();

const normalizeSiteUrl = (value?: string) => {
    const candidate = value || DEFAULT_SITE_URL;
    try {
        const url = new URL(candidate);
        if (!url.pathname.endsWith('/')) {
            url.pathname = `${url.pathname}/`;
        }
        return url.toString();
    } catch {
        return DEFAULT_SITE_URL;
    }
};

const serializeTester = (tester: TesterRow, catalog: TesterCatalogEntry[]) => {
    const app = getAppBySlug(catalog, tester.appSlug);

    return {
        id: tester.id,
        email: tester.email,
        name: tester.name,
        app_slug: tester.appSlug,
        app_label: getAppLabel(catalog, tester.appSlug),
        app: app
            ? {
                  slug: app.slug,
                  name: app.name,
                  tagline: app.tagline || '',
                  status: app.status || '',
                  accent: app.accent || '',
              }
            : null,
        reason: tester.reason || '',
        status: tester.status,
        admin_notes: tester.adminNotes || '',
        created_at: tester.createdAt?.toISOString?.() ?? tester.createdAt,
        updated_at: tester.updatedAt?.toISOString?.() ?? tester.updatedAt,
    };
};

const applyFilters = (
    testers: TesterRow[],
    catalog: TesterCatalogEntry[],
    statusFilter: TesterStatus | null,
    appSlugFilter: string | null | undefined,
    searchFilter: string
) => {
    let filtered = [...testers];

    if (statusFilter) {
        filtered = filtered.filter((tester) => tester.status === statusFilter);
    }

    if (appSlugFilter !== undefined) {
        filtered = filtered.filter((tester) => tester.appSlug === appSlugFilter);
    }

    if (searchFilter) {
        filtered = filtered.filter((tester) => {
            const appLabel = getAppLabel(catalog, tester.appSlug).toLowerCase();
            return (
                tester.email.toLowerCase().includes(searchFilter) ||
                tester.name.toLowerCase().includes(searchFilter) ||
                tester.reason.toLowerCase().includes(searchFilter) ||
                appLabel.includes(searchFilter)
            );
        });
    }

    return filtered.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
};

const getAllTesters = async (prisma: TesterPrisma) => prisma.nstepTester.findMany({});

const sendEmailSafely = async (
    sendEmail: typeof sendResendEmail,
    payload: Parameters<typeof sendResendEmail>[0]
) => {
    try {
        await sendEmail(payload);
    } catch (error) {
        console.error('[testers] email send failed:', error);
    }
};

export function createTestersRouter(deps: TestersRouterDeps = {}) {
    const router = Router();
    const prisma = deps.prisma || (getPrismaClient() as unknown as TesterPrisma);
    const adminGuard = deps.adminGuard || requireAdmin;
    const sendEmail = deps.sendEmail || sendResendEmail;
    const siteUrl = normalizeSiteUrl(deps.siteUrl);

    router.post('/testers', async (req, res: Response) => {
        try {
            const email = String(req.body?.email ?? '').trim().toLowerCase();
            const name = sanitizeInput(String(req.body?.name ?? '')).trim();
            const reason = sanitizeInput(String(req.body?.reason ?? '')).trim();
            const appSlug = normalizeAppSlug(req.body?.app_slug ?? req.body?.appSlug);

            if (!email || !name) {
                return res.status(400).json({ message: 'Email and name are required' });
            }

            if (!isValidEmail(email)) {
                return res.status(400).json({ message: 'Invalid email address' });
            }

            const catalog = await getCatalog(deps);
            if (catalog.length > 0 && appSlug && !getAppBySlug(catalog, appSlug)) {
                return res.status(400).json({ message: 'Unknown app slug' });
            }

            const existing = await prisma.nstepTester.findFirst({
                where: {
                    email,
                    appSlug,
                },
            });

            if (existing) {
                return res.status(409).json({
                    message: 'A tester request already exists for this email and app',
                    tester: serializeTester(existing, catalog),
                });
            }

            const tester = await prisma.nstepTester.create({
                data: {
                    email,
                    name,
                    appSlug,
                    reason,
                    status: 'pending',
                    adminNotes: '',
                },
            });

            const appLabel = getAppLabel(catalog, appSlug);
            const notificationTemplate = testerRequestNotificationEmail({
                email,
                name,
                appSlug,
                appLabel,
                reason,
                siteUrl,
            });
            await sendEmailSafely(sendEmail, {
                to:
                    process.env.TESTER_NOTIFICATION_EMAIL ||
                    process.env.ADMIN_EMAIL ||
                    'admin@nexusbuild.app',
                subject: notificationTemplate.subject,
                html: notificationTemplate.html,
                text: notificationTemplate.text,
                from: process.env.RESEND_FROM_EMAIL || process.env.EMAIL_FROM || undefined,
            });

            return res.status(201).json({
                message: 'Tester request submitted',
                tester: serializeTester(tester, catalog),
            });
        } catch (error) {
            console.error('[testers] create request failed:', error);
            return res.status(500).json({ message: 'Failed to submit tester request' });
        }
    });

    router.get('/admin/testers', adminGuard, async (req, res: Response) => {
        try {
            const catalog = await getCatalog(deps);
            const statusFilter = normalizeStatus(req.query?.status);
            const appSlugRaw = req.query?.app_slug ?? req.query?.appSlug;
            const appSlugFilter =
                appSlugRaw === undefined || appSlugRaw === '' || appSlugRaw === 'all'
                    ? undefined
                    : normalizeAppSlug(appSlugRaw);
            const searchFilter = normalizeSearch(req.query?.search);

            const allTesters = await getAllTesters(prisma);
            const filtered = applyFilters(
                allTesters,
                catalog,
                statusFilter,
                appSlugFilter,
                searchFilter
            );

            return res.json({
                testers: filtered.map((tester) => serializeTester(tester, catalog)),
                count: filtered.length,
            });
        } catch (error) {
            console.error('[testers] list failed:', error);
            return res.status(500).json({ message: 'Failed to load tester requests' });
        }
    });

    router.get('/admin/testers/stats', adminGuard, async (_req, res: Response) => {
        try {
            const catalog = await getCatalog(deps);
            const allTesters = await getAllTesters(prisma);

            const baseStatusCounts = {
                pending: 0,
                approved: 0,
                denied: 0,
            };

            const byApp = new Map<
                string,
                {
                    app_slug: string | null;
                    app_label: string;
                    total: number;
                    pending: number;
                    approved: number;
                    denied: number;
                }
            >();

            const ensureBucket = (slug: string | null) => {
                const key = slug ?? 'all';
                if (!byApp.has(key)) {
                    byApp.set(key, {
                        app_slug: slug,
                        app_label: getAppLabel(catalog, slug),
                        total: 0,
                        pending: 0,
                        approved: 0,
                        denied: 0,
                    });
                }

                return byApp.get(key)!;
            };

            for (const tester of allTesters) {
                const status = tester.status === 'approved' || tester.status === 'denied' ? tester.status : 'pending';
                baseStatusCounts[status] += 1;

                const bucket = ensureBucket(tester.appSlug);
                bucket.total += 1;
                if (status === 'approved') {
                    bucket.approved += 1;
                } else if (status === 'denied') {
                    bucket.denied += 1;
                } else {
                    bucket.pending += 1;
                }
            }

            const byAppList = catalog
                .map(
                    (app) =>
                        byApp.get(app.slug) || {
                            app_slug: app.slug,
                            app_label: app.name,
                            total: 0,
                            pending: 0,
                            approved: 0,
                            denied: 0,
                        }
                )
                .concat(byApp.has('all') ? [byApp.get('all')!] : [])
                .sort((a, b) => b.total - a.total || a.app_label.localeCompare(b.app_label));

            return res.json({
                total: allTesters.length,
                pending: baseStatusCounts.pending,
                approved: baseStatusCounts.approved,
                denied: baseStatusCounts.denied,
                by_app: byAppList,
            });
        } catch (error) {
            console.error('[testers] stats failed:', error);
            return res.status(500).json({ message: 'Failed to load tester stats' });
        }
    });

    router.patch('/admin/testers/:id', adminGuard, async (req, res: Response) => {
        try {
            const id = Number.parseInt(req.params.id, 10);
            if (Number.isNaN(id)) {
                return res.status(400).json({ message: 'Invalid tester id' });
            }

            const status = normalizeStatus(req.body?.status);
            const adminNotes = sanitizeInput(String(req.body?.admin_notes ?? req.body?.adminNotes ?? '')).trim();

            if (!status && !adminNotes) {
                return res.status(400).json({ message: 'No supported updates provided' });
            }

            const catalog = await getCatalog(deps);
            const existing = await prisma.nstepTester.findUnique({ where: { id } });

            if (!existing) {
                return res.status(404).json({ message: 'Tester request not found' });
            }

            const updateData: Record<string, unknown> = {};
            if (status) {
                updateData.status = status;
            }
            if (adminNotes) {
                updateData.adminNotes = adminNotes;
            }

            const updated = await prisma.nstepTester.update({
                where: { id },
                data: updateData,
            });

            if (status === 'approved' && existing.status !== 'approved') {
                const appLabel = getAppLabel(catalog, updated.appSlug);
                const approvalTemplate = testerApprovalEmail({
                    email: updated.email,
                    name: updated.name,
                    appSlug: updated.appSlug,
                    appLabel,
                    reason: updated.reason || '',
                    status: updated.status,
                    adminNotes: updated.adminNotes || '',
                    siteUrl,
                });

                await sendEmailSafely(sendEmail, {
                    to: updated.email,
                    subject: approvalTemplate.subject,
                    html: approvalTemplate.html,
                    text: approvalTemplate.text,
                    from: process.env.RESEND_FROM_EMAIL || process.env.EMAIL_FROM || undefined,
                });
            }

            return res.json({
                message: 'Tester request updated',
                tester: serializeTester(updated, catalog),
            });
        } catch (error) {
            console.error('[testers] update failed:', error);
            return res.status(500).json({ message: 'Failed to update tester request' });
        }
    });

    router.delete('/admin/testers/:id', adminGuard, async (req, res: Response) => {
        try {
            const id = Number.parseInt(req.params.id, 10);
            if (Number.isNaN(id)) {
                return res.status(400).json({ message: 'Invalid tester id' });
            }

            const existing = await prisma.nstepTester.findUnique({ where: { id } });
            if (!existing) {
                return res.status(404).json({ message: 'Tester request not found' });
            }

            await prisma.nstepTester.delete({ where: { id } });

            return res.json({ message: 'Tester request deleted' });
        } catch (error) {
            console.error('[testers] delete failed:', error);
            return res.status(500).json({ message: 'Failed to delete tester request' });
        }
    });

    return router;
}

export default createTestersRouter();
