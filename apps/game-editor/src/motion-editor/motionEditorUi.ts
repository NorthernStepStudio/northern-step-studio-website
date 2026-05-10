import { renderPartsPanel } from './panels/PartsPanel';
import { renderInspectorPanel } from './panels/InspectorPanel';
import { renderAnimationControls } from './panels/AnimationControlsPanel';
import { renderControllerTimeline } from './panels/ControllerTimelinePanel';
import { ProjectState } from '../state/projectState';
import { SelectionState } from '../state/selectionState';
import { PlaybackState } from '../state/playbackState';
import { HERO_RIGS, DOOMED_RIGS } from './samples';
import { SaveManager } from '../persistence/saveManager';
import { exportJSON, exportGodot, exportCanvasRuntime, importJSON } from '../exporters/exportActions';
import { preloadAssets } from './canvas/imageCache';

let _onUpdate: () => void = () => {};

export function setupUI(onUpdate: () => void) {
  _onUpdate = onUpdate;
  
  // 1. Setup Global Header Bindings
  document.getElementById('btn-proj-new')!.onclick = () => {
    if (confirm('Create new project? Unsaved changes will be lost.')) {
      location.reload(); // Simplest way to reset everything for now
    }
  };
  document.getElementById('btn-proj-save')!.onclick = () => SaveManager.saveProject(ProjectState.project);
  document.getElementById('btn-export-json')!.onclick = exportJSON;
  document.getElementById('btn-export-gd')!.onclick = exportGodot;
  document.getElementById('btn-export-canvas')!.onclick = exportCanvasRuntime;

  const dlgLoad = document.getElementById('dlg-load') as HTMLDialogElement;
  const loadList = document.getElementById('load-list')!;
  
  document.getElementById('btn-load-json')!.onclick = () => {
    const projects = SaveManager.getIndex();
    if (projects.length === 0) {
      loadList.innerHTML = '<div class="panel-empty">No saved projects found.</div>';
    } else {
      loadList.innerHTML = projects.map((p: any) => `
        <div class="item-list" style="margin-bottom:10px; display:flex; justify-content:space-between; align-items:center; padding:10px; background:var(--bg-surface); border:1px solid var(--border); border-radius:4px;">
          <div>
            <div style="font-weight:600;">${p.name}</div>
            <div style="font-size:0.7rem; color:var(--text-muted);">${new Date(p.updatedAt).toLocaleString()}</div>
          </div>
          <div style="display:flex; gap:5px;">
            <button class="btn-load-item" data-id="${p.id}">Load</button>
            <button class="btn-del-item danger" data-id="${p.id}" style="color:var(--danger);">×</button>
          </div>
        </div>
      `).join('');
      
      loadList.querySelectorAll('.btn-load-item').forEach(btn => {
        (btn as HTMLElement).onclick = () => {
          const id = (btn as HTMLElement).getAttribute('data-id')!;
          const p = SaveManager.getProject(id);
          if (p) {
            ProjectState.setProject(p);
            preloadAssets(ProjectState.project);
            _onUpdate();
            dlgLoad.close();
          }
        };
      });

      loadList.querySelectorAll('.btn-del-item').forEach(btn => {
        (btn as HTMLElement).onclick = () => {
          const id = (btn as HTMLElement).getAttribute('data-id')!;
          if (confirm('Delete this project?')) {
            SaveManager.deleteProject(id);
            document.getElementById('btn-load-json')!.click(); // Refresh
          }
        };
      });
    }
    dlgLoad.showModal();
  };

  document.getElementById('btn-close-load')!.onclick = () => dlgLoad.close();

  // 1.1 Import JSON (Old Load logic moved to a separate button if needed, or kept here)
  // For now, let's just use the Load button for localStorage.
  // I'll add an "Import" button to the dialog.
  const importBtn = document.createElement('button');
  importBtn.textContent = 'Import .json File';
  importBtn.style.width = '100%';
  importBtn.style.marginTop = '20px';
  importBtn.onclick = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const p = await importJSON(file);
        if (p) {
          ProjectState.setProject(p);
          preloadAssets(ProjectState.project);
          _onUpdate();
          dlgLoad.close();
        }
      }
    };
    input.click();
  };
  loadList.appendChild(importBtn);

  // 2. Samples Selectors
  const heroSelect = document.getElementById('hero-select') as HTMLSelectElement;
  if (heroSelect) {
    heroSelect.onchange = () => {
      const id = heroSelect.value;
      if (id && HERO_RIGS[id as keyof typeof HERO_RIGS]) {
        ProjectState.setProject(HERO_RIGS[id as keyof typeof HERO_RIGS]);
        preloadAssets(ProjectState.project);
        _onUpdate();
      }
      heroSelect.value = '';
    };
  }

  const sampleSelect = document.getElementById('sample-select') as HTMLSelectElement;
  if (sampleSelect) {
    sampleSelect.onchange = () => {
      const id = sampleSelect.value;
      if (id && DOOMED_RIGS[id as keyof typeof DOOMED_RIGS]) {
        ProjectState.setProject(DOOMED_RIGS[id as keyof typeof DOOMED_RIGS]);
        preloadAssets(ProjectState.project);
        _onUpdate();
      }
      sampleSelect.value = '';
    };
  }

  // 3. Asset Loading
  document.getElementById('btn-add-asset')!.onclick = () => document.getElementById('file-asset')!.click();
  document.getElementById('file-asset')!.onchange = (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (re) => {
      const dataUrl = re.target?.result as string;
      const img = new Image();
      img.onload = () => {
        if (!ProjectState.project.assets) ProjectState.project.assets = [];
        ProjectState.project.assets.push({
          id: 'ast-' + Date.now(),
          name: file.name,
          type: file.type,
          dataUrl,
          width: img.width,
          height: img.height
        });
        preloadAssets(ProjectState.project);
        _onUpdate();
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };
}

export function renderUI() {
  const partsContainer = document.getElementById('parts-list-container')!;
  const inspectorContainer = document.getElementById('inspector-container')!;
  const animControlsContainer = document.getElementById('anim-controls-container')!;
  const controllerContainer = document.getElementById('controller-list-container')!;

  renderPartsPanel(partsContainer, _onUpdate);
  renderInspectorPanel(inspectorContainer, _onUpdate);
  renderAnimationControls(animControlsContainer, _onUpdate);
  renderControllerTimeline(controllerContainer, _onUpdate);
  
  // Render Assets
  const assetsList = document.getElementById('assets-list-container');
  if (assetsList) {
    assetsList.innerHTML = (ProjectState.project.assets || []).map((a: any) => `
      <div class="asset-item" title="${a.name}">
        <img src="${a.dataUrl}">
      </div>
    `).join('');
  }

  // Update UI stats
  const timeDisplay = document.getElementById('time-display');
  if (timeDisplay) {
    const anim = ProjectState.project.animations.find((a: any) => a.id === SelectionState.activeAnimId);
    const dur = anim?.duration || 1;
    timeDisplay.textContent = `${PlaybackState.time.toFixed(2)}s / ${dur.toFixed(2)}s`;
  }
}
