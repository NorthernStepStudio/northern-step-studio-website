// Map generation, camera, and minimap rendering.
const MW = 100;
const MH = 75;
let zoomLevel = 2;
const ZOOM_STEPS = [-8, -4, 0, 4, 8, 12, 18];

function getBaseCellSize() {
  const wrap = document.getElementById('map-scroll');
  if (!wrap) return 28;
  const availW = Math.max(220, wrap.clientWidth - 12);
  const availH = Math.max(180, wrap.clientHeight - 12);
  return Math.max(18, Math.min(56, Math.floor(Math.min(availW / MW, availH / MH))));
}

function getCellSize() {
  return Math.max(16, Math.min(64, getBaseCellSize() + ZOOM_STEPS[zoomLevel]));
}

function adjustZoom(dir) {
  zoomLevel = Math.max(0, Math.min(ZOOM_STEPS.length - 1, zoomLevel + dir));
  if (G.map) {
    renderMap();
    saveG();
  }
}

function generateMap() {
  const map = Array.from({ length: MH }, () => Array(MW).fill('wall'));
  const rooms = [];
  const targetRooms = 60 + Math.min(G.floor * 10, 80);

  for (let attempts = 0; attempts < 1500 && rooms.length < targetRooms; attempts += 1) {
    const width = 4 + Math.floor(Math.random() * 5);
    const height = 3 + Math.floor(Math.random() * 4);
    const x = 1 + Math.floor(Math.random() * (MW - width - 2));
    const y = 1 + Math.floor(Math.random() * (MH - height - 2));

    if (rooms.some((room) => x < room.x + room.w + 1 && x + width > room.x - 1 && y < room.y + room.h + 1 && y + height > room.y - 1)) {
      continue;
    }

    rooms.push({ x, y, w: width, h: height });
    for (let ry = y; ry < y + height; ry += 1) {
      for (let rx = x; rx < x + width; rx += 1) {
        map[ry][rx] = 'floor';
      }
    }
  }

  for (let i = 1; i < rooms.length; i += 1) {
    const a = rooms[i - 1];
    const b = rooms[i];
    let cx = Math.floor(a.x + a.w / 2);
    let cy = Math.floor(a.y + a.h / 2);
    const bx = Math.floor(b.x + b.w / 2);
    const by = Math.floor(b.y + b.h / 2);

    while (cx !== bx) {
      map[cy][cx] = 'floor';
      cx += bx > cx ? 1 : -1;
    }
    while (cy !== by) {
      map[cy][cx] = 'floor';
      cy += by > cy ? 1 : -1;
    }
  }

  G.map = {
    cells: map.map((row) => row.map((type) => ({ type, visible: false, seen: false, entity: null }))),
    rooms
  };
}

function freeTile(room, excluded) {
  for (let attempts = 0; attempts < 80; attempts += 1) {
    const tx = room.x + Math.floor(Math.random() * room.w);
    const ty = room.y + Math.floor(Math.random() * room.h);
    if (tx < 1 || ty < 1 || tx >= MW - 1 || ty >= MH - 1) continue;
    if (G.map.cells[ty][tx].type !== 'floor') continue;
    if (G.map.cells[ty][tx].entity) continue;
    if (excluded.some(([ex, ey]) => ex === tx && ey === ty)) continue;
    return [tx, ty];
  }
  return null;
}

