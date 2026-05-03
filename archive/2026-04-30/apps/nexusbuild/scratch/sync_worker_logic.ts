import * as fs from 'fs';

const workerPartsPath = 'apps/backend-worker/src/data/parts.ts';
let content = fs.readFileSync(workerPartsPath, 'utf8');

// Porting the high-budget relaxed constraints and multi-pass upgrade logic

// 1. Update pickBestPart logic
const oldPickBestPart = `    const targetPrice = targets[category];
    const tolerance = CATEGORY_TOLERANCE[category];
    const minTarget = Math.max(0, targetPrice * (1 - tolerance));
    const maxTarget = targetPrice * (1 + tolerance);

    const candidates = getCandidates(category, cappedBudget, selected);`;

const newPickBestPart = `    const targetPrice = targets[category];
    const tolerance = CATEGORY_TOLERANCE[category];
    const minTarget = Math.max(0, targetPrice * (1 - tolerance));
    // Relax maxTarget constraint for high budgets to allow premium components
    const multiplier = normalizedBudget > 2000 ? 3 : 2;
    const maxTarget = Math.max(targetPrice * (1 + tolerance * multiplier), targetPrice + 100);

    const candidates = getCandidates(category, cappedBudget, selected);`;

content = content.replace(oldPickBestPart, newPickBestPart);

// 2. Update upgrade loop to multi-pass
const oldUpgradeLoop = `  let total = currentTotal();
  if (total < normalizedBudget * 0.95) {
    for (const category of modeRules.upgradePriority) {
      const currentPart = build[category];
      if (!currentPart) {
        continue;
      }

      const remainingBudget = Math.max(0, normalizedBudget - total);
      if (remainingBudget < 20) {
        break;
      }

      const upgradedPart = getPartsByCategory(category, partsSource)
        .filter((part) => part.price > currentPart.price)
        .filter((part) => part.price - currentPart.price <= remainingBudget)
        .filter((part) => isCompatible(category, part, build))
        .sort((a, b) => {
          const scoreDiff = getPreferenceScore(b, category) - getPreferenceScore(a, category);
          if (scoreDiff !== 0) {
            return scoreDiff;
          }
          return b.price - a.price;
        })[0];

      if (!upgradedPart) {
        continue;
      }

      build[category] = upgradedPart;
      total = currentTotal();
      if (total >= normalizedBudget * 0.97) {
        break;
      }
    }
  }`;

const newUpgradeLoop = `  let total = currentTotal();
  if (total < normalizedBudget * 0.98) {
    // Multi-pass upgrade strategy to fully utilize budget
    const upgradePriorityExtended = [
      ...modeRules.upgradePriority,
      ...modeRules.upgradePriority
    ];

    for (let pass = 0; pass < 2; pass++) {
      for (const category of modeRules.upgradePriority) {
        const currentPart = build[category];
        const remainingBudget = Math.max(0, normalizedBudget - total);
        if (remainingBudget < 10) {
          break;
        }

        const upgradedPart = getPartsByCategory(category, partsSource)
          .filter((part) => !currentPart || part.price > currentPart.price)
          .filter((part) => (part.price - (currentPart?.price || 0)) <= remainingBudget)
          .filter((part) => isCompatible(category, part, build))
          .sort((a, b) => {
            const scoreDiff = getPreferenceScore(b, category) - getPreferenceScore(a, category);
            if (scoreDiff !== 0) {
              return scoreDiff;
            }
            return b.price - a.price;
          })[0];

        if (upgradedPart && upgradedPart !== currentPart) {
          build[category] = upgradedPart;
          total = currentTotal();
          if (total >= normalizedBudget * 0.995) {
            break;
          }
        }
      }
      if (total >= normalizedBudget * 0.995) break;
    }
  }`;

content = content.replace(oldUpgradeLoop, newUpgradeLoop);

fs.writeFileSync(workerPartsPath, content);
console.log('Worker logic synchronization complete.');
