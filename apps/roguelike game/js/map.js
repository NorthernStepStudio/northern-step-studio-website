// Map generation and high-fidelity rendering.

function getCells(){return G.inZone?G.map.zones[G.inZone].cells:G.map.cells;}
function getMapW(){return G.inZone?G.map.zones[G.inZone].w:MW;}
function getMapH(){return G.inZone?G.map.zones[G.inZone].h:MH;}

// --- GENERATION (Exact Logic from Prototype) ---

function generateMap() {
  const map = Array.from({length:MH},()=>Array(MW).fill('wall'));
  const rooms = [];
  const nr = 16 + Math.min(G.floor, 4);
  for(let a=0;a<900&&rooms.length<nr;a++){
    const w=7+Math.floor(Math.random()*9),h=5+Math.floor(Math.random()*7);
    const x=3+Math.floor(Math.random()*(MW-w-6));
    const y=3+Math.floor(Math.random()*(MH-h-6));
    if(rooms.some(r=>x<r.x+r.w+3&&x+w>r.x-3&&y<r.y+r.h+3&&y+h>r.y-3))continue;
    rooms.push({x,y,w,h});
    for(let ry=y;ry<y+h;ry++)for(let rx=x;rx<x+w;rx++)map[ry][rx]='floor';
  }
  for(let i=1;i<rooms.length;i++){
    const a=rooms[i-1],b=rooms[i];
    let cx=Math.floor(a.x+a.w/2),cy=Math.floor(a.y+a.h/2);
    const bx=Math.floor(b.x+b.w/2),by=Math.floor(b.y+b.h/2);
    if(Math.random()<.5){
      while(cx!==bx){map[cy][cx]='floor';cx+=bx>cx?1:-1;}
      while(cy!==by){map[cy][cx]='floor';cy+=by>cy?1:-1;}
    }else{
      while(cy!==by){map[cy][cx]='floor';cy+=by>cy?1:-1;}
      while(cx!==bx){map[cy][cx]='floor';cx+=bx>cx?1:-1;}
    }
  }
  G.map = {
    cells: map.map((row, y) => row.map((t, x) => ({
      type: t, visible: false, seen: false, entity: null,
      variation: Math.random() < 0.1 ? (Math.random() < 0.5 ? 'cracked' : 'mossy') : '',
      prop: Math.random() < 0.05 ? (Math.random() < 0.5 ? '💀' : '🍄') : ''
    }))),
    rooms,
    zones: {}
  };
}

function placeEntities() {
  const rooms = G.map.rooms;
  const st = rooms[0];
  G.player.x = Math.floor(st.x + st.w/2);
  G.player.y = Math.floor(st.y + st.h/2);

  const scored = rooms.map((r,i) => ({r, i, cx: r.x+r.w/2, cy: r.y+r.h/2}));
  const usedRooms = new Set([0]);

  // Stairs
  const stairsRoom = scored[scored.length - 1];
  const sx = Math.floor(stairsRoom.cx), sy = Math.floor(stairsRoom.cy);
  G.map.cells[sy][sx].entity = 'stairs';
  usedRooms.add(stairsRoom.i);

  // Simple enemy/item spawn
  const pool = ENEMIES.filter(e => e.floor <= G.floor);
  rooms.forEach((rm, i) => {
    if (usedRooms.has(i)) return;
    if (Math.random() < 0.7) {
      const ex = rm.x + Math.floor(Math.random() * rm.w);
      const ey = rm.y + Math.floor(Math.random() * rm.h);
      const tmpl = pool[Math.floor(Math.random() * pool.length)];
      const en = scaleEnemy(tmpl, G.floor, G.player.level);
      en.x = ex; en.y = ey;
      G.enemies.push(en);
    }
  });
}

function updateVision(px, py) {
  const cells = getCells(), cw = getMapW(), ch = getMapH();
  const r = 6;
  for(let y=0; y<ch; y++) for(let x=0; x<cw; x++) cells[y][x].visible = false;
  for(let dy=-r; dy<=r; dy++) for(let dx=-r; dx<=r; dx++) {
    if(dx*dx+dy*dy > r*r) continue;
    const nx=px+dx, ny=py+dy;
    if(nx>=0 && ny>=0 && nx<cw && ny<ch) {
      cells[ny][nx].visible = true; cells[ny][nx].seen = true;
    }
  }
}

// --- RENDERING (New Visual Upgrade) ---

function getWallConnectivity(x, y, cells, cw, ch) {
  let classes = [];
  const isFloor = (nx, ny) => {
    if (nx < 0 || ny < 0 || nx >= cw || ny >= ch) return false;
    return cells[ny][nx].type === 'floor';
  };
  if (isFloor(x, y - 1)) classes.push('w-n');
  if (isFloor(x, y + 1)) classes.push('w-s');
  if (isFloor(x + 1, y)) classes.push('w-e');
  if (isFloor(x - 1, y)) classes.push('w-w');
  return classes;
}

function renderMap() {
  const p = G.player, cs = 24; // getCellSize or constant
  const el = document.getElementById('dungeon-map');
  if (!el) return;
  const cells = getCells(), cw = getMapW(), ch = getMapH();
  el.style.gridTemplateColumns = `repeat(${cw},${cs}px)`;
  el.innerHTML = '';

  const lighting = document.getElementById('map-lighting');
  if (lighting) {
    const px = (p.x * cs) + (cs / 2) + 1000;
    const py = (p.y * cs) + (cs / 2) + 1000;
    lighting.style.setProperty('--px', px + 'px');
    lighting.style.setProperty('--py', py + 'px');
  }

  for (let y = 0; y < ch; y++) {
    for (let x = 0; x < cw; x++) {
      const cell = cells[y][x];
      const div = document.createElement('div');
      div.className = 'cell';
      div.style.width = cs + 'px'; div.style.height = cs + 'px';

      if (!cell.seen) { div.classList.add('fog'); el.appendChild(div); continue; }
      
      if (cell.type === 'wall') {
        div.classList.add('wall');
        getWallConnectivity(x, y, cells, cw, ch).forEach(c => div.classList.add(c));
        if (!cell.visible) div.classList.add('seen');
        el.appendChild(div); continue;
      }

      div.classList.add('floor');
      if (cell.variation) div.classList.add(cell.variation);
      if (!cell.visible) { div.classList.add('seen'); el.appendChild(div); continue; }

      if (cell.prop) {
        const propEl = document.createElement('div');
        propEl.className = 'prop'; propEl.textContent = cell.prop;
        div.appendChild(propEl);
      }

      // Entities
      const en = G.enemies.find(e => e.x === x && e.y === y);
      if (x === p.x && y === p.y) {
        div.innerHTML += `<div class="hero-sprite">${G.player.emoji}</div>`;
      } else if (en) {
        div.innerHTML += buildMonsterHTML(en, cs);
      } else if (cell.entity === 'stairs') {
        div.innerHTML += `<span class="ce">⬇️</span>`;
      }
      el.appendChild(div);
    }
  }

  const wrap = document.getElementById('map-scroll');
  if (wrap) {
    const px = p.x * cs, py = p.y * cs;
    wrap.scrollTo({ left: px - wrap.clientWidth / 2, top: py - wrap.clientHeight / 2, behavior: 'auto' });
  }
}
