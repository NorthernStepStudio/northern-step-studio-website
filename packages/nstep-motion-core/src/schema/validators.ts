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
  if (!p.renderQuality) p.renderQuality = 'smooth';
  p.version = p.version ?? 1;

  p.parts.forEach(part => {
    if (part.visible === undefined) part.visible = true;
    if (part.locked === undefined) part.locked = false;
    if (part.inheritTransform === undefined) part.inheritTransform = true;
    if (part.editChildrenTogether === undefined) part.editChildrenTogether = true;
    part.zIndex = part.zIndex !== undefined ? (Number(part.zIndex) || 0) : 10;
  });

  p.animations.forEach(anim => {
    if (!anim.controllers) anim.controllers = [];
  });

  return p;
}
