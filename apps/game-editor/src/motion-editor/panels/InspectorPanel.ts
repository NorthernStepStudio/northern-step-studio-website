import { ProjectState } from '../../state/projectState';
import { SelectionState } from '../../state/selectionState';
import { DirtyState } from '../../state/dirtyState';
import { trimToAlphaBounds } from '../utils/assetUtils';

export function renderInspectorPanel(container: HTMLElement, onUpdate: () => void) {
  const part = ProjectState.project.parts.find((p: any) => p.id === SelectionState.activePartId);
  
  if (!part) {
    container.innerHTML = '<div class="panel-empty">Select a part to inspect</div>';
    return;
  }

  container.innerHTML = `
    <div class="inspector-form">
      <div class="form-group">
        <label>Name</label>
        <input type="text" id="part-name" value="${part.name}">
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label>X</label>
          <input type="number" id="part-x" value="${part.baseX}">
        </div>
        <div class="form-group">
          <label>Y</label>
          <input type="number" id="part-y" value="${part.baseY}">
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>Rot</label>
          <input type="number" id="part-rot" value="${part.baseRotation}">
        </div>
        <div class="form-group">
          <label>Z</label>
          <input type="number" id="part-z" value="${part.zIndex}">
        </div>
      </div>

      <div class="form-group">
        <label>Pivot (Origin)</label>
        <div class="pivot-controls">
          <input type="number" id="part-ox" value="${part.origin.x}" style="width:60px">
          <input type="number" id="part-oy" value="${part.origin.y}" style="width:60px">
          <button id="btn-edit-pivot" class="${SelectionState.isEditingPivot ? 'active' : ''}">🖱 Edit</button>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>Scale X</label>
          <input type="number" id="part-sx" value="${part.baseScaleX}" step="0.1">
        </div>
        <div class="form-group">
          <label>Scale Y</label>
          <input type="number" id="part-sy" value="${part.baseScaleY}" step="0.1">
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>Opacity</label>
          <input type="range" id="part-opacity" min="0" max="1" step="0.1" value="${part.opacity ?? 1}">
        </div>
      </div>

      <div class="form-group">
        <div class="checkbox-row">
          <label><input type="checkbox" id="part-flipx" ${part.flipX ? 'checked' : ''}> Flip X</label>
          <label><input type="checkbox" id="part-flipy" ${part.flipY ? 'checked' : ''}> Flip Y</label>
          <label title="Show pivot and bounds"><input type="checkbox" id="chk-debug-bounds" ${SelectionState.showDebugBounds ? 'checked' : ''}> Debug</label>
        </div>
      </div>

      <div class="inspector-actions">
        <button id="btn-fit-native">Fit to Asset</button>
        <button id="btn-trim-alpha" style="${part.renderMode === 'image' ? '' : 'display:none'}">Trim Padding</button>
      </div>

      <div class="form-group">
        <label>Render Mode</label>
        <select id="part-mode">
          <option value="shape" ${part.renderMode === 'shape' ? 'selected' : ''}>Shape</option>
          <option value="image" ${part.renderMode === 'image' ? 'selected' : ''}>Image Asset</option>
        </select>
      </div>

      ${part.renderMode === 'shape' ? `
        <div class="form-group">
          <label>Color</label>
          <input type="color" id="part-color" value="${part.color || '#ffffff'}">
        </div>
      ` : `
        <div class="form-group">
          <label>Asset</label>
          <select id="part-asset">
            ${(ProjectState.project.assets || []).map((a: any) => `
              <option value="${a.id}" ${part.imageAssetId === a.id ? 'selected' : ''}>${a.name}</option>
            `).join('')}
          </select>
        </div>
      `}
    </div>
  `;

  // Bindings
  const bindInput = (id: string, prop: string, isNum = true, isSubProp = false, subPropObj?: any) => {
    const el = container.querySelector('#' + id) as HTMLInputElement;
    if (!el) return;

    const updateVal = () => {
      const val = isNum ? +el.value : el.value;
      if (isSubProp && subPropObj) {
        subPropObj[prop] = val;
      } else {
        (part as any)[prop] = val;
      }
      DirtyState.markDirty();
      onUpdate();
    };

    el.oninput = updateVal;

    // Wheel Scrubbing Support
    if (isNum) {
      el.addEventListener('wheel', (e) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -1 : 1;
        const step = +(el.step) || 1;
        const multiplier = e.shiftKey ? 10 : 1;
        el.value = (parseFloat(el.value) + delta * step * multiplier).toString();
        updateVal();
      });
    }
  };

  bindInput('part-name', 'name', false);
  bindInput('part-x', 'baseX');
  bindInput('part-y', 'baseY');
  bindInput('part-rot', 'baseRotation');
  bindInput('part-z', 'zIndex');
  bindInput('part-sx', 'baseScaleX');
  bindInput('part-sy', 'baseScaleY');
  bindInput('part-opacity', 'opacity');
  
  bindInput('part-ox', 'x', true, true, part.origin);
  bindInput('part-oy', 'y', true, true, part.origin);

  (container.querySelector('#btn-edit-pivot') as HTMLElement).onclick = () => {
    SelectionState.isEditingPivot = !SelectionState.isEditingPivot;
    onUpdate();
  };

  container.querySelector('#part-flipx')?.addEventListener('change', (e) => {
    part.flipX = (e.target as HTMLInputElement).checked;
    onUpdate();
  });
  container.querySelector('#part-flipy')?.addEventListener('change', (e) => {
    part.flipY = (e.target as HTMLInputElement).checked;
    onUpdate();
  });

  container.querySelector('#chk-debug-bounds')?.addEventListener('change', (e) => {
    SelectionState.showDebugBounds = (e.target as HTMLInputElement).checked;
    onUpdate();
  });

  (container.querySelector('#btn-fit-native') as HTMLElement).onclick = () => {
    const asset = ProjectState.project.assets?.find((a: any) => a.id === part.imageAssetId);
    if (asset) {
      part.origin.x = asset.width / 2;
      part.origin.y = asset.height / 2;
      part.baseScaleX = 1;
      part.baseScaleY = 1;
      DirtyState.markDirty();
      onUpdate();
    }
  };

  const btnTrim = container.querySelector('#btn-trim-alpha') as HTMLButtonElement;
  if (btnTrim) {
    btnTrim.onclick = async () => {
      const asset = ProjectState.project.assets?.find((a: any) => a.id === part.imageAssetId);
      if (!asset) return;
      
      const img = new Image();
      img.src = asset.dataUrl;
      await new Promise(r => img.onload = r);
      
      const result = await trimToAlphaBounds(img);
      
      // Update Asset
      asset.dataUrl = result.dataUrl;
      asset.width = result.bounds.width;
      asset.height = result.bounds.height;
      
      // Adjust Part
      part.origin.x -= result.bounds.x;
      part.origin.y -= result.bounds.y;
      
      DirtyState.markDirty();
      onUpdate();
    };
  }

  (container.querySelector('#part-mode') as HTMLSelectElement).onchange = (e) => {
    part.renderMode = (e.target as HTMLSelectElement).value as any;
    DirtyState.markDirty();
    onUpdate();
  };

  const colorIn = container.querySelector('#part-color') as HTMLInputElement;
  if (colorIn) {
    colorIn.oninput = () => {
      part.color = colorIn.value;
      DirtyState.markDirty();
      onUpdate();
    };
  }

  const assetIn = container.querySelector('#part-asset') as HTMLSelectElement;
  if (assetIn) {
    assetIn.onchange = () => {
      part.imageAssetId = assetIn.value;
      DirtyState.markDirty();
      onUpdate();
    };
  }
}
