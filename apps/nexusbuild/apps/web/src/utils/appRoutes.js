const ROUTE_SEGMENTS = new Set([
    'builder',
    'builds',
    'login',
    'register',
    'deals',
    'guide',
    'about',
    'privacy',
    'terms',
    'disclosure',
    'cookie',
    'contact',
    'testers',
    'demo',
    'apps',
    'admin',
    'moderator',
]);

export const resolveAppRootPath = (pathname = '/') => {
    const segments = pathname.split('/').filter(Boolean);
    const routeIndex = segments.findIndex((segment) => ROUTE_SEGMENTS.has(segment));
    const rootSegments = routeIndex === -1 ? segments : segments.slice(0, routeIndex);

    if (rootSegments.length === 0) {
        return '/';
    }

    return `/${rootSegments.join('/')}/`;
};

export const buildAppPath = (pathname, targetPath = '') => {
    const root = resolveAppRootPath(pathname);
    const normalizedTarget = String(targetPath).replace(/^\/+/, '');
    return `${root}${normalizedTarget}`;
};

export default buildAppPath;
