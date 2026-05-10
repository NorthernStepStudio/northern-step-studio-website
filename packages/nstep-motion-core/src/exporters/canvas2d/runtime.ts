import { CharacterProject } from '../../schema/types';

export function exportToCanvas2D(project: CharacterProject): { json: string, code: string } {
  const json = JSON.stringify(project, null, 2);
  
  const code = `// NStep Code Motion - Canvas 2D Runtime
// Usage: 
// const runtime = new CharacterRuntime(projectData);
// runtime.setAnimation('idle');
// 
// function loop(time) {
//    ctx.clearRect(0,0,width,height);
//    runtime.update(time);
//    runtime.draw(ctx);
//    requestAnimationFrame(loop);
// }

export class CharacterRuntime {
  constructor(projectData) {
    this.project = projectData;
    this.currentAnimation = null;
    this.time = 0;
    this.speedMultiplier = 1.0;
    
    this.parts = new Map();
    this.children = new Map();
    this.project.parts.forEach(p => {
      this.parts.set(p.id, p);
      if (!this.children.has(p.parentId)) {
        this.children.set(p.parentId, []);
      }
      this.children.get(p.parentId).push(p.id);
    });
    
    this.rootParts = this.project.parts.filter(p => !p.parentId).map(p => p.id);
    
    this.imageCache = new Map();
    if (this.project.assets) {
      this.project.assets.forEach(a => {
         if (a.type.startsWith('image/')) {
            const img = new Image();
            img.src = a.dataUrl;
            this.imageCache.set(a.id, img);
         }
      });
    }
  }

  evaluateController(c, time, animDuration) {
    const p = c.params;
    const t = time * p.speed * Math.PI * 2 + p.phase;
    let val = 0;

    switch (c.formulaPreset) {
      case 'breathingY':
      case 'walkCycle':
      case 'legCycle':
        val = Math.sin(t) * p.amplitude + p.offset;
        break;
      case 'runCycle':
        val = (Math.sin(t) + Math.sin(t * 2.0) * 0.5) * p.amplitude + p.offset;
        break;
      case 'weaponSwing': {
        const progress = (time % animDuration) / animDuration;
        let swing = 0;
        if (progress < 0.2) swing = -Math.sin(progress * Math.PI * 2.5) * 0.3;
        else if (progress < 0.5) swing = Math.sin((progress - 0.2) * Math.PI * 3.33);
        else swing = Math.cos((progress - 0.5) * Math.PI);
        val = swing * p.amplitude + p.offset;
        break;
      }
      case 'recoil':
        val = Math.sin(time * 20.0) * Math.exp(-time * 10.0) * p.amplitude + p.offset;
        break;
      case 'impactShake':
        val = (Math.random() * 2.0 - 1.0) * Math.exp(-time * 8.0) * p.amplitude + p.offset;
        break;
      case 'capeLag':
        val = Math.sin(t - 0.5) * p.amplitude + p.offset;
        break;
      case 'staffSway':
        val = Math.sin(t - 0.3) * p.amplitude + p.offset;
        break;
      case 'shieldBrace':
        val = (time < 0.3 ? (time / 0.3) : 1.0) * p.amplitude + p.offset;
        break;
      case 'deathFall':
        val = Math.min(1.0, time / animDuration) * p.amplitude + p.offset;
        break;
      case 'blinkScale':
        val = (Math.sin(t) < -0.8 ? -p.amplitude : 0) + p.offset;
        break;
      case 'hoverFloat':
        val = Math.sin(t * 0.5) * p.amplitude + p.offset;
        break;
      case 'runLean':
        val = p.offset;
        break;
      case 'attackStrike':
        val = Math.sin(t) * Math.exp(-time * 2.0) * p.amplitude + p.offset;
        break;
      case 'hurtShake':
        val = Math.sin(time * 30.0) * Math.exp(-time * 5.0) * p.amplitude + p.offset;
        break;
      case 'deathCollapse':
        val = (time / animDuration) * p.amplitude + p.offset;
        break;
      default:
        val = Math.sin(t) * p.amplitude + p.offset;
        break;
    }
    return val;
  }

  setAnimation(animId) {
    this.currentAnimation = this.project.animations.find(a => a.id === animId) || null;
    this.time = 0;
  }
  
  playAnimation(animId) {
    this.setAnimation(animId);
  }

  update(dt) {
    if (this.currentAnimation) {
      this.time += dt * this.speedMultiplier;
      if (!this.currentAnimation.loop && this.time > this.currentAnimation.duration) {
        this.time = this.currentAnimation.duration;
      } else if (this.currentAnimation.loop && this.currentAnimation.duration > 0) {
        // Optional wrap, though sine handles infinite
        // this.time = this.time % this.currentAnimation.duration;
      }
    }
    
    this.currentTransforms = new Map();
    
    this.project.parts.forEach(p => {
      this.currentTransforms.set(p.id, {
        x: p.baseX,
        y: p.baseY,
        rotation: p.baseRotation, // in degrees
        scaleX: p.baseScaleX,
        scaleY: p.baseScaleY
      });
    });

    if (this.currentAnimation) {
      const animDur = this.currentAnimation.duration || 1;
      this.currentAnimation.controllers.forEach(c => {
        if (!c.enabled) return;
        
        const transform = this.currentTransforms.get(c.targetPartId);
        if (!transform) return;

        const p = c.params;
        const val = this.evaluateController(c, this.time, animDur);
        
        let targetVal = transform[c.property] + val;
        
        if (p.min !== p.max) {
           targetVal = Math.max(transform[c.property] + p.min, Math.min(transform[c.property] + p.max, targetVal));
        }

        transform[c.property] = targetVal;
      });
    }
  }

  draw(ctx, offsetX = 0, offsetY = 0) {
    ctx.save();
    ctx.translate(offsetX, offsetY);
    
    const matrices = new Map();
    
    const computeMatrix = (partId, parentMatrix) => {
      const part = this.parts.get(partId);
      const t = this.currentTransforms.get(partId);
      
      // We assume DOMMatrix is available in browser
      const m = new DOMMatrix(parentMatrix);
      m.translateSelf(t.x, t.y);
      m.rotateSelf(t.rotation);
      m.scaleSelf(t.scaleX, t.scaleY);
      
      matrices.set(partId, m);
      
      const kids = this.children.get(partId) || [];
      kids.forEach(k => computeMatrix(k, m));
    };

    this.rootParts.forEach(root => {
      computeMatrix(root, new DOMMatrix());
    });

    const sortedParts = [...this.project.parts].sort((a, b) => a.zIndex - b.zIndex);

    sortedParts.forEach(part => {
      const m = matrices.get(part.id);
      if (!m) return;
      
      ctx.save();
      ctx.setTransform(m.a, m.b, m.c, m.d, m.e, m.f);
      
      if (this.project.renderQuality !== 'pixel') {
         ctx.imageSmoothingEnabled = true;
      } else {
         ctx.imageSmoothingEnabled = false;
      }
      
      if (part.opacity !== undefined) {
         ctx.globalAlpha = part.opacity;
      }
      
      if (part.flipX || part.flipY) {
         ctx.scale(part.flipX ? -1 : 1, part.flipY ? -1 : 1);
      }
      
      ctx.translate(-part.origin.x, -part.origin.y);
      
      const width = part.origin.x * 2 || 20;
      const height = part.origin.y * 2 || 20;

      if (part.renderMode === 'image' && part.imageAssetId) {
         const img = this.imageCache.get(part.imageAssetId);
         if (img && img.complete) {
            ctx.drawImage(img, 0, 0, width, height);
         } else {
            ctx.fillStyle = 'rgba(255, 0, 255, 0.5)';
            ctx.fillRect(0, 0, width, height);
         }
      } else {
         ctx.fillStyle = part.color || 'gray';
         ctx.beginPath();
         const st = part.shapeType || 'rect';
         if (st === 'rect') {
            ctx.rect(0, 0, width, height);
         } else if (st === 'roundedRect') {
            if (ctx.roundRect) ctx.roundRect(0, 0, width, height, 8);
            else ctx.rect(0, 0, width, height);
         } else if (st === 'circle' || st === 'ellipse') {
            ctx.ellipse(width/2, height/2, width/2, height/2, 0, 0, Math.PI * 2);
         } else if (st === 'sword' || st === 'dagger') {
            ctx.moveTo(width/2, 0); ctx.lineTo(width, height * 0.2); ctx.lineTo(width * 0.6, height); ctx.lineTo(width * 0.4, height); ctx.lineTo(0, height * 0.2); ctx.closePath();
         } else if (st === 'staff' || st === 'line') {
            if (ctx.roundRect) ctx.roundRect(width * 0.4, 0, width * 0.2, height, 4);
            else ctx.fillRect(width * 0.4, 0, width * 0.2, height);
         } else if (st === 'hammer') {
            if (ctx.roundRect) {
              ctx.roundRect(width * 0.4, height * 0.2, width * 0.2, height * 0.8, 2);
              ctx.roundRect(0, 0, width, height * 0.2, 4);
            } else {
              ctx.fillRect(width * 0.4, height * 0.2, width * 0.2, height * 0.8);
              ctx.fillRect(0, 0, width, height * 0.2);
            }
         } else if (st === 'shield') {
            ctx.moveTo(0, 0); ctx.lineTo(width, 0); ctx.quadraticCurveTo(width, height, width/2, height); ctx.quadraticCurveTo(0, height, 0, 0);
         } else if (st === 'cape' || st === 'polygon') {
            ctx.moveTo(width * 0.2, 0); ctx.lineTo(width * 0.8, 0); ctx.lineTo(width, height); ctx.lineTo(0, height); ctx.closePath();
         } else {
            ctx.fillRect(0, 0, width, height);
         }
         ctx.fill();
      }
      
      ctx.globalAlpha = 1.0;
      ctx.restore();
    });
    
    ctx.restore();
  }
}
`;
  return { json, code };
}

