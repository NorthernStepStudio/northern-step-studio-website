/**
 * Nexus AI Test Suite
 * Run with: node nexusTest.js
 */

// NexusJunior class with all integrated features
class NexusJunior {
    constructor() {
        this.personality = 'friendly';
        this.buildData = null;
    }

    // Get build data (simulated)
    getBuildData() {
        return this.buildData;
    }

    // Set build data for testing
    setBuildData(data) {
        this.buildData = data;
    }

    // Main response handler
    respond(userInput) {
        const lower = userInput.toLowerCase();

        if (this.personality === 'friendly') {
            return this.friendlyResponse(lower, userInput);
        }
        return this.defaultResponse();
    }

    friendlyResponse(lower, original) {
        // === PERSONALITY RESPONSES ===

        // Greeting responses
        if (lower.includes('hello') || lower.includes('hi ') || lower.includes('hey')) {
            return "Hi! I'm Nexus, your PC building assistant. How can I help?";
        }

        // Thank you responses
        if (lower.includes('thank') || lower.includes('thanks') || lower.includes('thx')) {
            return "You're welcome! If you have more questions about your build, feel free to ask. 😊";
        }

        // Who are you
        if (lower.includes('who are you') || lower.includes('what can you do')) {
            return "I'm Nexus, your PC building assistant! I can help you build a PC, compare components, check compatibility, and troubleshoot issues.";
        }

        // Confused/help responses
        if (lower.includes('confused') || lower.includes('help me') || lower.includes("don't understand")) {
            return "Don't worry, I'm here to help clarify things! What specifically would you like help with?";
        }

        // === DIALOGUE PATTERNS ===

        // Components needed
        if ((lower.includes('component') || lower.includes('part')) && lower.includes('need')) {
            return "CPU, motherboard, GPU, RAM, storage, power supply, and a case. What's your budget?";
        }

        // CPU for video editing
        if ((lower.includes('amd') || lower.includes('intel')) && (lower.includes('video edit') || lower.includes('editing') || lower.includes('render'))) {
            return "AMD Ryzen for multi-core performance or Intel Core i9 for high clock speeds. Which software do you use?";
        }

        // CPU questions
        if (lower.includes('cpu') || lower.includes('processor')) {
            if (lower.includes('gaming') || lower.includes('game')) {
                return "For gaming, the AMD Ryzen 7 7800X3D is the best choice. Its 3D V-Cache gives 10-20% better gaming FPS!";
            }
            if (lower.includes('video edit') || lower.includes('editing')) {
                return "AMD Ryzen for multi-core performance or Intel Core i9 for high clock speeds. Which software do you use?";
            }
            if (lower.includes('better') && this.buildData?.cpu) {
                return `A better CPU option is AMD Ryzen 7 7800X3D. It has 3D V-Cache for better gaming. Would you like me to add it to your build?`;
            }
            return "CPUs are like the brain of your PC. AMD and Intel are popular brands. What would you like to know?";
        }

        // GPU questions
        if (lower.includes('gpu') || lower.includes('graphics')) {
            if (lower.includes('better') || lower.includes('upgrade')) {
                return "A better GPU option depends on your budget. RTX 4070 Super (~$599) is excellent for 1440p gaming! Would you like me to add it to your build?";
            }
            if (lower.includes('4k')) {
                return "For 4K gaming, RTX 4080 Super (~$999) or RX 7900 XTX (~$899) are top choices.";
            }
            if (lower.includes('1440') || lower.includes('2k')) {
                return "For 1440p gaming, RTX 4070 Super (~$599) or RX 7800 XT (~$499) are excellent.";
            }
            return "GPUs handle all the graphics processing. NVIDIA RTX and AMD RX are the main options. What's your budget?";
        }

        // RAM questions
        if (lower.includes('ram') || lower.includes('memory')) {
            if (lower.includes('how much') || lower.includes('max')) {
                return "Check your motherboard manual or specs sheet for max RAM capacity. Typically 64-128GB DDR4 or DDR5 for modern boards.";
            }
            return "16GB is good for gaming, 32GB is ideal for gaming + streaming/editing. DDR5 is faster but DDR4 works great too.";
        }

        // Storage questions
        if (lower.includes('hdd') || lower.includes('ssd') || lower.includes('storage')) {
            if (lower.includes('vs') || lower.includes('or')) {
                return "SSD for faster loading times and responsiveness. HDD for larger storage at lower cost. Consider both for balance!";
            }
            return "NVMe SSDs are fastest (1-2TB recommended). Add an HDD for extra storage if needed.";
        }

        // PSU questions
        if (lower.includes('psu') || lower.includes('power supply') || lower.includes('watt')) {
            return "Calculate: CPU + GPU + 100W headroom. Budget: 450-550W, Mid: 550-650W, High-end: 650-850W, RTX 4090: 850W+.";
        }

        // Case questions
        if (lower.includes('case') && (lower.includes('choose') || lower.includes('pick') || lower.includes('recommend'))) {
            return "Consider size (ATX/mATX/ITX), airflow (mesh front), cooling support, and cable management. Popular: Lancool II Mesh, Fractal North.";
        }

        // Compatibility
        if (lower.includes('compatible') || lower.includes('compatibility') || lower.includes('fit')) {
            return "Check socket type for CPU+motherboard (AM5, LGA 1700), DDR4/DDR5 for RAM, and case size for GPU length!";
        }

        // Boot issues
        if (lower.includes("won't boot") || lower.includes('no post') || lower.includes('black screen') || lower.includes("doesn't start")) {
            return "Troubleshooting: 1) Check power connections (24-pin, CPU 8-pin) 2) Reseat RAM 3) Verify CPU installation 4) Check front panel connectors. Do you see lights?";
        }

        // BIOS
        if (lower.includes('bios') && (lower.includes('update') || lower.includes('need'))) {
            return "Update BIOS for: new CPU compatibility, stability fixes, security patches. Download from motherboard manufacturer. ⚠️ Don't update during power outages!";
        }

        // Budget builds - check for dollar amounts
        const budgetMatch = original.match(/\$(\d{3,4})/);
        if (budgetMatch) {
            const budget = parseInt(budgetMatch[1]);
            if (budget < 800) {
                return `For $${budget}: Ryzen 5 5600, RX 6650 XT, 16GB DDR4 RAM, 512GB SSD. Great 1080p gaming!`;
            } else if (budget < 1200) {
                return `For $${budget}: Ryzen 5 7600, RTX 4060 Ti, 32GB DDR5 RAM, 1TB NVMe. Solid 1080p/1440p!`;
            } else if (budget < 1800) {
                return `For $${budget}: Ryzen 7 7800X3D, RTX 4070 Super, 32GB DDR5 RAM, 2TB NVMe. Excellent 1440p!`;
            } else {
                return `For $${budget}: Ryzen 7 7800X3D, RTX 4080 Super, 32GB DDR5 RAM, 2TB NVMe. Amazing 4K gaming!`;
            }
        }

        // Comparison questions
        if (lower.includes(' vs ') || lower.includes(' or ')) {
            if ((lower.includes('amd') || lower.includes('ryzen')) && lower.includes('intel')) {
                return "AMD Ryzen is better for pure gaming (7800X3D), Intel has more cores for productivity. Gaming = AMD, Work = Intel.";
            }
            if ((lower.includes('nvidia') || lower.includes('rtx')) && (lower.includes('amd') || lower.includes('rx'))) {
                return "NVIDIA for ray tracing and DLSS 3, AMD for raw performance per dollar. Streaming = NVIDIA (NVENC).";
            }
        }

        // Why questions
        if (lower.includes('why') && (lower.includes('better') || lower.includes('over') || lower.includes('choose'))) {
            return "I can explain! Tell me which two components you're comparing and I'll give you the breakdown.";
        }

        // Default/fallback
        return this.handleUnknown(lower);
    }

