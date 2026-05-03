
import { ALL_PARTS, PARTS_COUNT, getBudgetBuild } from '../apps/backend/src/data/index';

console.log('--- Database Stats ---');
console.log('Total Parts:', PARTS_COUNT.Total);
console.log('CPUs:', PARTS_COUNT.CPUs);
console.log('GPUs:', PARTS_COUNT.GPUs);
console.log('Motherboards:', PARTS_COUNT.Motherboards);
console.log('RAM:', PARTS_COUNT.RAM);
console.log('Storage:', PARTS_COUNT.Storage);
console.log('PSUs:', PARTS_COUNT.PSUs);
console.log('Cases:', PARTS_COUNT.Cases);
console.log('Cooling:', PARTS_COUNT.Cooling);

console.log('\n--- Build Simulation: $2000 Gaming ---');
const build = getBudgetBuild(2000, 'gaming');
let total = 0;
build.forEach(p => {
    console.log(`${p.category}: ${p.name} - $${p.price}`);
    total += p.price;
});
console.log('Total Build Price:', total);
console.log('Leftover Budget:', 2000 - total);

console.log('\n--- Build Simulation: $2000 Workstation ---');
const buildWork = getBudgetBuild(2000, 'workstation');
let totalWork = 0;
buildWork.forEach(p => {
    console.log(`${p.category}: ${p.name} - $${p.price}`);
    totalWork += p.price;
});
console.log('\n--- Build Simulation: $5000 Gaming ---');
const build5k = getBudgetBuild(5000, 'gaming');
let total5k = 0;
build5k.forEach(p => {
    console.log(`${p.category}: ${p.name} - $${p.price}`);
    total5k += p.price;
});
console.log('Total Build Price:', total5k);
console.log('Leftover Budget:', 5000 - total5k);
