import assert from 'node:assert/strict';
import { after, beforeEach, describe, it } from 'node:test';
import express from 'express';
import { createTestersRouter } from '../src/routes/testers';

type TesterRecord = {
    id: number;
    email: string;
    name: string;
    appSlug: string | null;
    reason: string;
    status: 'pending' | 'approved' | 'denied';
    adminNotes: string;
    createdAt: Date;
    updatedAt: Date;
};

const catalog = [
    {
        slug: 'nexusbuild',
        name: 'NexusBuild',
        tagline: 'Plan the build. Price the parts. Ship the rig.',
        status: 'LIVE',
        accent: '#00d4ff',
    },
    {
        slug: 'provly',
        name: 'ProvLy',
        tagline: 'See what you own before you need it.',
        status: 'BETA',
        accent: '#38bdf8',
    },
];

const createStore = () => {
    const testers: TesterRecord[] = [];
    let nextId = 1;

    return {
        testers,
        nextId,
        prisma: {
            nstepTester: {
                findFirst: async ({ where }: any) =>
                    testers.find(
                        (tester) =>
                            tester.email === where?.email &&
                            tester.appSlug === (Object.hasOwn(where || {}, 'appSlug') ? where.appSlug : tester.appSlug)
                    ) || null,
                findMany: async () => [...testers],
                findUnique: async ({ where }: any) => testers.find((tester) => tester.id === where?.id) || null,
                create: async ({ data }: any) => {
                    const row: TesterRecord = {
                        id: nextId++,
                        email: data.email,
                        name: data.name,
                        appSlug: data.appSlug ?? null,
                        reason: data.reason ?? '',
                        status: data.status ?? 'pending',
                        adminNotes: data.adminNotes ?? '',
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    };
                    testers.push(row);
                    return row;
                },
                update: async ({ where, data }: any) => {
                    const index = testers.findIndex((tester) => tester.id === where?.id);
                    if (index < 0) {
                        throw new Error('Tester not found');
                    }

                    testers[index] = {
                        ...testers[index],
                        ...data,
                        updatedAt: new Date(),
                    };

                    return testers[index];
                },
                delete: async ({ where }: any) => {
                    const index = testers.findIndex((tester) => tester.id === where?.id);
                    if (index < 0) {
                        throw new Error('Tester not found');
                    }

                    const [deleted] = testers.splice(index, 1);
                    return deleted;
                },
            },
        },
    };
};

const createServer = (store = createStore()) => {
    const emails: Array<{ to: string | string[]; subject: string; html: string; text: string }> = [];
    const app = express();
    app.use(express.json());
    app.use(
        '/api',
        createTestersRouter({
            prisma: store.prisma,
            adminGuard: (_req, _res, next) => next(),
            catalog,
            siteUrl: 'https://northernstepstudio.com/apps/nexusbuild/app/',
            sendEmail: async (payload) => {
                emails.push(payload);
                return { id: `email_${emails.length}` };
            },
        })
    );

    const server = app.listen(0);
    const address = server.address();
    if (!address || typeof address === 'string') {
        throw new Error('Failed to start test server');
    }

    const baseUrl = `http://127.0.0.1:${address.port}`;

    return {
        server,
        baseUrl,
        emails,
        store,
    };
};

let current = createServer();

beforeEach(() => {
    current.server.close();
    current = createServer();
});

after(() => {
    current.server.close();
});

const requestJson = async (path: string, init?: RequestInit) => {
    const response = await fetch(`${current.baseUrl}${path}`, {
        ...init,
        headers: {
            'Content-Type': 'application/json',
            ...(init?.headers || {}),
        },
    });
    const text = await response.text();
    const body = text ? JSON.parse(text) : null;
    return { response, body };
};

describe('tester pipeline routes', () => {
    it('creates tester requests and sends notification email', async () => {
        const { response, body } = await requestJson('/api/testers', {
            method: 'POST',
            body: JSON.stringify({
                email: 'tester@example.com',
                name: 'Jane Tester',
                app_slug: 'nexusbuild',
                reason: 'Need to validate the build flow',
            }),
        });

        assert.equal(response.status, 201);
        assert.equal(body.tester.email, 'tester@example.com');
        assert.equal(body.tester.app_slug, 'nexusbuild');
        assert.equal(current.emails.length, 1);
        assert.match(current.emails[0].subject, /Tester request/);
        assert.match(current.emails[0].html, /admin\/testers/);
    });

    it('rejects invalid tester payloads', async () => {
        const { response, body } = await requestJson('/api/testers', {
            method: 'POST',
            body: JSON.stringify({
                email: 'invalid-email',
                name: '',
                app_slug: 'nexusbuild',
            }),
        });

        assert.equal(response.status, 400);
        assert.match(body.message, /Email and name are required|Invalid email address/);
    });

    it('lists, filters, and updates tester requests for admins', async () => {
        await requestJson('/api/testers', {
            method: 'POST',
            body: JSON.stringify({
                email: 'alpha@example.com',
                name: 'Alpha',
                app_slug: 'nexusbuild',
                reason: 'First request',
            }),
        });
        await requestJson('/api/testers', {
            method: 'POST',
            body: JSON.stringify({
                email: 'beta@example.com',
                name: 'Beta',
                app_slug: 'provly',
                reason: 'Second request',
            }),
        });

        const list = await requestJson('/api/admin/testers?status=pending&app_slug=nexusbuild');
        assert.equal(list.response.status, 200);
        assert.equal(list.body.testers.length, 1);
        assert.equal(list.body.testers[0].app_slug, 'nexusbuild');

        const update = await requestJson('/api/admin/testers/1', {
            method: 'PATCH',
            body: JSON.stringify({
                status: 'approved',
                admin_notes: 'Looks good',
            }),
        });

        assert.equal(update.response.status, 200);
        assert.equal(update.body.tester.status, 'approved');
        assert.equal(current.emails.length, 3);
        assert.match(current.emails[2].subject, /Approved/);

        const stats = await requestJson('/api/admin/testers/stats');
        assert.equal(stats.response.status, 200);
        assert.equal(stats.body.total, 2);
        assert.equal(stats.body.approved, 1);
        assert.ok(Array.isArray(stats.body.by_app));
        assert.ok(stats.body.by_app.some((bucket: any) => bucket.app_label === 'NexusBuild'));
    });

    it('deletes tester requests', async () => {
        await requestJson('/api/testers', {
            method: 'POST',
            body: JSON.stringify({
                email: 'delete@example.com',
                name: 'Delete Me',
                app_slug: 'nexusbuild',
                reason: 'Cleanup test',
            }),
        });

        const remove = await requestJson('/api/admin/testers/1', {
            method: 'DELETE',
        });

        assert.equal(remove.response.status, 200);
        assert.equal(current.store.testers.length, 0);
    });
});
