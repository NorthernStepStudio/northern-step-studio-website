import { CharacterProject } from './types';

/**
 * Ensures a project object has all required fields and arrays.
 * Useful for handling imported JSON or old saves.
 */
export function normalizeProject(data: any): CharacterProject {
  const p = data as CharacterProject;
  if (!p.parts) p.parts = [];
  if (!p.animations) p.animations = [];
  if (!p.assets) p.assets = [];
  if (!p.renderQuality) p.renderQuality = 'pixel';
  
  p.animations.forEach(anim => {
    if (!anim.controllers) anim.controllers = [];
  });
  
  return p;
}
