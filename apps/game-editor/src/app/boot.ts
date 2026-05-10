import { ProjectState } from '../state/projectState';
import { SaveManager } from '../persistence/saveManager';
import { setupAutosave, triggerAutosave } from '../persistence/autosave';
import { DirtyState } from '../state/dirtyState';
import { setupKeyboardShortcuts } from '../input/keyboardShortcuts';
import { MotionCanvasRenderer } from '../motion-editor/canvas/MotionCanvasRenderer';
import { preloadAssets } from '../motion-editor/canvas/imageCache';
import { setupUI, renderUI } from '../motion-editor/motionEditorUi';
import { setupRouter, navigate } from './router';
import { STORAGE_KEYS } from '../persistence/storageKeys';

import { setupCutterUI } from '../sprite-cutter/spriteCutterUi';
import { MAIN_LAYOUT } from './layout';

export function bootApp() {
  console.log('NStep Code Motion Editor: Booting...');

  // 0. Inject Layout
  const appRoot = document.getElementById('app');
  if (appRoot) {
    appRoot.innerHTML = MAIN_LAYOUT;
  } else {
    console.error('NStep Error: Could not find #app root element');
    return;
  }

  // 1. Setup Persistence & Load Project
  setupAutosave();
  DirtyState.onChange = () => triggerAutosave();
  
  const lastId = localStorage.getItem(STORAGE_KEYS.LAST_PROJECT_ID);
  if (lastId) {
    const saved = SaveManager.getProject(lastId);
    if (saved) {
      ProjectState.setProject(saved);
    }
  }

  preloadAssets(ProjectState.project);

  // 2. Setup Renderer
  const canvas = document.getElementById('main-canvas') as HTMLCanvasElement;
  const renderer = new MotionCanvasRenderer(canvas);
  renderer.rebuildTree(ProjectState.project);

  // 3. Setup UI
  const refreshRenderer = () => {
    renderer.rebuildTree(ProjectState.project);
    renderUI();
  };

  setupUI(refreshRenderer);
  setupCutterUI((page) => {
    navigate(page);
    refreshRenderer();
  });
  setupKeyboardShortcuts(refreshRenderer);

  // 4. Setup Router
  setupRouter((page) => {
    navigate(page);
    refreshRenderer();
  });

  // Initial Render
  refreshRenderer();
  
  console.log('NStep Code Motion Editor: Boot Complete.');
}
