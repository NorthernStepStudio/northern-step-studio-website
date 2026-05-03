import { getBudgetBuild } from './apps/backend-worker/src/data/parts';

const simulations = [
    { budget: 2000, useCase: 'gaming' },
    { budget: 2000, useCase: 'workstation' },
    { budget: 5000, useCase: 'gaming' }
];

simulations.forEach(sim => {
    const build = getBudgetBuild(sim.budget, sim.useCase);
    const total = build.reduce((sum, p) => sum + p.price, 0);
    const percent = (total / sim.budget) * 100;
    
    console.log(`Simulation: $${sim.budget} ${sim.useCase}`);
    console.log(`Total: $${total} (${percent.toFixed(1)}%)`);
    console.log(`Parts: ${build.map(p => `${p.name} ($${p.price})`).join(', ')}`);
    console.log('---');
});
