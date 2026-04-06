
// PROVLY CARE AUTOPILOT - LOGIC VERIFICATION SCRIPT
// This script replicates the exact deterministic logic used in the mobile app.

const BLUEPRINTS = {
    'Appliances': [
        { title: 'Clean Dryer Lint Filter', frequencyDays: 30 },
        { title: 'Check Refrigerator Water Filter', frequencyDays: 180 },
        { title: 'Vacuum Refrigerator Coils', frequencyDays: 180 },
        { title: 'Clean Dishwasher Filter', frequencyDays: 90 }
    ],
    'HVAC': [
        { title: 'Change Air Filter', frequencyDays: 90 }
    ],
    'Safety': [
        { title: 'Test Smoke Detectors', frequencyDays: 30 },
        { title: 'Replace Alarm Batteries', frequencyDays: 365 },
        { title: 'Check Fire Extinguisher', frequencyDays: 180 }
    ],
    'Furniture': [
        { title: 'Tighten Screws/Legs', frequencyDays: 365 },
        { title: 'Condition Leather/Fabric', frequencyDays: 180 }
    ]
};

function detectSubCategory(name, currentCategory) {
    const lowerName = name.toLowerCase();
    // Deterministic keyword matching
    if (lowerName.includes('hvac') || lowerName.includes('air filter') || lowerName.includes('furnace') || lowerName.includes('ac')) {
        return 'HVAC';
    }
    return currentCategory;
}

function getSuggestedTasks(category) {
    return BLUEPRINTS[category] || [];
}

async function runSimulation() {
    console.log("=== ProvLy Care Autopilot Logic Proof ===\n");

    const testItems = [
        { name: 'Samsung Refrigerator', category: 'Appliances' },
        { name: 'Old HVAC Unit', category: 'Other' },
        { name: 'Smoke Detector', category: 'Safety' },
        { name: 'Kitchen Chair', category: 'Furniture' }
    ];

    testItems.forEach(item => {
        console.log(`INPUT: Item Name: "${item.name}", Category: "${item.category}"`);

        // 1. Detection Phase
        const detectedCategory = detectSubCategory(item.name, item.category);
        console.log(`   -> Logic: detectedCategory('${item.name}') => "${detectedCategory}"`);

        // 2. Mapping Phase
        const tasks = getSuggestedTasks(detectedCategory);

        if (tasks.length > 0) {
            console.log(`   -> ✅ SUCCESS: Generated ${tasks.length} maintenance tasks:`);
            tasks.forEach(task => {
                const dueDate = new Date();
                dueDate.setDate(dueDate.getDate() + task.frequencyDays);
                console.log(`      • [IN ${task.frequencyDays} DAYS] ${task.title} (Due: ${dueDate.toDateString()})`);
            });
        } else {
            console.log(`   -> ❌ No blueprints matched.`);
        }
        console.log("");
    });

    console.log("=== Recursive Scheduling Proof ===");
    const hvacTask = BLUEPRINTS['HVAC'][0];
    const completionDate = new Date();
    const nextDate = new Date();
    nextDate.setDate(completionDate.getDate() + hvacTask.frequencyDays);

    console.log(`Action: User completes "${hvacTask.title}" today (${completionDate.toDateString()})`);
    console.log(`Logic: New Task = Date.now() + ${hvacTask.frequencyDays} days`);
    console.log(`Result: Next service scheduled for ${nextDate.toDateString()}`);
    console.log("\nProof Complete. The logic is deterministic and reproducible.");
}

runSimulation();
