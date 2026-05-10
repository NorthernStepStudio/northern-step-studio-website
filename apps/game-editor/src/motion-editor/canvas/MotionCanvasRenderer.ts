import { CharacterProject, CharacterPart } from '../../../../../packages/nstep-motion-core/src/schema/types';
import { evaluateController } from '../../../../../packages/nstep-motion-core/src/runtime/evaluateController';
import { ProjectState } from '../../state/projectState';
import { SelectionState } from '../../state/selectionState';
import { PlaybackState } from '../../state/playbackState';
import { imageCache } from './imageCache';
import { drawShape } from './shapeRenderer';
import { drawPartOverlays, drawSkeleton } from './motionOverlays';

export class MotionCanvasRenderer {
  private ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;
  private lastTime: number = performance.now();
  
  partsMap = new Map<string, CharacterPart>();
  childrenMap = new Map<string, string[]>();
  rootParts: string[] = [];

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.startLoop();
  }

  rebuildTree(project: CharacterProject) {
    this.partsMap.clear();
    this.childrenMap.clear();
    this.rootParts = [];
    project.parts.forEach(p => {
      this.partsMap.set(p.id, p);
      if (!p.parentId) {
        this.rootParts.push(p.id);
      } else {
        if (!this.childrenMap.has(p.parentId)) this.childrenMap.set(p.parentId, []);
        this.childrenMap.get(p.parentId)!.push(p.id);
      }
    });
  }

  private startLoop() {
    const loop = (now: number) => {
      const dt = (now - this.lastTime) / 1000;
      this.lastTime = now;
      
      this.update(dt);
      this.render();
      
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  private update(dt: number) {
    if (!PlaybackState.playing) return;
    
    const anim = ProjectState.project.animations.find((a: any) => a.id === SelectionState.activeAnimId);
    if (anim) {
      PlaybackState.time += dt * PlaybackState.speedMult;
      const dur = anim.duration || 1;
      if (anim.loop) {
        // Continuous loop
      } else if (PlaybackState.time > dur) {
        PlaybackState.time = dur;
      }
    }
  }

  private render() {
    const { ctx, canvas } = this;
    const project = ProjectState.project;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const currentTransforms = new Map();
    project.parts.forEach((p: any) => {
      currentTransforms.set(p.id, { 
        x: p.baseX, 
        y: p.baseY, 
        rotation: p.baseRotation, 
        scaleX: p.baseScaleX, 
        scaleY: p.baseScaleY 
      });
    });

    const anim = project.animations.find((a: any) => a.id === SelectionState.activeAnimId);
    if (anim) {
      const animDur = anim.duration || 1;
      anim.controllers.forEach((c: any) => {
        if (!c.enabled) return;
        const tform = currentTransforms.get(c.targetPartId);
        if (!tform) return;
        
        const val = evaluateController(c, PlaybackState.time, animDur);
        const p = c.params;
        
        let targetVal = tform[c.property] + val;
        if (p.min !== p.max) {
          targetVal = Math.max(tform[c.property] + p.min, Math.min(tform[c.property] + p.max, targetVal));
        }
        tform[c.property] = targetVal;
        
        // Update debug UI if present
        const dbg = document.getElementById('debug-val-' + c.id);
        if (dbg) dbg.textContent = val.toFixed(2);
      });
    }

    const matrices = new Map<string, DOMMatrix>();
    const computeMatrix = (partId: string, parentMatrix: DOMMatrix) => {
      const part = this.partsMap.get(partId);
      if (!part) return;
      const tform = currentTransforms.get(partId);
      const m = DOMMatrix.fromMatrix(parentMatrix);
      m.translateSelf(tform.x, tform.y);
      m.rotateSelf(tform.rotation);
      m.scaleSelf(tform.scaleX, tform.scaleY);
      matrices.set(partId, m);
      const kids = this.childrenMap.get(partId) || [];
      kids.forEach(k => computeMatrix(k, m));
    };

    const rootMatrix = new DOMMatrix().translate(canvas.width / 2, canvas.height / 2);
    this.rootParts.forEach(root => computeMatrix(root, rootMatrix));

    const sortedParts = [...project.parts].sort((a: any, b: any) => (a.zIndex || 0) - (b.zIndex || 0));
    sortedParts.forEach((part: any) => {
      const m = matrices.get(part.id);
      if (!m) return;
      
      const asset = project.assets?.find((a: any) => a.id === part.imageAssetId);
      const isSelected = part.id === SelectionState.activePartId;
      
      ctx.save();
      ctx.setTransform(m.a, m.b, m.c, m.d, m.e, m.f);
      
      // Quality settings
      ctx.imageSmoothingEnabled = project.renderQuality !== 'pixel';
      if (ctx.imageSmoothingEnabled) ctx.imageSmoothingQuality = 'high';
      
      // Professional Polish: Shadow
      if (!isSelected) {
        ctx.shadowColor = 'rgba(0,0,0,0.15)';
        ctx.shadowBlur = 12;
        ctx.shadowOffsetY = 6;
      }
      
      if (part.opacity !== undefined) ctx.globalAlpha = part.opacity;
      if (part.flipX || part.flipY) ctx.scale(part.flipX ? -1 : 1, part.flipY ? -1 : 1);
      
      let width = 40;
      let height = 40;
      
      if (part.renderMode === 'image' && asset) {
        width = part.sourceRect ? part.sourceRect.width : asset.width;
        height = part.sourceRect ? part.sourceRect.height : asset.height;
      } else if (part.renderMode === 'shape') {
        width = part.origin.x * 2 || 40;
        height = part.origin.y * 2 || 40;
      }

      ctx.translate(-part.origin.x, -part.origin.y);
      
      if (part.renderMode === 'image' && part.imageAssetId) {
         const img = imageCache.get(part.imageAssetId);
         if (img && img.complete) {
            if (part.sourceRect) {
              ctx.drawImage(
                img, 
                part.sourceRect.x, part.sourceRect.y, 
                part.sourceRect.width, part.sourceRect.height,
                0, 0, width, height
              );
            } else {
              ctx.drawImage(img, 0, 0, width, height);
            }
         } else {
           ctx.fillStyle = 'rgba(255, 0, 255, 0.2)';
           ctx.fillRect(0, 0, width, height);
         }
      } else {
         ctx.fillStyle = part.color || '#444';
         drawShape(ctx, part, width, height);
      }
      
      // Optional Debug Overlays (Enabled via UI toggle later)
      if (SelectionState.showDebugBounds || isSelected) {
        drawPartOverlays(ctx, part, width, height, isSelected);
      }
      
      ctx.restore();
    });

    drawSkeleton(ctx, project.parts, matrices);
  }
}
