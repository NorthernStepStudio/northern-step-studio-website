import { CharacterProject, CharacterPart, AnimationState, MotionController } from './types';

export function createDefaultProject(): CharacterProject {
  return {
    id: 'proj-' + Date.now(),
    name: 'New Project',
    parts: [],
    animations: [createDefaultAnimation('anim-1', 'Idle')],
    assets: [],
    renderQuality: 'smooth'
  };
}

export function createDefaultPart(id: string, name: string): CharacterPart {
  return {
    id,
    name,
    parentId: null,
    origin: { x: 20, y: 20 },
    baseX: 0,
    baseY: 0,
    baseRotation: 0,
    baseScaleX: 1,
    baseScaleY: 1,
    zIndex: 10,
    renderMode: 'shape',
    shapeType: 'roundedRect',
    color: '#7aa2f7',
    opacity: 1
  };
}

export function createDefaultAnimation(id: string, name: string): AnimationState {
  return {
    id,
    name,
    duration: 1.0,
    loop: true,
    controllers: []
  };
}

export function createDefaultController(partId: string): MotionController {
  return {
    id: 'ctrl-' + Date.now(),
    targetPartId: partId,
    property: 'y',
    formulaPreset: 'breathingY',
    enabled: true,
    params: {
      speed: 1,
      amplitude: 10,
      phase: 0,
      offset: 0,
      min: 0,
      max: 0
    }
  };
}