    handleUnknown(lower) {
        // Try to find related topic
        const topics = [
            { keywords: ['game', 'play', 'fps', 'steam'], topic: 'gaming PC builds' },
            { keywords: ['edit', 'video', 'render', 'adobe'], topic: 'workstation builds' },
            { keywords: ['stream', 'twitch', 'obs'], topic: 'streaming setups' },
            { keywords: ['cheap', 'afford', 'money', 'save'], topic: 'budget builds' },
            { keywords: ['hot', 'temp', 'cool', 'fan'], topic: 'cooling solutions' },
        ];

        for (const t of topics) {
            if (t.keywords.some(k => lower.includes(k))) {
                return `It sounds like you're interested in ${t.topic}. Would you like to know more about that?`;
            }
        }

        return "I'm here to help with PC building! Tell me your budget or ask about specific parts.";
    }

    defaultResponse() {
        return "I'm here to help with PC building! Tell me your budget or ask about specific parts.";
    }

    // Suggest better component based on current build
    suggestBetterComponent(componentType) {
        const upgrades = {
            cpu: { name: 'AMD Ryzen 7 7800X3D', price: 449, advantage: '3D V-Cache for 10-20% better gaming' },
            gpu: { name: 'RTX 4070 Super', price: 599, advantage: 'excellent 1440p performance with DLSS 3' },
        };
        return upgrades[componentType] || null;
    }