export function exportStandaloneHTML(project: CharacterProject, runtimeCode: string): string {
  const json = JSON.stringify(project);
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${project.name} - NStep Demo</title>
  <style>
    body { background: #111; color: #fff; font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; }
    canvas { background: #222; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.5); }
    .controls { margin-top: 20px; display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; }
    button { background: #444; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; }
    button:hover { background: #666; }
  </style>
</head>
<body>
  <canvas id="demo-canvas" width="600" height="600"></canvas>
  <div class="controls" id="btn-container"></div>
  <script>
    // Inlined Runtime
    ${runtimeCode.replace(/export class/, 'class')}
    
    const projectData = ${json};
    const runtime = new CharacterRuntime(projectData);
    
    // Set initial anim
    if (projectData.animations.length > 0) {
      runtime.setAnimation(projectData.animations[0].id);
    }
    
    const btnContainer = document.getElementById('btn-container');
    projectData.animations.forEach(anim => {
       const btn = document.createElement('button');
       btn.textContent = anim.name;
       btn.onclick = () => runtime.playAnimation(anim.id);
       btnContainer.appendChild(btn);
    });
    
    const canvas = document.getElementById('demo-canvas');
    const ctx = canvas.getContext('2d');
    
    let lastTime = performance.now();
    function loop(now) {
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      
      runtime.update(dt);
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      runtime.draw(ctx, canvas.width / 2, canvas.height / 2);
      
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  </script>
</body>
</html>`;
}
