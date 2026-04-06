const args = process.argv.slice(2);

const readArg = (name) => {
    const index = args.indexOf(name);
    if (index >= 0 && index + 1 < args.length) {
        return args[index + 1];
    }

    const inline = args.find((arg) => arg.startsWith(`${name}=`));
    return inline ? inline.slice(name.length + 1) : null;
};

const readBool = (value, fallback = true) => {
    if (value == null) {
        return fallback;
    }
    const normalized = String(value).trim().toLowerCase();
    if (['0', 'false', 'no', 'off'].includes(normalized)) {
        return false;
    }
    if (['1', 'true', 'yes', 'on'].includes(normalized)) {
        return true;
    }
    return fallback;
};

const baseUrl = (
    readArg('--base-url') ||
    process.env.NEXUSBUILD_SMOKE_BASE_URL ||
    'http://127.0.0.1:3000/api'
).replace(/\/$/, '');

const adminEmail = readArg('--admin-email') || process.env.NEXUSBUILD_SMOKE_ADMIN_EMAIL || null;
const adminPassword = readArg('--admin-password') || process.env.NEXUSBUILD_SMOKE_ADMIN_PASSWORD || null;
const cleanupEnabled = readBool(
    readArg('--cleanup') ?? process.env.NEXUSBUILD_SMOKE_CLEANUP,
    true
);

const user1 = {
    username: readArg('--user1-username') || process.env.NEXUSBUILD_SMOKE_USER1_USERNAME || 'smoke_user',
    email: readArg('--user1-email') || process.env.NEXUSBUILD_SMOKE_USER1_EMAIL || 'smoke_user@nexusbuild.test',
    password: readArg('--user1-password') || process.env.NEXUSBUILD_SMOKE_USER1_PASSWORD || 'SmokePass123!',
};

const user2 = {
    username: readArg('--user2-username') || process.env.NEXUSBUILD_SMOKE_USER2_USERNAME || 'smoke_peer',
    email: readArg('--user2-email') || process.env.NEXUSBUILD_SMOKE_USER2_EMAIL || 'smoke_peer@nexusbuild.test',
    password: readArg('--user2-password') || process.env.NEXUSBUILD_SMOKE_USER2_PASSWORD || 'SmokePass123!',
};