function placeEntities() {
  const rooms = G.map.rooms;
  G.enemies = [];
  G.items = [];
  G.shrineEvents = [];

  const startRoom = rooms[0];
  G.player.x = Math.floor(startRoom.x + startRoom.w / 2);
  G.player.y = Math.floor(startRoom.y + startRoom.h / 2);

  const lastRoom = rooms[rooms.length - 1];
  const stairsX = Math.floor(lastRoom.x + lastRoom.w / 2);
  const stairsY = Math.floor(lastRoom.y + lastRoom.h / 2);
  G.map.cells[stairsY][stairsX].entity = G.floor % 3 === 0 ? 'pit' : 'stairs';

  const usedRooms = new Set([0, rooms.length - 1]);
  if (rooms.length > 3) {
    const roomIndexes = rooms.map((_, index) => index).slice(1, -1).sort(() => Math.random() - 0.5);

    const shopRoomIndex = roomIndexes.shift();
    if (typeof shopRoomIndex === 'number') {
      const shopRoom = rooms[shopRoomIndex];
      const shopPos = freeTile(shopRoom, [[G.player.x, G.player.y], [stairsX, stairsY]]);
      if (shopPos) {
        G.map.cells[shopPos[1]][shopPos[0]].entity = 'shop';
        usedRooms.add(shopRoomIndex);
      }
    }

    const smithRoomIndex = roomIndexes.find((index) => !usedRooms.has(index));
    if (typeof smithRoomIndex === 'number') {
      const smithRoom = rooms[smithRoomIndex];
      const smithPos = freeTile(smithRoom, [[G.player.x, G.player.y], [stairsX, stairsY]]);
      if (smithPos) {
        G.map.cells[smithPos[1]][smithPos[0]].entity = 'blacksmith';
        usedRooms.add(smithRoomIndex);
      }
    }

    if (G.floor >= 2) {
      const alchRoomIndex = roomIndexes.find((index) => !usedRooms.has(index));
      if (typeof alchRoomIndex === 'number') {
        const alchRoom = rooms[alchRoomIndex];
        const alchPos = freeTile(alchRoom, [[G.player.x, G.player.y], [stairsX, stairsY]]);
        if (alchPos) {
          G.map.cells[alchPos[1]][alchPos[0]].entity = 'alchemist';
          usedRooms.add(alchRoomIndex);
        }
      }
    }

    if (G.floor >= 2) {
      const shrineRoomIndex = roomIndexes.find((index) => !usedRooms.has(index));
      if (typeof shrineRoomIndex === 'number') {
        const shrineRoom = rooms[shrineRoomIndex];
        const shrinePos = freeTile(shrineRoom, [[G.player.x, G.player.y], [stairsX, stairsY]]);
        if (shrinePos) {
          G.map.cells[shrinePos[1]][shrinePos[0]].entity = 'shrine';
          G.shrineEvents.push({
            x: shrinePos[0],
            y: shrinePos[1],
            used: false,
            options: typeof generateShrineOptions === 'function' ? generateShrineOptions() : []
          });
          usedRooms.add(shrineRoomIndex);
        }
      }
    }

    if (G.floor >= 2) {
      const eliteRoomIndex = roomIndexes.find((index) => !usedRooms.has(index));
      if (typeof eliteRoomIndex === 'number') {
        const eliteRoom = rooms[eliteRoomIndex];
        const elitePos = freeTile(eliteRoom, [[G.player.x, G.player.y], [stairsX, stairsY]]);
        if (elitePos) {
          const pool = ENEMIES.filter((enemy) => enemy.floor <= G.floor && !enemy.boss);
          const template = pool[Math.floor(Math.random() * pool.length)];
          const elite = scaleEnemy(template, G.floor, G.player.level, 'mini');
          elite.x = elitePos[0];
          elite.y = elitePos[1];
          G.enemies.push(elite);
          usedRooms.add(eliteRoomIndex);
        }
      }
    }
  }

  if (G.floor <= 5) {
    const bossPos = freeTile(lastRoom, [[G.player.x, G.player.y], [stairsX, stairsY]]);
    if (bossPos) {
      const template = G.floor <= 4 ? FLOOR_BOSSES[G.floor - 1] : ENEMIES.find((enemy) => enemy.boss);
      const boss = scaleEnemy(template, G.floor, G.player.level, 'boss');
      boss.x = bossPos[0];
      boss.y = bossPos[1];
      G.enemies.push(boss);
    }
  }

  rooms.forEach((room, index) => {
    if (index === 0) return;
    if (index === rooms.length - 1) return;
    if (usedRooms.has(index)) return;

    const enemyCount = 1 + Math.floor(Math.random() * (1 + Math.min(G.floor, 5)));
    for (let i = 0; i < enemyCount; i += 1) {
      const pos = freeTile(room, [[G.player.x, G.player.y], ...G.enemies.map((enemy) => [enemy.x, enemy.y])]);
      if (!pos) continue;
      const pool = ENEMIES.filter((enemy) => enemy.floor <= G.floor && !enemy.boss);
      const template = pool[Math.floor(Math.random() * pool.length)];
      const enemy = scaleEnemy(template, G.floor, G.player.level);
      enemy.x = pos[0];
      enemy.y = pos[1];
      G.enemies.push(enemy);
    }

    if (Math.random() < 0.4 + G.floor / 50) {
      const pos = freeTile(room, [[G.player.x, G.player.y], ...G.enemies.map((enemy) => [enemy.x, enemy.y])]);
      if (!pos) return;
      const item = Math.random() < 0.3
        ? makeItem(['weapon', 'armor', 'ring'][Math.floor(Math.random() * 3)], Math.min(4, G.floor - 1))
        : rollMaterialDrop(G.floor);
      if (item) {
        item.x = pos[0];
        item.y = pos[1];
        G.items.push(item);
      }
    }
  });
}

