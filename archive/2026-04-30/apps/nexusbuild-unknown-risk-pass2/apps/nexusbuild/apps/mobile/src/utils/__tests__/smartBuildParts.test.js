const assert = require('assert');

const run = async () => {
  const module = await import('../smartBuildParts.js');
  const exports = module.default || module;
  const normalizeSmartBuildParts = exports.normalizeSmartBuildParts;
  const normalizeSmartBuildPart = exports.normalizeSmartBuildPart;

  const payload = {
    build: {
      parts: {
        CPU: { name: 'AMD Ryzen 7 7800X3D' },
        memory: { name: 'Corsair Vengeance DDR5 32GB' },
        'power-supply': { name: 'Corsair RM850e' },
      },
    },
  };

  const parts = normalizeSmartBuildParts(payload);
  assert.equal(parts.length, 3);

  const ram = normalizeSmartBuildPart(parts.find((part) => part.name.includes('DDR5')), 1);
  const psu = normalizeSmartBuildPart(parts.find((part) => part.name.includes('RM850e')), 2);

  assert.equal(ram.category, 'ram');
  assert.equal(psu.category, 'psu');

  const memoryAlias = normalizeSmartBuildPart({ name: 'Test RAM', category: 'Memory' }, 3);
  const powerSupplyAlias = normalizeSmartBuildPart({ name: 'Test PSU', category: 'Power Supply' }, 4);

  assert.equal(memoryAlias.category, 'ram');
  assert.equal(powerSupplyAlias.category, 'psu');

  // Test: recommendations array path (the primary path from chatAPI.sendMessage)
  const recommendationsPayload = {
    recommendations: [
      { category: 'cpu', name: 'AMD Ryzen 7 7800X3D', price: 350 },
      { category: 'gpu', name: 'RTX 4070 Super', price: 599 },
      { category: 'ram', name: '32GB DDR5-6000', price: 110 },
      { category: 'psu', name: '850W Gold ATX 3.0', price: 120 },
    ],
  };
  const recParts = normalizeSmartBuildParts(recommendationsPayload);
  assert.equal(recParts.length, 4);

  const recRam = normalizeSmartBuildPart(recParts.find((p) => p.category === 'ram'), 0);
  const recPsu = normalizeSmartBuildPart(recParts.find((p) => p.category === 'psu'), 1);
  assert.ok(recRam, 'RAM should be present in recommendations path');
  assert.ok(recPsu, 'PSU should be present in recommendations path');
  assert.equal(recRam.category, 'ram');
  assert.equal(recPsu.category, 'psu');

  // Test: parts with category "part" (corrupted by old normalizeBuildRecommendations) should be filtered out
  const corruptedPart = normalizeSmartBuildPart({ name: 'Mystery Part', category: 'part' }, 5);
  assert.equal(corruptedPart, null, 'Parts with category "part" should be filtered out');
};

run().then(() => {
  console.log('Smart build normalization tests passed.');
}).catch((error) => {
  console.error('Smart build normalization tests failed.');
  console.error(error);
  process.exit(1);
});