import { ProjectState } from '../../state/projectState';
import { SelectionState } from '../../state/selectionState';
import { DirtyState } from '../../state/dirtyState';
import { FORMULA_PRESETS } from '../../../../../packages/nstep-motion-core/src/formulas/presets';
import { createDefaultController } from '../../../../../packages/nstep-motion-core/src/schema/defaults';

export function renderControllerTimeline(container: HTMLElement, onUpdate: () => void) {
  const anim = ProjectState.project.animations.find((a: any) => a.id === SelectionState.activeAnimId);
  
  if (!anim) {
    container.innerHTML = '<div class="panel-empty">No active animation</div>';
    return;
  }

  container.innerHTML = `
    <div class="panel-toolbar">
      <button id="btn-add-ctrl">+ Add Controller</button>
    </div>
    <div class="controller-list">
      ${anim.controllers.map((c: any) => renderControllerCard(c)).join('')}
    </div>
  `;

  // Bindings
  container.querySelector('#btn-add-ctrl')!.addEventListener('click', () => {
    if (!SelectionState.activePartId) {
      alert('Select a part first');
      return;
    }
    anim.controllers.push(createDefaultController(SelectionState.activePartId));
    DirtyState.markDirty();
    onUpdate();
  });

  container.querySelectorAll('.controller-card').forEach(card => {
    const id = card.getAttribute('data-id')!;
    const ctrl = anim.controllers.find((c: any) => c.id === id)!;
    
    (card.querySelector('.btn-del-ctrl') as HTMLElement).onclick = () => {
      anim.controllers = anim.controllers.filter((c: any) => c.id !== id);
      DirtyState.markDirty();
      onUpdate();
    };

    (card.querySelector('.ctrl-enabled') as HTMLInputElement).onchange = (e) => {
      ctrl.enabled = (e.target as HTMLInputElement).checked;
      DirtyState.markDirty();
      onUpdate();
    };

    (card.querySelector('.ctrl-preset') as HTMLSelectElement).onchange = (e) => {
      ctrl.formulaPreset = (e.target as HTMLSelectElement).value;
      DirtyState.markDirty();
      onUpdate();
    };
    
    // Params
    const bindParam = (name: string) => {
      const el = card.querySelector(`.param-${name}`) as HTMLInputElement;
      el.oninput = () => {
        (ctrl.params as any)[name] = +el.value;
        DirtyState.markDirty();
        onUpdate();
      };
    };
    bindParam('speed');
    bindParam('amplitude');
    bindParam('phase');
    bindParam('offset');
  });
}

function renderControllerCard(c: any): string {
  const part = ProjectState.project.parts.find((p: any) => p.id === c.targetPartId);
  return `
    <div class="controller-card" data-id="${c.id}">
      <div class="ctrl-header">
        <input type="checkbox" class="ctrl-enabled" ${c.enabled ? 'checked' : ''}>
        <span class="ctrl-target">${part?.name || 'Unknown'} : ${c.property}</span>
        <button class="btn-del-ctrl">×</button>
      </div>
      <div class="ctrl-body">
        <select class="ctrl-preset">
          ${FORMULA_PRESETS.map(f => `<option value="${f.id}" ${c.formulaPreset === f.id ? 'selected' : ''}>${f.name}</option>`).join('')}
        </select>
        <div class="ctrl-params">
          <div class="param-row"><label>Speed</label><input type="number" class="param-speed" value="${c.params.speed}"></div>
          <div class="param-row"><label>Amp</label><input type="number" class="param-amplitude" value="${c.params.amplitude}"></div>
          <div class="param-row"><label>Phase</label><input type="number" class="param-phase" value="${c.params.phase}"></div>
          <div class="param-row"><label>Offset</label><input type="number" class="param-offset" value="${c.params.offset}"></div>
        </div>
      </div>
    </div>
  `;
}
