
import { maintenanceAutopilot } from './apps/mobile/src/lib/maintenanceAutopilot';

async function runSimulation() {
    console.log("=== ProvLy Care Autopilot Simulation ===\n");

    const testItems = [
        { name: 'Samsung Refrigerator', category: 'Appliances' },
        { name: 'Living Room AC', category: 'Other' }, // Should be caught by keyword 'AC' -> HVAC
        { name: 'Smoke Detector', category: 'Safety' },
        { name: 'Generic Table', category: 'Furniture' }
    ];

    testItems.forEach(item => {
        console.log(`Testing Item: "${item.name}" (Category: ${item.category})`);

        // 1. Detect SubCategory (Keyword logic)
        const detectedCategory = maintenanceAutopilot.detectSubCategory(item.name, item.category);
        console.log(`   -> Detected SubCategory: ${detectedCategory}`);

        // 2. Get Blueprints
        const blueprints = maintenanceAutopilot.getSuggestedTasks(detectedCategory);

        if (blueprints.length > 0) {
            console.log(`   -> ✅ Found ${blueprints.length} blueprints:`);
            blueprints.forEach(bp => {
                console.log(`      - [${bp.frequencyDays} days] ${bp.title}`);
            });
        } else {
            console.log(`   -> ❌ No blueprints found for this category.`);
        }
        console.log("");
    });

    console.log("=== Recursive Scheduling Test ===");
    const hvacBlueprint = maintenanceAutopilot.getSuggestedTasks('HVAC')[0];
    const today = new Date();
    const nextDate = new Date();
    nextDate.setDate(today.getDate() + hvacBlueprint.frequencyDays);

    console.log(`Blueprint: ${hvacBlueprint.title}`);
    console.log(`Frequency: ${hvacBlueprint.frequencyDays} days`);
    console.log(`Completion Date: ${today.toDateString()}`);
    console.log(`Next Scheduled Date: ${nextDate.toDateString()}`);
    console.log("\nSimulation Complete.");
}

runSimulation().catch(console.error);
