import { CharacterProject } from '../../../../../packages/nstep-motion-core/src/schema/types';

export const imageCache = new Map<string, HTMLImageElement>();

export function preloadAssets(project: CharacterProject) {
  project.assets?.forEach(a => {
    if (a.type.startsWith('image/')) {
       if (!imageCache.has(a.id)) {
          const img = new Image();
          img.src = a.dataUrl;
          imageCache.set(a.id, img);
       }
    }
  });
}
