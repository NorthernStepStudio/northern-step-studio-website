// apps/mobile/src/lib/rulesHelper.ts
// Lightweight rules-based helper for claim/export guidance
// No AI required - uses keyword matching

export interface ClaimTip {
    category: string;
    tips: string[];
    exportRecommendation: string;
}

// Keyword patterns for category detection
const CATEGORY_KEYWORDS: Record<string, string[]> = {
    electronics: ['tv', 'television', 'laptop', 'computer', 'phone', 'tablet', 'ipad', 'macbook', 'monitor', 'camera', 'gaming', 'console', 'playstation', 'xbox', 'nintendo', 'speaker', 'headphone', 'airpod'],
    appliances: ['refrigerator', 'fridge', 'washer', 'dryer', 'dishwasher', 'oven', 'stove', 'microwave', 'toaster', 'blender', 'vacuum', 'air conditioner', 'heater', 'fan'],
    furniture: ['sofa', 'couch', 'chair', 'table', 'desk', 'bed', 'mattress', 'dresser', 'cabinet', 'shelf', 'bookcase', 'ottoman', 'nightstand'],
    jewelry: ['ring', 'necklace', 'bracelet', 'watch', 'earring', 'diamond', 'gold', 'silver', 'jewelry', 'rolex', 'cartier'],
    clothing: ['jacket', 'coat', 'dress', 'suit', 'shoes', 'boots', 'handbag', 'purse', 'designer', 'gucci', 'louis vuitton', 'prada'],
    tools: ['drill', 'saw', 'hammer', 'wrench', 'toolbox', 'power tool', 'lawn mower', 'chainsaw'],
    sports: ['bike', 'bicycle', 'golf', 'tennis', 'ski', 'snowboard', 'treadmill', 'weights', 'exercise'],
    musical: ['guitar', 'piano', 'keyboard', 'violin', 'drum', 'instrument', 'amp', 'amplifier'],
    art: ['painting', 'sculpture', 'artwork', 'print', 'photograph', 'antique', 'collectible'],
};

// Category-specific tips
const CATEGORY_TIPS: Record<string, ClaimTip> = {
    electronics: {
        category: 'Electronics',
        tips: [
            '📋 Record serial numbers and model numbers',
            '🧾 Keep original receipt or order confirmation',
            '📸 Take photos of the device from multiple angles',
            '📦 Photograph original packaging if available',
        ],
        exportRecommendation: 'Include serial numbers in your PDF export for insurance claims.',
    },
    appliances: {
        category: 'Appliances',
        tips: [
            '🏷️ Note the brand, model, and capacity',
            '📅 Record purchase date and warranty expiration',
            '🧾 Keep installation receipts if applicable',
            '📸 Photograph the appliance and model sticker',
        ],
        exportRecommendation: 'Group appliances by room for easier insurance documentation.',
    },
    furniture: {
        category: 'Furniture',
        tips: [
            '📐 Include dimensions in the description',
            '🪵 Note the material (wood, leather, fabric, etc.)',
            '📸 Take photos from multiple angles',
            '✨ Document the current condition',
        ],
        exportRecommendation: 'Note any custom or antique pieces separately for higher valuations.',
    },
    jewelry: {
        category: 'Jewelry',
        tips: [
            '💎 Get professional appraisals for valuable pieces',
            '📸 Take close-up photos with a ruler for scale',
            '📋 Document carat, cut, clarity, and color for diamonds',
            '🔐 Store appraisal certificates separately',
        ],
        exportRecommendation: 'Consider a separate jewelry rider on your insurance policy.',
    },
    clothing: {
        category: 'Clothing & Accessories',
        tips: [
            '🏷️ Note designer/brand names',
            '📸 Photograph labels and authenticity tags',
            '💰 Record purchase price or current retail value',
            '✨ Document condition (new, like-new, worn)',
        ],
        exportRecommendation: 'Group designer items together for easier valuation.',
    },
    tools: {
        category: 'Tools & Equipment',
        tips: [
            '🔧 Record brand and model',
            '⚡ Note if corded or cordless (include battery info)',
            '🧾 Keep purchase receipts',
            '📸 Photograph any accessories included',
        ],
        exportRecommendation: 'List power tools separately as they often have higher values.',
    },
    sports: {
        category: 'Sports & Fitness',
        tips: [
            '🚴 Record brand, model, and size',
            '📋 Note any upgrades or modifications',
            '📸 Photograph from multiple angles',
            '🔢 Include serial numbers for bikes',
        ],
        exportRecommendation: 'Specialty equipment may need separate coverage.',
    },
    musical: {
        category: 'Musical Instruments',
        tips: [
            '🎸 Record brand, model, and serial number',
            '📅 Note the year of manufacture if known',
            '📸 Photograph any unique features or wear',
            '🎵 Keep any certificates of authenticity',
        ],
        exportRecommendation: 'Vintage instruments may need professional appraisal.',
    },
    art: {
        category: 'Art & Collectibles',
        tips: [
            '🎨 Document artist name and title',
            '📐 Record dimensions and medium',
            '📋 Keep certificates of authenticity',
            '📸 Photograph front, back, and any signatures',
        ],
        exportRecommendation: 'Get professional appraisals for items over $1,000.',
    },
};

// Default tips for uncategorized items
const DEFAULT_TIPS: ClaimTip = {
    category: 'General',
    tips: [
        '📸 Take clear photos from multiple angles',
        '💰 Record the purchase price or estimated value',
        '🧾 Keep receipts or proof of purchase',
        '📋 Note brand, model, and condition',
    ],
    exportRecommendation: 'Export your full inventory as PDF for insurance documentation.',
};

/**
 * Detect category from item name/description using keyword matching
 */
export function detectCategory(text: string): string | null {
    const lowerText = text.toLowerCase();

    for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
        for (const keyword of keywords) {
            if (lowerText.includes(keyword)) {
                return category;
            }
        }
    }

    return null;
}

/**
 * Get claim tips based on item name and optional category
 */
export function getClaimTips(itemName: string, itemCategory?: string): ClaimTip {
    // First check explicit category
    if (itemCategory) {
        const lowerCategory = itemCategory.toLowerCase();
        if (CATEGORY_TIPS[lowerCategory]) {
            return CATEGORY_TIPS[lowerCategory];
        }
    }

    // Then try to detect from item name
    const detectedCategory = detectCategory(itemName);
    if (detectedCategory && CATEGORY_TIPS[detectedCategory]) {
        return CATEGORY_TIPS[detectedCategory];
    }

    return DEFAULT_TIPS;
}

/**
 * Get a quick tip message for the scan result screen
 */
export function getQuickTip(itemName: string): string {
    const tips = getClaimTips(itemName);
    const randomTip = tips.tips[Math.floor(Math.random() * tips.tips.length)];
    return randomTip;
}

/**
 * Get export recommendation based on inventory items
 */
export function getExportRecommendation(itemNames: string[]): string[] {
    const recommendations: string[] = [];
    const seenCategories = new Set<string>();

    for (const name of itemNames) {
        const category = detectCategory(name);
        if (category && !seenCategories.has(category)) {
            seenCategories.add(category);
            const tips = CATEGORY_TIPS[category];
            if (tips) {
                recommendations.push(`${tips.category}: ${tips.exportRecommendation}`);
            }
        }
    }

    if (recommendations.length === 0) {
        recommendations.push(DEFAULT_TIPS.exportRecommendation);
    }

    return recommendations;
}
