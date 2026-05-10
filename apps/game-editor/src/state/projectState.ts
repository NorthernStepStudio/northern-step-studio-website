import { CharacterProject } from '../../../../packages/nstep-motion-core/src/schema/types';

import { SelectionState } from './selectionState';

import { HERO_RIGS } from '../motion-editor/samples/heroes';

export const ProjectState = {
  project: JSON.parse(JSON.stringify(HERO_RIGS.warrior)),
  
  setProject(p: CharacterProject) {
    this.project = JSON.parse(JSON.stringify(p)); // Deep copy
    if (this.project.animations.length > 0) {
      SelectionState.activeAnimId = this.project.animations[0].id;
    }
  }
};
