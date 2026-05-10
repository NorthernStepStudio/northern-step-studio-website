import { CharacterProject } from '../../../../packages/nstep-motion-core/src/schema/types';
import { normalizeProject } from '../../../../packages/nstep-motion-core/src/schema/validators';
import { STORAGE_KEYS } from './storageKeys';
import { SelectionState } from '../state/selectionState';
import { DirtyState } from '../state/dirtyState';

export interface ProjectIndexEntry {
  id: string;
  name: string;
  updatedAt: number;
  createdAt: number;
  type: string;
}

export class SaveManager {
  static getIndex(): ProjectIndexEntry[] {
    const data = localStorage.getItem(STORAGE_KEYS.INDEX);
    return data ? JSON.parse(data) : [];
  }

  static saveIndex(index: ProjectIndexEntry[]) {
    localStorage.setItem(STORAGE_KEYS.INDEX, JSON.stringify(index));
  }

  static getProject(id: string): CharacterProject | null {
    const data = localStorage.getItem(STORAGE_KEYS.PROJECT_PREFIX + id);
    if (!data) return null;
    try {
      const p = JSON.parse(data);
      return normalizeProject(p);
    } catch {
      return null;
    }
  }

  static saveProject(p: CharacterProject, type = 'custom') {
    const index = this.getIndex();
    let entry = index.find(e => e.id === p.id);
    if (!entry) {
      entry = { id: p.id, name: p.name, createdAt: Date.now(), updatedAt: Date.now(), type };
      index.push(entry);
    } else {
      entry.name = p.name;
      entry.updatedAt = Date.now();
    }
    this.saveIndex(index);
    
    // Persist current selection metadata
    p.lastSelectedAnimId = SelectionState.activeAnimId;
    p.lastSelectedPartId = SelectionState.activePartId || undefined;
    
    localStorage.setItem(STORAGE_KEYS.PROJECT_PREFIX + p.id, JSON.stringify(p));
    localStorage.setItem(STORAGE_KEYS.LAST_PROJECT_ID, p.id);
    
    DirtyState.markClean();
  }

  static deleteProject(id: string) {
    const index = this.getIndex().filter(e => e.id !== id);
    this.saveIndex(index);
    localStorage.removeItem(STORAGE_KEYS.PROJECT_PREFIX + id);
    if (localStorage.getItem(STORAGE_KEYS.LAST_PROJECT_ID) === id) {
       localStorage.removeItem(STORAGE_KEYS.LAST_PROJECT_ID);
    }
  }

  static duplicateProject(id: string) {
    const p = this.getProject(id);
    if (!p) return;
    p.id = 'proj_' + Math.random().toString(36).substr(2, 9);
    p.name = p.name + ' Copy';
    this.saveProject(p, 'custom');
  }
}
