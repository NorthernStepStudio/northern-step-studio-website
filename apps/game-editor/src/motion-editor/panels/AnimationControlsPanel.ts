import { ProjectState } from '../../state/projectState';
import { SelectionState } from '../../state/selectionState';
import { PlaybackState } from '../../state/playbackState';
import { DirtyState } from '../../state/dirtyState';

export function renderAnimationControls(container: HTMLElement, onUpdate: () => void) {
  const project = ProjectState.project;
  const activeAnim = project.animations.find((a: any) => a.id === SelectionState.activeAnimId);
  
  if (!activeAnim) {
    container.innerHTML = '<div class="panel-empty">No active animation</div>';
    return;
  }

  container.innerHTML = `
    <div class="anim-controls-card">
      <div class="anim-header">
        <span class="anim-title">ANIMATION: ${activeAnim.name}</span>
        <div class="anim-stats">${PlaybackState.time.toFixed(2)}s / ${(activeAnim.duration || 1).toFixed(2)}s</div>
      </div>
      
      <div class="anim-buttons">
        ${project.animations.map((a: any) => `
          <button class="btn-anim-tab ${a.id === SelectionState.activeAnimId ? 'active' : ''}" data-id="${a.id}">
            ${a.name}
          </button>
        `).join('')}
      </div>

      <div class="anim-playback-row">
        <button id="btn-play-pause" class="btn-icon">${PlaybackState.playing ? '⏸' : '▶'}</button>
        <button id="btn-stop" class="btn-icon">⏹</button>
        <div class="playback-speed">
          <label>Speed</label>
          <input type="range" id="range-speed" min="0.1" max="3" step="0.1" value="${PlaybackState.speedMult}">
        </div>
        <div class="playback-loop">
           <label><input type="checkbox" id="chk-loop" ${activeAnim.loop ? 'checked' : ''}> Loop</label>
        </div>
      </div>
    </div>
  `;

  // Bindings
  container.querySelectorAll('.btn-anim-tab').forEach(btn => {
    (btn as HTMLElement).onclick = () => {
      SelectionState.activeAnimId = (btn as HTMLElement).getAttribute('data-id')!;
      PlaybackState.time = 0;
      onUpdate();
    };
  });

  const btnPlay = container.querySelector('#btn-play-pause') as HTMLElement;
  btnPlay.onclick = () => {
    PlaybackState.playing = !PlaybackState.playing;
    onUpdate();
  };

  const btnStop = container.querySelector('#btn-stop') as HTMLElement;
  btnStop.onclick = () => {
    PlaybackState.time = 0;
    PlaybackState.playing = false;
    onUpdate();
  };

  const rangeSpeed = container.querySelector('#range-speed') as HTMLInputElement;
  rangeSpeed.oninput = () => {
    PlaybackState.speedMult = +rangeSpeed.value;
  };

  const chkLoop = container.querySelector('#chk-loop') as HTMLInputElement;
  chkLoop.onchange = () => {
    activeAnim.loop = chkLoop.checked;
    DirtyState.markDirty();
    onUpdate();
  };
}
