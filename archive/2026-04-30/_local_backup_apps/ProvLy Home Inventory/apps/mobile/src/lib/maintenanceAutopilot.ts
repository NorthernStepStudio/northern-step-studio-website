import { MaintenanceTask } from '../db/repositories/maintenanceTasksRepo';

export interface TaskBlueprint {
    title: string;
    description: string;
    frequencyDays: number;
}

export const CATEGORY_TASKS: Record<string, TaskBlueprint[]> = {
    'Appliances': [
        {
            title: 'Clean Dryer Lint Filter',
            description: 'Clean the lint filter in your dryer to prevent fires and improve airflow.',
            frequencyDays: 30
        },
        {
            title: 'Check Refrigerator Water Filter',
            description: 'Check if your refrigerator water filter needs replacement (usually every 6 months).',
            frequencyDays: 180
        },
        {
            title: 'Vacuum Refrigerator Coils',
            description: 'Vacuuming the coils helps the fridge run more efficiently and extends its life.',
            frequencyDays: 180
        },
        {
            title: 'Clean Dishwasher Filter',
            description: 'Remove and rinse the dishwasher filter to ensure clean dishes and prevent odors.',
            frequencyDays: 90
        }
    ],
    'Electronics': [
        {
            title: 'Check for Firmware Updates',
            description: 'Ensure your device has the latest security and performance updates.',
            frequencyDays: 90
        },
        {
            title: 'Clean Dust from Vents',
            description: 'Use compressed air to clean dust from vents to prevent overheating and fan noise.',
            frequencyDays: 180
        },
    ],
    'Furniture': [
        {
            title: 'Tighten Screws/Legs',
            description: 'Check and tighten any loose screws or furniture legs to ensure stability.',
            frequencyDays: 365
        },
        {
            title: 'Condition Leather/Fabric',
            description: 'Apply protector or conditioner to keep material from cracking or fading.',
            frequencyDays: 180
        }
    ],
    'HVAC': [ // Often under 'Appliances' or 'Other'
        {
            title: 'Change Air Filter',
            description: 'Replace your HVAC air filter to maintain air quality and system efficiency.',
            frequencyDays: 90
        }
    ],
    'Tools': [
        {
            title: 'Sharpen Blades/Bits',
            description: 'Check tool edges and sharpen if necessary for safety and precision.',
            frequencyDays: 180
        },
        {
            title: 'Battery Health Check',
            description: 'Check and charge cordless tool batteries to prevent deep discharge.',
            frequencyDays: 90
        }
    ],
    'Plumbing': [
        {
            title: 'Check for Pipe Leaks',
            description: 'Inspect under sinks and around toilets for any signs of moisture or leaks.',
            frequencyDays: 180
        },
        {
            title: 'Flush Water Heater',
            description: 'Flush your water heater to remove sediment and improve efficiency.',
            frequencyDays: 365
        },
        {
            title: 'Clean Faucet Aerators',
            description: 'Unscrew aerators and rinse out mineral buildup to maintain water pressure.',
            frequencyDays: 180
        }
    ],
    'Safety': [
        {
            title: 'Test Smoke Detectors',
            description: 'Press the test button on all smoke detectors to ensure they are working.',
            frequencyDays: 30
        },
        {
            title: 'Replace Alarm Batteries',
            description: 'Change the batteries in all smoke and carbon monoxide detectors.',
            frequencyDays: 365
        },
        {
            title: 'Check Fire Extinguisher',
            description: 'Check the pressure gauge and ensure the extinguisher is accessible.',
            frequencyDays: 180
        }
    ],
    'Outdoor': [
        {
            title: 'Clean Gutters',
            description: 'Remove leaves and debris from gutters to prevent water damage.',
            frequencyDays: 180
        },
        {
            title: 'Inspect Roof for Damage',
            description: 'Look for missing or damaged shingles, especially after major storms.',
            frequencyDays: 365
        },
        {
            title: 'Service Lawn Mower',
            description: 'Change oil and sharpen blades for optimal performance.',
            frequencyDays: 365
        }
    ]
};

export const maintenanceAutopilot = {
    getSuggestedTasks(category: string): TaskBlueprint[] {
        // Simple mapping for now
        return CATEGORY_TASKS[category] || [];
    },

    /**
     * Helper to detect if an item name implies a specific sub-category
     * even if the broad category is generic.
     */
    detectSubCategory(name: string, currentCategory: string): string {
        const lowerName = name.toLowerCase();

        // HVAC
        if (lowerName.includes('hvac') || lowerName.includes('air filter') || lowerName.includes('furnace') || lowerName.includes('ac unit') || lowerName.includes('air conditioner')) {
            return 'HVAC';
        }

        // Safety
        if (lowerName.includes('smoke') || lowerName.includes('fire') || lowerName.includes('alarm') || lowerName.includes('detector') || lowerName.includes('extinguisher')) {
            return 'Safety';
        }

        // Plumbing
        if (lowerName.includes('water heater') || lowerName.includes('sink') || lowerName.includes('toilet') || lowerName.includes('faucet') || lowerName.includes('plumbing') || lowerName.includes('pipe')) {
            return 'Plumbing';
        }

        // Outdoor
        if (lowerName.includes('gutter') || lowerName.includes('roof') || lowerName.includes('mower') || lowerName.includes('lawn') || lowerName.includes('garden')) {
            return 'Outdoor';
        }

        return currentCategory;
    }
};
