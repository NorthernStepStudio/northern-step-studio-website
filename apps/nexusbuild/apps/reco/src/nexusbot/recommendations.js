const DEFAULT_BUDGET = 1500;
const MIN_BUDGET = 600;
const MAX_BUDGET = 5000;

const TIERS = [
    {
        max: 999,
        components: {
            cpu: '6-core CPU (Ryzen 5 / Core i5)',
            gpu: 'RTX 4060 / RX 7600',
            motherboard: 'B550/B660-class motherboard',
            ram: '16GB DDR4-3200',
            storage: '1TB NVMe SSD',
            psu: '650W 80+ Bronze PSU',
            case: 'Airflow ATX mid-tower',
            capture: '1080p capture card'
        }
    },
    {
        max: 1499,
        components: {
            cpu: '8-core CPU (Ryzen 7 / Core i7)',
            gpu: 'RTX 4070 / RX 7800 XT',
            motherboard: 'B650/Z690-class motherboard',
            ram: '32GB DDR5-5600',
            storage: '2TB NVMe SSD',
            psu: '750W 80+ Gold PSU',
            case: 'Premium airflow ATX mid-tower',
            capture: '4K-ready capture card'
        }
    },
    {
        max: Number.POSITIVE_INFINITY,
        components: {
            cpu: '12-core CPU (Ryzen 9 / Core i9)',
            gpu: 'RTX 4080 Super / RX 7900 XTX',
            motherboard: 'X670/Z790-class motherboard',
            ram: '64GB DDR5-6000',
            storage: '2TB NVMe + 4TB SSD',
            psu: '850W 80+ Gold PSU',
            case: 'High-airflow premium case',
            capture: 'Pro-grade capture card'
        }
    }
];

const VARIANT_WEIGHTS = {
    Gaming: {
        gpu: 0.38,
        cpu: 0.2,
        motherboard: 0.1,
        ram: 0.1,
        storage: 0.1,
        psu: 0.07,
        case: 0.05
    },
    Work: {
        cpu: 0.3,
        gpu: 0.15,
        ram: 0.2,
        storage: 0.15,
        motherboard: 0.1,
        psu: 0.06,
        case: 0.04
    },
    Streaming: {
        gpu: 0.3,
        cpu: 0.22,
        ram: 0.12,
        storage: 0.12,
        motherboard: 0.09,
        psu: 0.07,
        case: 0.05,
        capture: 0.03
    }
};

const COMPONENT_LABELS = {
    cpu: 'CPU',
    gpu: 'GPU',
    motherboard: 'Motherboard',
    ram: 'RAM',
    storage: 'Storage',
    psu: 'PSU',
    case: 'Case',
    capture: 'Capture Card'
};

const roundPrice = (value) => Math.round(value / 5) * 5;

const clampBudget = (budget) => Math.min(Math.max(budget, MIN_BUDGET), MAX_BUDGET);

const getTier = (budget) => TIERS.find((tier) => budget <= tier.max) ?? TIERS[TIERS.length - 1];

const allocateBudget = (budget, weights) => {
    const entries = Object.entries(weights);
    const totalWeight = entries.reduce((total, [, weight]) => total + weight, 0);
    let remaining = budget;

    return entries.reduce((allocations, [component, weight], index) => {
        if (index === entries.length - 1) {
            allocations[component] = remaining;
            return allocations;
        }

        const allocation = roundPrice((budget * weight) / totalWeight);
        allocations[component] = allocation;
        remaining -= allocation;
        return allocations;
    }, {});
};

const buildVariant = (label, budget) => {
    const tier = getTier(budget);
    const allocations = allocateBudget(budget, VARIANT_WEIGHTS[label]);

    const components = Object.entries(allocations).map(([component, price]) => ({
        type: COMPONENT_LABELS[component] || component,
        name: tier.components[component] || 'Recommended component',
        price
    }));

    return {
        label,
        components,
        total_price: components.reduce((total, component) => total + component.price, 0)
    };
};

export const generateBuildVariants = ({ budget = DEFAULT_BUDGET } = {}) => {
    const normalizedBudget = clampBudget(Number(budget) || DEFAULT_BUDGET);

    return [
        buildVariant('Gaming', normalizedBudget),
        buildVariant('Work', normalizedBudget),
        buildVariant('Streaming', normalizedBudget)
    ];
};
