/* eslint-disable no-console */
const { chromium, devices } = require("playwright");

const BASE_URL = process.argv[2] || "https://northernstepstudio.com/games/nexus-roguelike/";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function run() {
  const results = [];
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1366, height: 900 },
  });
  context.on("dialog", (dialog) => dialog.accept().catch(() => {}));
  let page = await context.newPage();

  async function step(id, name, fn) {
    const startedAt = Date.now();
    try {
      const detail = await fn();
      results.push({
        id,
        name,
        pass: true,
        detail: detail || "ok",
        ms: Date.now() - startedAt,
      });
    } catch (error) {
      results.push({
        id,
        name,
        pass: false,
        detail: error instanceof Error ? error.message : String(error),
        ms: Date.now() - startedAt,
      });
    }
  }

  async function gotoGame(targetPage) {
    await targetPage.goto(BASE_URL, { waitUntil: "domcontentloaded", timeout: 60000 });
    await targetPage.waitForSelector("#title-screen", { timeout: 30000 });
    await targetPage.waitForFunction(() => typeof window.startNewGame === "function", null, { timeout: 30000 });
  }

  async function startFreshRun(targetPage, heroClass = "mage") {
    await targetPage.evaluate(async () => {
      if (typeof window.clearSaves === "function") {
        await window.clearSaves(true);
      }
      localStorage.removeItem("doomed_v4");
      localStorage.removeItem("doomed_v4_backup");
      await new Promise((resolve) => {
        if (!("indexedDB" in window)) return resolve();
        const req = indexedDB.deleteDatabase("nexus_roguelike_save_db");
        req.onsuccess = () => resolve();
        req.onerror = () => resolve();
        req.onblocked = () => resolve();
      });
    });
    await targetPage.reload({ waitUntil: "domcontentloaded" });
    await targetPage.waitForSelector(`#title-screen .class-card[data-class="${heroClass}"]`, { timeout: 15000 });
    await targetPage.click(`#title-screen .class-card[data-class="${heroClass}"]`);
    await targetPage.click("#start-btn");
    await targetPage.waitForFunction(() => {
      const gs = document.getElementById("game-screen");
      return gs && getComputedStyle(gs).display !== "none" && (typeof G !== "undefined") && !!G.player;
    }, null, { timeout: 20000 });
  }

  async function snapshotState(targetPage) {
    return targetPage.evaluate(() => {
      const g = (typeof G !== "undefined" && G) ? G : {};
      const hero = g.player || {};
      return {
        floorId: g.currentFloorId || null,
        inZone: g.inZone || null,
        x: hero.x,
        y: hero.y,
        hp: hero.hp,
        maxHp: hero.maxHp,
        mp: hero.mp,
        maxMp: hero.maxMp,
        level: hero.level,
        xp: hero.xp,
        gold: hero.gold,
        inventoryCount: Array.isArray(g.inventory) ? g.inventory.length : 0,
        kills: g.kills || 0,
      };
    });
  }

  async function assertProgressEqual(before, after, keys, contextLabel) {
    for (const key of keys) {
      if (before[key] !== after[key]) {
        throw new Error(`${contextLabel}: ${key} mismatch (${before[key]} vs ${after[key]})`);
      }
    }
  }

  await step(1, "Route loads on production URL", async () => {
    await gotoGame(page);
    const url = page.url();
    if (!url.includes("/games/nexus-roguelike")) throw new Error(`Unexpected URL ${url}`);
    return url;
  });

  await step(2, "Start new game + hero select", async () => {
    await startFreshRun(page, "mage");
    const heroClass = await page.evaluate(() => (typeof G !== "undefined" && G?.player) ? G.player.classType : undefined);
    if (heroClass !== "mage") throw new Error(`Expected mage class, got ${heroClass}`);
    return `class=${heroClass}`;
  });

  await step(3, "Enter floor through portal", async () => {
    await page.evaluate(() => {
      if (typeof enterPortal !== "function") throw new Error("enterPortal unavailable");
      enterPortal("N");
    });
    await page.waitForFunction(() => (typeof G !== "undefined") && G?.inZone && G?.currentFloorId !== "NEXUS", null, { timeout: 20000 });
    const floor = await page.evaluate(() => (typeof G !== "undefined" && G) ? (G.currentFloorId || null) : null);
    return `currentFloor=${floor}`;
  });

  await step(4, "Pick up an item", async () => {
    const before = await page.evaluate(() => (typeof G !== "undefined" && Array.isArray(G?.inventory)) ? G.inventory.length : 0);
    await page.evaluate(() => {
      const g = G;
      const p = g.player;
      const cells = getCells();
      const tile = cells?.[p.y]?.[p.x] || null;
      const prevEntity = tile ? tile.entity : null;
      const item = {
        id: `qa_item_${Date.now()}`,
        uid: `qa_item_${Date.now()}`,
        name: "QA Potion",
        emoji: "🧪",
        type: "consumable",
        tier: 1,
        desc: "QA pickup item",
        effect: { hp: 1 },
        value: 1,
        x: p.x,
        y: p.y,
      };
      const list = g.inZone ? (g.zoneItems[g.inZone] ||= []) : g.items;
      list.push(item);
      if (tile) tile.entity = null;
      tryPickup();
      if (tile) tile.entity = prevEntity;
    });
    await page.waitForFunction((prev) => (typeof G !== "undefined" && Array.isArray(G?.inventory) ? G.inventory.length : 0) > prev, before, { timeout: 10000 });
    const after = await page.evaluate(() => (typeof G !== "undefined" && Array.isArray(G?.inventory)) ? G.inventory.length : 0);
    return `inventory ${before} -> ${after}`;
  });

  await step(5, "Defeat an enemy", async () => {
    const beforeKills = await page.evaluate(() => (typeof G !== "undefined" && G) ? (G.kills || 0) : 0);
    await page.evaluate(() => {
      const g = G;
      const p = g.player;
      const enemy = {
        id: `qa_enemy_${Date.now()}`,
        name: "QA Slime",
        emoji: "🟢",
        level: 1,
        hp: 1,
        maxHp: 1,
        atk: 0,
        def: 0,
        xp: 1,
        gold: 1,
        taunt: ["..."],
        wpn: "Tiny Teeth",
        x: p.x + 1,
        y: p.y,
      };
      startCombat(enemy);
      ca("attack");
    });
    await page.waitForFunction((prev) => (typeof G !== "undefined" && G ? (G.kills || 0) : 0) > prev, beforeKills, { timeout: 15000 });
    const afterKills = await page.evaluate(() => (typeof G !== "undefined" && G) ? (G.kills || 0) : 0);
    return `kills ${beforeKills} -> ${afterKills}`;
  });

  let preRefreshSnapshot;
  await step(6, "Refresh page preserves progression", async () => {
    preRefreshSnapshot = await snapshotState(page);
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForSelector("#continue-btn", { timeout: 15000 });
    await page.click("#continue-btn");
    await page.waitForFunction(() => (typeof G !== "undefined") && G?.player && document.getElementById("game-screen") && getComputedStyle(document.getElementById("game-screen")).display !== "none", null, { timeout: 20000 });
    const post = await snapshotState(page);
    await assertProgressEqual(
      preRefreshSnapshot,
      post,
      ["floorId", "inZone", "level", "inventoryCount", "kills"],
      "refresh-check"
    );
    return `floor=${post.floorId}, inv=${post.inventoryCount}, kills=${post.kills}`;
  });

  await step(7, "Close/reopen tab preserves progression", async () => {
    const before = await snapshotState(page);
    await page.close();
    page = await context.newPage();
    await gotoGame(page);
    await page.click("#continue-btn");
    await page.waitForFunction(() => (typeof G !== "undefined") && G?.player && document.getElementById("game-screen") && getComputedStyle(document.getElementById("game-screen")).display !== "none", null, { timeout: 20000 });
    const after = await snapshotState(page);
    await assertProgressEqual(before, after, ["floorId", "inZone", "level", "inventoryCount", "kills"], "tab-reopen-check");
    return `floor=${after.floorId}, inv=${after.inventoryCount}, kills=${after.kills}`;
  });

  let exportedSaveCode = "";
  await step(8, "Export save", async () => {
    await page.evaluate(async () => {
      if (typeof window.saveNow === "function") await window.saveNow(false);
      if (typeof window.exportSaveData === "function") await window.exportSaveData();
    });
    await sleep(400);
    exportedSaveCode = await page.$eval("#save-code", (el) => el.value || "");
    if (!exportedSaveCode || exportedSaveCode.length < 50) {
      throw new Error("Exported save code not generated");
    }
    return `codeLength=${exportedSaveCode.length}`;
  });

  await step(9, "Import save after wipe", async () => {
    const before = await snapshotState(page);
    await page.evaluate(async (code) => {
      if (typeof window.clearSaves === "function") {
        await window.clearSaves(true, false);
      }
      const ta = document.getElementById("save-code");
      ta.value = code;
      if (typeof window.importSaveCode === "function") {
        await window.importSaveCode();
      }
    }, exportedSaveCode);
    await page.waitForFunction(() => (typeof G !== "undefined") && !!G?.player, null, { timeout: 20000 });
    const after = await snapshotState(page);
    await assertProgressEqual(before, after, ["floorId", "inZone", "level", "inventoryCount", "kills"], "import-check");
    return `import restored floor=${after.floorId}`;
  });

  await step(10, "Corrupt latest save and recover from backup", async () => {
    await page.evaluate(async () => {
      // Create at least two save generations
      if (typeof window.saveNow === "function") {
        await window.saveNow(false);
        G.player.gold += 1;
        await window.saveNow(false);
      }
      const base = (typeof SK === "string" && SK) ? SK : "doomed_v4";
      localStorage.setItem(`${base}_autosave_latest`, "{bad_json");
      localStorage.setItem(base, "{bad_json");

      if ("indexedDB" in window) {
        await new Promise((resolve) => {
          const req = indexedDB.open("nexus_roguelike_save_db", 1);
          req.onsuccess = () => {
            const db = req.result;
            const tx = db.transaction("slots", "readwrite");
            const st = tx.objectStore("slots");
            st.put({ slot: "autosave_latest", raw: "{bad_json", updatedAt: Date.now() });
            st.put({ slot: "legacy_primary", raw: "{bad_json", updatedAt: Date.now() });
            tx.oncomplete = () => resolve();
            tx.onerror = () => resolve();
            tx.onabort = () => resolve();
          };
          req.onerror = () => resolve();
          req.onupgradeneeded = () => {
            const db = req.result;
            if (!db.objectStoreNames.contains("slots")) {
              db.createObjectStore("slots", { keyPath: "slot" });
            }
          };
        });
      }
    });

    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForSelector("#continue-btn", { timeout: 15000 });
    await page.click("#continue-btn");
    await page.waitForFunction(() => (typeof G !== "undefined") && !!G?.player, null, { timeout: 20000 });

    const status = await page.$eval("#save-status", (el) => el.textContent || "");
    if (!status.toLowerCase().includes("recover") && !status.toLowerCase().includes("loaded")) {
      throw new Error(`Unexpected save status after corruption recovery: ${status}`);
    }
    return `status=${status}`;
  });

  await step(11, "Mobile layout renders at common widths", async () => {
    const widths = [360, 390, 414, 768];
    for (const w of widths) {
      const mobileContext = await browser.newContext({
        ...devices["iPhone 12"],
        viewport: { width: w, height: w >= 768 ? 1024 : 800 },
        hasTouch: true,
        isMobile: true,
      });
      mobileContext.on("dialog", (dialog) => dialog.accept().catch(() => {}));
      const mobilePage = await mobileContext.newPage();
      await gotoGame(mobilePage);
      await mobilePage.click(`#title-screen .class-card[data-class="rogue"]`);
      await mobilePage.click("#start-btn");
      await mobilePage.waitForFunction(() => (typeof G !== "undefined") && !!G?.player, null, { timeout: 20000 });
      const checks = await mobilePage.evaluate(() => {
        const dpad = document.getElementById("dpad");
        const actionBar = document.getElementById("action-bar");
        const hud = document.getElementById("hud");
        const mapWrap = document.getElementById("map-wrap");
        const vv = window.visualViewport;
        const viewportW = vv ? vv.width : window.innerWidth;
        const viewportH = vv ? vv.height : window.innerHeight;
        const dpadRect = dpad?.getBoundingClientRect();
        const actionRect = actionBar?.getBoundingClientRect();
        const hudRect = hud?.getBoundingClientRect();
        const mapRect = mapWrap?.getBoundingClientRect();
        return {
          viewportW,
          viewportH,
          dpadVisible: !!dpadRect && dpadRect.width > 20 && dpadRect.height > 20,
          hudVisible: !!hudRect && hudRect.height > 20,
          actionVisible: !!actionRect && actionRect.height > 20,
          mapVisible: !!mapRect && mapRect.height > 100,
        };
      });
      await mobileContext.close();
      if (!checks.dpadVisible || !checks.hudVisible || !checks.actionVisible || !checks.mapVisible) {
        throw new Error(`Layout check failed at width ${w}: ${JSON.stringify(checks)}`);
      }
    }
    return "layouts ok @360/390/414/768";
  });

  await step(12, "Touch controls move hero", async () => {
    const mobileContext = await browser.newContext({
      ...devices["iPhone 12"],
      hasTouch: true,
      isMobile: true,
    });
    mobileContext.on("dialog", (dialog) => dialog.accept().catch(() => {}));
    const mobilePage = await mobileContext.newPage();
    await gotoGame(mobilePage);
    await mobilePage.click(`#title-screen .class-card[data-class="paladin"]`);
    await mobilePage.click("#start-btn");
    await mobilePage.waitForSelector("#dpad", { timeout: 20000 });
    const before = await mobilePage.evaluate(() => ({ x: (typeof G !== "undefined" && G?.player) ? G.player.x : undefined, y: (typeof G !== "undefined" && G?.player) ? G.player.y : undefined }));
    await mobilePage.locator("#dpad .dp", { hasText: "▶" }).first().tap();
    await sleep(350);
    const after = await mobilePage.evaluate(() => ({ x: (typeof G !== "undefined" && G?.player) ? G.player.x : undefined, y: (typeof G !== "undefined" && G?.player) ? G.player.y : undefined }));
    await mobileContext.close();
    if (typeof before.x !== "number" || typeof after.x !== "number") {
      throw new Error("Player coordinates unavailable on mobile");
    }
    if (after.x === before.x && after.y === before.y) {
      throw new Error(`Touch movement failed (${before.x},${before.y}) -> (${after.x},${after.y})`);
    }
    return `hero moved (${before.x},${before.y}) -> (${after.x},${after.y})`;
  });

  await step(13, "Deployed asset paths load from game route", async () => {
    const checks = [
      `${BASE_URL}js/app/save.js?v=20260429r1`,
      `${BASE_URL}js/app/world_renderer.js?v=20260429r1`,
      `${BASE_URL}css/app/base.css?v=20260429r1`,
      `${BASE_URL}manifest.webmanifest?v=20260429r1`,
    ];
    for (const u of checks) {
      const response = await page.request.get(u, { timeout: 30000 });
      if (!response.ok()) throw new Error(`Asset failed ${u} -> ${response.status()}`);
      const cacheControl = (response.headers()["cache-control"] || "").toLowerCase();
      if (!cacheControl.includes("max-age=0")) {
        throw new Error(`Unsafe cache header for ${u}: ${cacheControl || "<missing>"}`);
      }
    }
    return `validated ${checks.length} assets`;
  });

  await context.close();
  await browser.close();

  const passed = results.filter((r) => r.pass).length;
  const failed = results.length - passed;
  console.log(JSON.stringify({ baseUrl: BASE_URL, passed, failed, results }, null, 2));
  if (failed > 0) process.exitCode = 2;
}

run().catch((error) => {
  console.error("Checklist runner fatal error:", error);
  process.exit(1);
});
