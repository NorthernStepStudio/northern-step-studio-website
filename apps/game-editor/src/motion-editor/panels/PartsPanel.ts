import { ProjectState } from '../../state/projectState';
import { SelectionState } from '../../state/selectionState';
import { DirtyState } from '../../state/dirtyState';
import { createDefaultPart } from '../../../../../packages/nstep-motion-core/src/schema/defaults';

export function renderPartsPanel(container: HTMLElement, onUpdate: () => void) {
  const project = ProjectState.project;
  
  container.innerHTML = `
    <div class="panel-toolbar" style="display:flex; justify-content:space-between; align-items:center; padding:10px; border-bottom:1px solid var(--border);">
      <span style="font-size:0.75rem; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Tree (${project.parts.length})</span>
      <button id="btn-add-part" style="padding:2px 8px; font-size:0.75rem;">+ Add Part</button>
    </div>
    <div class="parts-tree">
      ${renderPartTree(null, project.parts, SelectionState.activePartId)}
    </div>
  `;

  // Bindings
  container.querySelectorAll('.part-item').forEach(item => {
    (item as HTMLElement).onclick = (e) => {
      e.stopPropagation();
      SelectionState.activePartId = (item as HTMLElement).getAttribute('data-id');
      onUpdate();
    };
  });

  const btnAdd = container.querySelector('#btn-add-part') as HTMLElement;
  btnAdd.onclick = () => {
    const id = 'p-' + Date.now();
    const newPart = createDefaultPart(id, 'New Part');
    newPart.parentId = SelectionState.activePartId;
    project.parts.push(newPart);
    SelectionState.activePartId = id;
    DirtyState.markDirty();
    onUpdate();
  };
}

function renderPartTree(parentId: string | null, allParts: any[], activeId: string | null): string {
  const children = allParts.filter(p => p.parentId === parentId);
  if (children.length === 0) return '';

  return `
    <ul>
      ${children.map(p => `
        <li class="part-node">
          <div class="part-item ${p.id === activeId ? 'active' : ''}" data-id="${p.id}">
            <span class="part-icon">${p.renderMode === 'image' ? '🖼' : '📦'}</span>
            <span class="part-name">${p.name}</span>
          </div>
          ${renderPartTree(p.id, allParts, activeId)}
        </li>
      `).join('')}
    </ul>
  `;
}
