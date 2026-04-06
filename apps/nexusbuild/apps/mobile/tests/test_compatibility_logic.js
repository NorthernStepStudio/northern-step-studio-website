
// Mock the compatibility service since we can't easily import ES modules in simple node script without setup
// I'll copy the logic here to verify independent of the file system mess, or I can try to use the file.
// Let's try to read the file and eval it or just copy the logic for a quick "logic check".
// Actually, I'll just write a script that imports it if I can.
// Mobile project usually uses ES modules. `type: module` in package.json?
// Let's checking package.json.
// If not, I'll just copy the logic to test it. It's safer.

const getSpec = (part, key) => {
    if (!part || !part.specs) return null;
    let specs = part.specs;
    if (typeof specs === 'string') {
        try {
            specs = JSON.parse(specs);
        } catch (e) {
            return null;
        }
    }
    return specs[key];
};

const checkCompatibility = (part, currentBuild) => {
    if (!part || !currentBuild || !currentBuild.parts) return true;

    // 1. CPU <-> Motherboard (Socket)
    if (part.category === 'cpu' && currentBuild.parts.motherboard) {
        const cpuSocket = getSpec(part, 'socket');
        const moboSocket = getSpec(currentBuild.parts.motherboard, 'socket');
        if (cpuSocket && moboSocket && cpuSocket !== moboSocket) return false;
    }
    if (part.category === 'motherboard' && currentBuild.parts.cpu) {
        const moboSocket = getSpec(part, 'socket');
        const cpuSocket = getSpec(currentBuild.parts.cpu, 'socket');
        if (moboSocket && cpuSocket && moboSocket !== cpuSocket) return false;
    }

    // 2. RAM <-> Motherboard (DDR)
    const getRamType = (s) => {
        if (!s) return null;
        if (s.includes('DDR5')) return 'DDR5';
        if (s.includes('DDR4')) return 'DDR4';
        return null;
    };
    if (part.category === 'ram' && currentBuild.parts.motherboard) {
        const ramSpeed = getSpec(part, 'speed');
        const moboMem = getSpec(currentBuild.parts.motherboard, 'memory');
        const ramType = getRamType(ramSpeed);
        const moboType = getRamType(moboMem);
        if (ramType && moboType && ramType !== moboType) return false;
    }
    return true;
};

// Test Cases
const am5Cpu = { category: 'cpu', specs: { socket: 'AM5' } };
const intelCpu = { category: 'cpu', specs: { socket: 'LGA1700' } };
const am5Mobo = { category: 'motherboard', specs: { socket: 'AM5', memory: 'DDR5' } };
const intelMobo = { category: 'motherboard', specs: { socket: 'LGA1700', memory: 'DDR4' } };
const ddr5Ram = { category: 'ram', specs: { speed: 'DDR5-6000' } };
const ddr4Ram = { category: 'ram', specs: { speed: 'DDR4-3200' } };

// 1. AM5 CPU + AM5 Mobo
const build1 = { parts: { motherboard: am5Mobo } };
if (checkCompatibility(am5Cpu, build1) !== true) console.error("FAIL: AM5 CPU should match AM5 Mobo");
else console.log("PASS: AM5 CPU + AM5 Mobo");

// 2. Intel CPU + AM5 Mobo
if (checkCompatibility(intelCpu, build1) !== false) console.error("FAIL: Intel CPU should NOT match AM5 Mobo");
else console.log("PASS: Intel CPU + AM5 Mobo (Incompatible)");

// 3. DDR5 RAM + DDR5 Mobo
if (checkCompatibility(ddr5Ram, build1) !== true) console.error("FAIL: DDR5 RAM should match AM5(DDR5) Mobo");
else console.log("PASS: DDR5 RAM + DDR5 Mobo");

// 4. DDR4 RAM + DDR5 Mobo
if (checkCompatibility(ddr4Ram, build1) !== false) console.error("FAIL: DDR4 RAM should NOT match AM5(DDR5) Mobo");
else console.log("PASS: DDR4 RAM + AM5(DDR5) Mobo (Incompatible)");

console.log("Tests Completed");