    // Add component to build
    addComponentToBuild(component) {
        if (!this.buildData) this.buildData = {};
        this.buildData[component.type] = component;
        return `Added ${component.name} to your build!`;
    }

    // Remove component from build
    removeComponentFromBuild(componentType) {
        if (this.buildData && this.buildData[componentType]) {
            delete this.buildData[componentType];
            return `Removed ${componentType} from your build.`;
        }
        return `No ${componentType} in your build.`;
    }
}

// === RUN TESTS ===
console.log('\n========== NEXUS AI TEST SUITE ==========\n');

const nj = new NexusJunior();

const tests = [
    // Greetings
    { input: 'Hello NJ, how are you?', expected: 'Nexus' },
    { input: 'Hey there!', expected: 'Nexus' },

    // Thank you
    { input: 'Thanks for the help!', expected: 'welcome' },

    // Confused
    { input: "I'm confused about all this", expected: 'help' },

    // Who are you
    { input: 'What can you do?', expected: 'Nexus' },

    // CPU
    { input: 'What CPU is best for gaming?', expected: '7800X3D' },
    { input: 'AMD or Intel for video editing?', expected: 'multi-core' },

    // GPU
    { input: 'What GPU should I get?', expected: 'budget' },
    { input: 'Better GPU upgrade options?', expected: '4070' },
    { input: 'Best GPU for 4K?', expected: '4080' },

    // RAM
    { input: 'How much RAM does my motherboard support?', expected: 'max' },

    // Storage
    { input: 'Should I get HDD or SSD?', expected: 'SSD' },

    // PSU
    { input: 'What wattage power supply do I need?', expected: 'watt' },

    // Case
    { input: 'How do I choose a PC case?', expected: 'airflow' },

    // Budget builds
    { input: 'Build me a PC for $800', expected: 'Ryzen' },
    { input: 'Gaming PC $1500', expected: '7800X3D' },

    // Components
    { input: 'What components do I need?', expected: 'motherboard' },

    // Boot issues
    { input: "My PC won't boot", expected: 'power' },

    // BIOS
    { input: 'Do I need to update my BIOS?', expected: 'compatibility' },

    // Compatibility
    { input: 'Is this compatible with my motherboard?', expected: 'socket' },

    // Comparison
    { input: 'AMD vs Intel for gaming?', expected: 'AMD' },
    { input: 'NVIDIA vs AMD GPU?', expected: 'ray tracing' },

    // Related topic detection
    { input: 'I want to play games', expected: 'gaming' },
    { input: 'My PC is too hot', expected: 'cooling' },
];

let passed = 0;
let failed = 0;

tests.forEach((test, i) => {
    const response = nj.respond(test.input);
    const success = response && response.toLowerCase().includes(test.expected.toLowerCase());

    if (success) {
        console.log(`✅ Test ${i + 1}: PASSED`);
        console.log(`   Input: "${test.input}"`);
        console.log(`   Response: "${response.substring(0, 100)}${response.length > 100 ? '...' : ''}"\n`);
        passed++;
    } else {
        console.log(`❌ Test ${i + 1}: FAILED`);
        console.log(`   Input: "${test.input}"`);
        console.log(`   Expected to contain: "${test.expected}"`);
        console.log(`   Got: "${response}"\n`);
        failed++;
    }
});

console.log('==========================================');
console.log(`Results: ${passed}/${tests.length} passed, ${failed} failed`);
console.log(`Pass rate: ${Math.round(passed / tests.length * 100)}%`);
console.log('==========================================\n');

// Test build interaction
console.log('\n===== BUILD INTERACTION TESTS =====\n');

// Test adding component
const addResult = nj.addComponentToBuild({ type: 'gpu', name: 'RTX 4070 Super', price: 599 });
console.log(`Add GPU: ${addResult}`);
console.log(`Build data: ${JSON.stringify(nj.getBuildData())}`);

// Test suggesting upgrade
const upgrade = nj.suggestBetterComponent('cpu');
console.log(`\nSuggested CPU upgrade: ${upgrade.name} - ${upgrade.advantage}`);

// Test removing component
const removeResult = nj.removeComponentFromBuild('gpu');
console.log(`\nRemove GPU: ${removeResult}`);
console.log(`Build data: ${JSON.stringify(nj.getBuildData())}`);

console.log('\n===================================\n');
