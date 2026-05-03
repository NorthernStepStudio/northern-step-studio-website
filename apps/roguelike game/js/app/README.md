# Game Runtime File Map

This game now loads runtime code from `index.html` in this order:

1. `vfx.js`
2. `data.js`
3. `core.js`
4. `map.js`
5. `render.js`
6. `systems.js`
7. `combat.js`
8. `progression.js`
9. `setup.js`
10. `controls.js`

Use this ownership map for changes:

- `map.js`: world generation, zone generation, entity placement, fog-of-war map visibility.
- `render.js`: tile rendering, minimap drawing, portal visuals, world enemy visuals, HUD render helpers.
- `controls.js`: movement input, d-pad behavior, keyboard wiring, turn-step handlers.
- `systems.js`: shop, fusion, portal transitions, panel flow, non-combat gameplay systems.
- `combat.js`: combat start/turn/action resolution and encounter end.
- `progression.js`: item use/equip/drop, level-up, floor transition, blacksmith/alchemist, doom, affixes, meta.
- `setup.js`: class select, start/load boot flow, game-screen entry.
- `core.js`: save/load, zoom, sprite load, enemy scaling, cross-system helpers.
- `data.js`: static data tables and globals.
- `vfx.js`: particles, flashes, camera impact effects.

Rule of thumb:

- If it changes how the dungeon is built: `map.js`.
- If it changes how the dungeon looks: `render.js`.
- If it changes movement/input feel: `controls.js`.
- If it changes battle behavior: `combat.js`.
- If it changes progression economy/meta: `progression.js`.
