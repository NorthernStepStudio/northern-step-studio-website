/* eslint-disable no-console */
const { chromium } = require("playwright");

const BASE_URL = process.argv[2] || "https://northernstepstudio.com/games/nexus-roguelike/";

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1200, height: 800 } });
  const page = await context.newPage();

  await page.goto(BASE_URL, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForFunction(
    () => typeof window.migrateSave === "function" && typeof window.migrateV1ToV2 === "function",
    null,
    { timeout: 30000 }
  );

  const result = await page.evaluate(() => {
    function assert(cond, msg) {
      if (!cond) throw new Error(msg);
    }

    const legacyV1 = {
      version: 1,
      savedAt: Date.now() - 10_000,
      zoomLevel: 3,
      customSprite: null,
      G: {
        player: {
          classType: "mage",
          className: "CHAOS WIZARD",
          x: 12,
          y: 8,
          hp: 80,
          maxHp: 90,
          mp: 110,
          maxMp: 120,
          level: 3,
          xp: 40,
          gold: 210,
        },
        inventory: [],
        equippedWeapon: null,
        equippedArmor: null,
        equippedRing: null,
        floorRegistry: { floors: {}, links: {} },
        inZone: null,
        currentFloorId: "NEXUS",
        playtimeMs: 120000,
        corruption: 7,
        bossKills: 1,
        activeModifiers: [],
      },
      unknownLegacyField: { keep: true },
    };

    const migratedV1 = window.migrateSave(legacyV1);
    assert(migratedV1 && migratedV1.data, "legacy v1 did not migrate");
    assert(migratedV1.data.saveVersion >= 3, "legacy v1 migration not upgraded to current");
    assert(migratedV1.data.hero?.classType === "mage", "legacy v1 hero class lost");
    assert(migratedV1.data.currentFloor === "NEXUS", "legacy v1 floor mismatch");

    const dataOnlyV2 = {
      saveVersion: 2,
      gameVersion: "test-v2",
      timestamp: Date.now(),
      hero: {
        classType: "rogue",
        className: "SNEAKY STABBER",
        x: 5,
        y: 6,
        hp: 70,
        maxHp: 85,
        mp: 20,
        maxMp: 55,
        level: 2,
        xp: 10,
        gold: 44,
      },
      inventory: [],
      equippedItems: { weapon: null, armor: null, ring: null },
      currentFloor: "FLR_0099",
      currentPosition: { x: 5, y: 6 },
      floorRegistry: { floors: {}, links: {} },
      world: {
        G: {
          player: {
            classType: "rogue",
            className: "SNEAKY STABBER",
            x: 5,
            y: 6,
            hp: 70,
            maxHp: 85,
            mp: 20,
            maxMp: 55,
            level: 2,
            xp: 10,
            gold: 44,
          },
          inventory: [],
          floorRegistry: { floors: {}, links: {} },
          inZone: "FLR_0099",
          currentFloorId: "FLR_0099",
        },
        zoomLevel: 3,
      },
      extraFieldForFuture: { shouldRemain: true },
    };

    const migratedV2 = window.migrateSave(dataOnlyV2);
    assert(migratedV2 && migratedV2.data, "v2 data-only did not migrate");
    assert(migratedV2.data.saveVersion >= 3, "v2 migration not upgraded to current");
    assert(migratedV2.data.hero?.classType === "rogue", "v2 hero class lost");
    assert(migratedV2.data.extraFieldForFuture?.shouldRemain === true, "unknown future field not preserved");

    const wrapped = {
      reason: "fixture",
      data: dataOnlyV2,
      checksum: "bad", // migrateSave should rebuild envelope and checksum
    };
    const migratedWrapped = window.migrateSave(wrapped);
    assert(migratedWrapped && migratedWrapped.data, "wrapped payload did not migrate");
    assert(migratedWrapped.checksum && migratedWrapped.checksum.length >= 8, "checksum not regenerated");

    return {
      legacyVersionOut: migratedV1.data.saveVersion,
      dataOnlyVersionOut: migratedV2.data.saveVersion,
      wrappedVersionOut: migratedWrapped.data.saveVersion,
      preservedUnknownField: !!migratedV2.data.extraFieldForFuture?.shouldRemain,
    };
  });

  await context.close();
  await browser.close();
  console.log(JSON.stringify({ baseUrl: BASE_URL, ok: true, result }, null, 2));
}

run().catch((error) => {
  console.error(JSON.stringify({ ok: false, error: error instanceof Error ? error.message : String(error) }, null, 2));
  process.exit(1);
});