async function request(path, { method = 'GET', token, body, headers = {} } = {}) {
    const response = await fetch(`${baseUrl}${path}`, {
        method,
        headers: {
            ...(body ? { 'Content-Type': 'application/json' } : {}),
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
    });

    const text = await response.text();
    let json = null;
    try {
        json = text ? JSON.parse(text) : null;
    } catch {
        json = null;
    }

    return {
        status: response.status,
        ok: response.ok,
        json,
        text,
    };
}

function assert(condition, message, payload) {
    if (!condition) {
        const error = new Error(message);
        error.payload = payload;
        throw error;
    }
}

async function registerOrLogin(steps, stepName, user) {
    const registration = await request('/auth/register', {
        method: 'POST',
        body: user,
    });

    steps.push({
        step: stepName,
        status: registration.status,
        role: registration.json?.user?.role || null,
    });

    if (registration.status === 201 && registration.json?.token) {
        return {
            token: registration.json.token,
            user: registration.json.user,
            mode: 'registered',
        };
    }

    if (registration.status === 409) {
        const login = await request('/auth/login', {
            method: 'POST',
            body: { email: user.email, password: user.password },
        });

        steps.push({
            step: `${stepName}Login`,
            status: login.status,
            role: login.json?.user?.role || null,
        });

        assert(login.ok && login.json?.token, `${stepName} login fallback failed`, login);

        return {
            token: login.json.token,
            user: login.json.user,
            mode: 'existing',
        };
    }

    assert(false, `${stepName} failed`, registration);
}

async function runAdminFlow(steps, user2Id, reportId) {
    if (!adminEmail || !adminPassword) {
        steps.push({
            step: 'adminFlow',
            skipped: true,
            reason: 'Provide --admin-email and --admin-password to validate admin endpoints.',
        });
        return { adminToken: null };
    }

    const adminAuth = await request('/auth/login', {
        method: 'POST',
        body: { email: adminEmail, password: adminPassword },
    });
    steps.push({ step: 'adminAuth', status: adminAuth.status, role: adminAuth.json?.user?.role });
    assert(adminAuth.ok && adminAuth.json?.token, 'Admin auth failed', adminAuth);
    const adminToken = adminAuth.json.token;

    const adminStats = await request('/admin/stats', { token: adminToken });
    steps.push({ step: 'adminStats', status: adminStats.status, users: adminStats.json?.users });
    assert(adminStats.ok, 'Admin stats failed', adminStats);

    const adminUsers = await request('/admin/users', { token: adminToken });
    steps.push({ step: 'adminUsers', status: adminUsers.status, count: adminUsers.json?.length });
    assert(adminUsers.ok && Array.isArray(adminUsers.json), 'Admin users failed', adminUsers);

    const promoteUser = await request(`/admin/users/${user2Id}`, {
        method: 'PATCH',
        token: adminToken,
        body: { is_moderator: true },
    });
    steps.push({ step: 'promoteUser', status: promoteUser.status, isModerator: promoteUser.json?.user?.is_moderator });
    assert(promoteUser.ok && promoteUser.json?.user?.is_moderator === true, 'Admin user update failed', promoteUser);

    const adminBuilds = await request('/admin/builds', { token: adminToken });
    steps.push({ step: 'adminBuilds', status: adminBuilds.status, count: adminBuilds.json?.length });
    assert(adminBuilds.ok && Array.isArray(adminBuilds.json), 'Admin builds failed', adminBuilds);

    const adminReports = await request('/reports', { token: adminToken });
    steps.push({ step: 'adminReports', status: adminReports.status, count: adminReports.json?.length });
    assert(adminReports.ok && Array.isArray(adminReports.json), 'Admin reports failed', adminReports);

    const updateReport = await request(`/reports/${reportId}`, {
        method: 'PATCH',
        token: adminToken,
        body: { status: 'resolved', priority: 'high', admin_notes: 'Smoke test verified' },
    });
    steps.push({ step: 'updateReport', status: updateReport.status, reportStatus: updateReport.json?.report?.status });
    assert(updateReport.ok && updateReport.json?.report?.status === 'resolved', 'Admin report update failed', updateReport);

    return { adminToken };
}

async function cleanupSmokeData(steps, runtime) {
    if (!cleanupEnabled) {
        steps.push({
            step: 'cleanup',
            skipped: true,
            reason: 'Cleanup disabled.',
        });
        return;
    }

    const failures = [];

    if (runtime.cloneBuildId && runtime.token2) {
        const deleteClone = await request(`/builds/${runtime.cloneBuildId}`, {
            method: 'DELETE',
            token: runtime.token2,
        });
        steps.push({ step: 'cleanupCloneBuild', status: deleteClone.status });
        if (!(deleteClone.ok || deleteClone.status === 404)) {
            failures.push({ message: 'Failed to delete cloned build', payload: deleteClone });
        }
    }

    if (runtime.buildId && runtime.token1) {
        const deleteBuild = await request(`/builds/${runtime.buildId}`, {
            method: 'DELETE',
            token: runtime.token1,
        });
        steps.push({ step: 'cleanupBuild', status: deleteBuild.status });
        if (!(deleteBuild.ok || deleteBuild.status === 404)) {
            failures.push({ message: 'Failed to delete primary build', payload: deleteBuild });
        }
    }

    if (runtime.reportId && runtime.adminToken) {
        const deleteReport = await request(`/reports/${runtime.reportId}`, {
            method: 'DELETE',
            token: runtime.adminToken,
        });
        steps.push({ step: 'cleanupReport', status: deleteReport.status });
        if (!(deleteReport.ok || deleteReport.status === 404)) {
            failures.push({ message: 'Failed to delete smoke report', payload: deleteReport });
        }
    } else if (runtime.reportId) {
        steps.push({
            step: 'cleanupReport',
            skipped: true,
            reason: 'Admin credentials unavailable; report cleanup skipped.',
        });
    }

    if (failures.length > 0) {
        const error = new Error(failures[0].message);
        error.payload = failures[0].payload;
        throw error;
    }
}

async function main() {
    const steps = [];
    const runtime = {
        token1: null,
        token2: null,
        adminToken: null,
        buildId: null,
        cloneBuildId: null,
        reportId: null,
    };

    let caughtError = null;

    try {
        const health = await request('/health');
        steps.push({ step: 'health', status: health.status });
        assert(health.ok, 'Health check failed', health);

        const auth1 = await registerOrLogin(steps, 'register1', user1);
        runtime.token1 = auth1.token;

        const me1 = await request('/auth/me', { token: runtime.token1 });
        steps.push({ step: 'me1', status: me1.status, username: me1.json?.username });
        assert(me1.ok && me1.json?.email === user1.email, 'Auth me failed', me1);

        const update1 = await request('/auth/update', {
            method: 'PUT',
            token: runtime.token1,
            body: { bio: 'Smoke bio', avatar_frame: 'pro', is_public_profile: true },
        });
        steps.push({ step: 'update1', status: update1.status, bio: update1.json?.user?.bio });
        assert(update1.ok && update1.json?.user?.bio === 'Smoke bio', 'Profile update failed', update1);

        const createBuild = await request('/builds', {
            method: 'POST',
            token: runtime.token1,
            body: {
                name: 'Smoke Build',
                description: 'Local smoke build',
                is_public: true,
                parts: {
                    cpu: { name: 'AMD Ryzen 7 7800X3D', category: 'cpu', price: 379.99 },
                    gpu: { name: 'NVIDIA RTX 4080 SUPER', category: 'gpu', price: 999.99 },
                    ram: { name: 'Corsair Vengeance DDR5 32GB', category: 'ram', price: 119.99 },
                },
            },
        });
        steps.push({ step: 'createBuild', status: createBuild.status, buildId: createBuild.json?.build?.id });
        assert(createBuild.status === 201, 'Build creation failed', createBuild);
        runtime.buildId = createBuild.json.build.id;

        const myBuilds = await request('/builds', { token: runtime.token1 });
        steps.push({ step: 'myBuilds', status: myBuilds.status, count: myBuilds.json?.count });
        assert(myBuilds.ok && myBuilds.json?.count >= 1, 'List builds failed', myBuilds);

        const getBuild = await request(`/builds/${runtime.buildId}`, { token: runtime.token1 });
        steps.push({ step: 'getBuild', status: getBuild.status, parts: getBuild.json?.build?.parts_count });
        assert(getBuild.ok && getBuild.json?.build?.id === runtime.buildId, 'Get build failed', getBuild);

        const updateBuild = await request(`/builds/${runtime.buildId}`, {
            method: 'PUT',
            token: runtime.token1,
            body: {
                name: 'Smoke Build Updated',
                description: 'Updated build',
                is_public: true,
                parts: {
                    cpu: { name: 'AMD Ryzen 7 7800X3D', category: 'cpu', price: 379.99 },
                    gpu: { name: 'NVIDIA RTX 4080 SUPER', category: 'gpu', price: 989.99 },
                },
            },
        });
        steps.push({ step: 'updateBuild', status: updateBuild.status, total: updateBuild.json?.build?.total_price });
        assert(updateBuild.ok && updateBuild.json?.build?.name === 'Smoke Build Updated', 'Update build failed', updateBuild);

        const community = await request('/builds/community');
        steps.push({ step: 'community', status: community.status, total: community.json?.total });
        assert(community.ok && Array.isArray(community.json?.builds), 'Community builds failed', community);

        const likeBuild = await request(`/builds/${runtime.buildId}/like`, { method: 'POST' });
        steps.push({ step: 'likeBuild', status: likeBuild.status, likes: likeBuild.json?.build?.likes });
        assert(likeBuild.ok, 'Like build failed', likeBuild);

        const auth2 = await registerOrLogin(steps, 'register2', user2);
        runtime.token2 = auth2.token;
        const user2Id = auth2.user.id;

        const cloneBuild = await request(`/builds/${runtime.buildId}/clone`, {
            method: 'POST',
            token: runtime.token2,
        });
        steps.push({ step: 'cloneBuild', status: cloneBuild.status, cloneId: cloneBuild.json?.build?.id });
        assert(cloneBuild.status === 201, 'Clone build failed', cloneBuild);
        runtime.cloneBuildId = cloneBuild.json.build.id;

        const report = await request('/reports', {
            method: 'POST',
            token: runtime.token1,
            body: { description: 'Smoke test report', category: 'bug', email: user1.email },
        });
        steps.push({ step: 'report', status: report.status, reportId: report.json?.report?.id });
        assert(report.status === 201, 'Report creation failed', report);
        runtime.reportId = report.json.report.id;

        const myReports = await request('/reports/my', { token: runtime.token1 });
        steps.push({ step: 'myReports', status: myReports.status, count: myReports.json?.length });
        assert(myReports.ok && Array.isArray(myReports.json) && myReports.json.length >= 1, 'My reports failed', myReports);

        const { adminToken } = await runAdminFlow(steps, user2Id, runtime.reportId);
        runtime.adminToken = adminToken;

        const pricesHealth = await request('/prices/health');
        steps.push({
            step: 'pricesHealth',
            status: pricesHealth.status,
            apifyConnected: pricesHealth.json?.apifyConnected,
            dataSource: pricesHealth.json?.dataSource || null,
        });
        assert(pricesHealth.ok, 'Prices health failed', pricesHealth);

        const trendingCpu = await request('/prices/trending/cpu?limit=2');
        steps.push({
            step: 'trendingCpu',
            status: trendingCpu.status,
            count: trendingCpu.json?.count,
            dataSource: trendingCpu.json?.dataSource || null,
        });
        assert(
            trendingCpu.ok &&
            Array.isArray(trendingCpu.json?.products) &&
            trendingCpu.json.products.length >= 1,
            'Trending CPU prices failed',
            trendingCpu
        );

        const searchCpu = await request('/prices/search?q=7800X3D&category=cpu&limit=2');
        steps.push({
            step: 'searchCpu',
            status: searchCpu.status,
            count: searchCpu.json?.count,
            dataSource: searchCpu.json?.dataSource || null,
        });
        assert(
            searchCpu.ok &&
            Array.isArray(searchCpu.json?.products) &&
            searchCpu.json.products.length >= 1,
            'Price search failed',
            searchCpu
        );
    } catch (error) {
        caughtError = error;
    }

    try {
        await cleanupSmokeData(steps, runtime);
    } catch (cleanupError) {
        if (!caughtError) {
            caughtError = cleanupError;
        } else {
            steps.push({
                step: 'cleanupError',
                status: 'error',
                message: cleanupError.message,
            });
        }
    }

    if (caughtError) {
        console.log(JSON.stringify({
            ok: false,
            baseUrl,
            steps,
            error: caughtError.message,
            payload: caughtError.payload || null,
        }, null, 2));
        process.exit(1);
    }

    console.log(JSON.stringify({ ok: true, baseUrl, steps }, null, 2));
}

await main();