function renderMinimap() {
  const canvas = document.getElementById('minimap-canvas');
  if (!canvas || !G.map) return;

  const ctx = canvas.getContext('2d');
  const scale = 2;
  canvas.width = MW * scale;
  canvas.height = MH * scale;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let y = 0; y < MH; y += 1) {
    for (let x = 0; x < MW; x += 1) {
      const cell = G.map.cells[y][x];
      if (!cell.seen) continue;
      ctx.fillStyle = cell.type === 'wall' ? '#33274f' : '#0f1628';
      if (!cell.visible) ctx.globalAlpha = 0.4;
      ctx.fillRect(x * scale, y * scale, scale, scale);
      ctx.globalAlpha = 1;

      if (cell.entity === 'shop') {
        ctx.fillStyle = '#ffd166';
        ctx.fillRect(x * scale, y * scale, scale, scale);
      } else if (cell.entity === 'blacksmith') {
        ctx.fillStyle = '#ff8c42';
        ctx.fillRect(x * scale, y * scale, scale, scale);
      } else if (cell.entity === 'alchemist') {
        ctx.fillStyle = '#b06cff';
        ctx.fillRect(x * scale, y * scale, scale, scale);
      } else if (cell.entity === 'shrine') {
        ctx.fillStyle = '#58f5d7';
        ctx.fillRect(x * scale, y * scale, scale, scale);
      } else if (cell.entity === 'stairs' || cell.entity === 'pit') {
        ctx.fillStyle = '#7cf3ff';
        ctx.fillRect(x * scale, y * scale, scale, scale);
      }
    }
  }

  G.enemies.forEach((enemy) => {
    if (!G.map.cells[enemy.y][enemy.x].visible) return;
    ctx.fillStyle = enemy.boss ? '#ff4466' : enemy.enemyType === 'mini' ? '#ffe36c' : '#ff9f43';
    ctx.fillRect(enemy.x * scale, enemy.y * scale, scale, scale);
  });

  ctx.fillStyle = '#7bff8d';
  ctx.fillRect(G.player.x * scale, G.player.y * scale, scale, scale);
}

