import { useMemo } from 'react';
import appsCatalogData from '@shared/constants/appsCatalog.json';

const { appCatalog, appCatalogBySlug } = appsCatalogData;
const getAppBySlug = (slug) => appCatalogBySlug?.[String(slug ?? '').trim().toLowerCase()] || null;

export function useAppMedia(slug) {
    return useMemo(() => {
        const requested = getAppBySlug(slug);
        const fallback = appCatalog[0] || null;
        const app = requested || fallback;

        if (!app) {
            return {
                app: null,
                heroImage: null,
                gallery: [],
                videoUrl: null,
                features: [],
                statusLabel: 'Unknown',
                isFallback: false,
                missing: true,
            };
        }

        const media = app.media || {};

        return {
            app,
            heroImage: media.heroImage || app.heroImage || null,
            gallery: Array.isArray(media.gallery) ? media.gallery : [],
            videoUrl: media.videoUrl || null,
            features: Array.isArray(app.features) ? app.features : [],
            statusLabel: app.statusLabel || app.status || 'Preview',
            isFallback: !requested,
            missing: !requested && slug ? true : false,
        };
    }, [slug]);
}

export default useAppMedia;
