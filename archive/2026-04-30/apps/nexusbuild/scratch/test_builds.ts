import { getBudgetBuild } from '../apps/backend/src/data/index';

function testBuild(budget: number, useCase: 'gaming' | 'streaming' | 'workstation') {
    console.log(`\nTesting ${useCase} build with budget: $${budget}`);
    const parts = getBudgetBuild(budget, useCase);
    let total = 0;
    console.log('| Category | Part | Price |');
    console.log('|----------|------|-------|');
    parts.forEach(p => {
        console.log(`| ${p.category} | ${p.name} | $${p.price} |`);
        total += p.price;
    });
    console.log(`| TOTAL | | $${total} (${((total/budget)*100).toFixed(1)}% of budget) |`);
}

// Test cases
testBuild(800, 'gaming');
testBuild(1500, 'gaming');
testBuild(3000, 'gaming');
testBuild(2000, 'streaming');
testBuild(2500, 'workstation');
testBuild(5000, 'gaming'); // Test premium parts