function renderMap() {
  const canvas = document.getElementById('dungeon-canvas');
  if (!canvas || !G.map) return;

  const ctx = canvas.getContext('2d');
  const cellSize = getCellSize();
  canvas.width = MW * cellSize;
  canvas.height = MH * cellSize;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const cells = G.map.cells;
  for (let y = 0; y < MH; y += 1) {
    for (let x = 0; x < MW; x += 1) {
      const cell = cells[y][x];
      if (!cell.seen) continue;
      ctx.fillStyle = cell.type === 'wall' ? '#1a1a2a' : '#0f0f1c';
      if (!cell.visible) ctx.globalAlpha = 0.4;
      ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
      ctx.globalAlpha = 1;

      if (!cell.visible) continue;
      ctx.font = `${Math.floor(cellSize * 0.7)}px monospace`;
      ctx.fillStyle = '#dce6ff';
      if (cell.entity === 'stairs') ctx.fillText('>', x * cellSize + 4, y * cellSize + cellSize - 6);
      if (cell.entity === 'pit') ctx.fillText('O', x * cellSize + 4, y * cellSize + cellSize - 6);
      if (cell.entity === 'shop') ctx.fillText('$', x * cellSize + 4, y * cellSize + cellSize - 6);
      if (cell.entity === 'blacksmith') ctx.fillText('F', x * cellSize + 4, y * cellSize + cellSize - 6);
      if (cell.entity === 'alchemist') ctx.fillText('A', x * cellSize + 4, y * cellSize + cellSize - 6);
      if (cell.entity === 'shrine') ctx.fillText('?', x * cellSize + 4, y * cellSize + cellSize - 6);
    }
  }

  G.items.forEach((item) => {
    if (!cells[item.y]?.[item.x]?.visible) return;
    ctx.font = `${Math.floor(cellSize * 0.7)}px monospace`;
    ctx.fillStyle = '#ffd166';
    ctx.fillText(glyphForThing(item), item.x * cellSize + 4, item.y * cellSize + cellSize - 6);
  });

  G.enemies.forEach((enemy) => {
    if (!cells[enemy.y]?.[enemy.x]?.visible) return;
    ctx.font = `${Math.floor(cellSize * 0.7)}px monospace`;
    ctx.fillStyle = enemy.boss ? '#ff6680' : enemy.enemyType === 'mini' ? '#ffe36c' : '#ffad5a';
    ctx.fillText(glyphForEnemy(enemy), enemy.x * cellSize + 4, enemy.y * cellSize + cellSize - 6);
  });

  ctx.font = `${Math.floor(cellSize * 0.8)}px monospace`;
  ctx.fillStyle = '#7bff8d';
  ctx.fillText('@', G.player.x * cellSize + 2, G.player.y * cellSize + cellSize - 4);

  const wrap = document.getElementById('map-scroll');
  const px = G.player.x * cellSize;
  const py = G.player.y * cellSize;
  wrap.scrollTo({ left: px - wrap.clientWidth / 2, top: py - wrap.clientHeight / 2, behavior: 'auto' });

  renderMinimap();
}

function updateVision(px, py) {
  const radius = 6;
  G.map.cells.forEach((row) => row.forEach((cell) => { cell.visible = false; }));

  for (let y = py - radius; y < py + radius; y += 1) {
    for (let x = px - radius; x < px + radius; x += 1) {
      if (x < 0 || y < 0 || x >= MW || y >= MH) continue;
      const distance = Math.sqrt((x - px) ** 2 + (y - py) ** 2);
      if (distance < radius) {
        G.map.cells[y][x].visible = true;
        G.map.cells[y][x].seen = true;
      }
    }
  }
}

function onMapClick(event) {
  const canvas = document.getElementById('dungeon-canvas');
  if (!canvas || !G.player || openPanel || G.currentEnemy) return;
  const rect = canvas.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) return;

  const cellSize = getCellSize();
  const worldX = event.clientX - rect.left;
  const worldY = event.clientY - rect.top;
  const tx = Math.floor(worldX / cellSize);
  const ty = Math.floor(worldY / cellSize);

  if (tx >= 0 && tx < MW && ty >= 0 && ty < MH) {
    handleMove(tx, ty);
  }
}

document.getElementById('map-scroll')?.addEventListener('pointerdown', onMapClick);

window.addEventListener('resize', () => {
  if (G.map) renderMap();
});
