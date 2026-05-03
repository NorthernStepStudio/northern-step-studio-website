// apps/mobile/src/chatbot/rulesEngine.ts
// Enhanced Rules-based assistant engine - Uses local SQLite data
// Uses local SQLite data for personalized responses

/**
 * FactPack: Local inventory statistics from SQLite
 */
export interface FactPack {
    total_items: number;
    total_value: number;
    items_missing_proof: number;
    high_value_items: { id: string, name: string, price: number, has_photo: boolean, has_receipt: boolean }[];
    // Extended fields (optional)
    rooms_count?: number;
    recent_items?: string[];
    homes_count?: number;
    category_distribution?: Record<string, number>;
    aggregate_proof_score?: number;
    items_needing_photos?: { id: string, name: string }[];
    items_missing_receipts?: number;
    items_needing_receipts?: { id: string, name: string }[];
    items_missing_serial?: number;
    items_needing_serial?: { id: string, name: string }[];
}

/**
 * Action button for quick navigation
 */
export interface ActionButton {
    label: string;
    screen: string;
    params?: Record<string, any>;
    icon?: string;
}

/**
 * Bot response with optional action buttons
 */
export interface BotResponse {
    message: string;
    actions?: ActionButton[];
    intent?: string;
}

/**
 * Intent patterns for keyword matching
 */
interface IntentPattern {
    keywords: string[];
    intent: string;
    priority?: number;
}

// ============================================================
// INTENT PATTERNS (Order by priority, first match wins)
// ============================================================
const INTENT_PATTERNS: IntentPattern[] = [
    // Greetings
    { keywords: ['hello', 'hi', 'hey', 'good morning', 'good evening', 'howdy', 'yo', 'sup'], intent: 'greeting' },

    // App Info
    { keywords: ['what is provly', 'about provly', 'what does this app', 'what app', 'what is this'], intent: 'about_app' },
    { keywords: ['privacy', 'data safe', 'secure', 'who can see', 'is my data'], intent: 'privacy_info' },
    { keywords: ['free', 'cost', 'price', 'subscription', 'pro', 'upgrade', 'premium'], intent: 'pricing_info' },

    // Inventory Summary
    { keywords: ['how many', 'count', 'total items', 'number of items', 'how many items'], intent: 'count_items' },
    { keywords: ['value', 'worth', 'total value', 'how much', 'total worth'], intent: 'total_value' },
    { keywords: ['summary', 'overview', 'status', 'dashboard', 'my inventory'], intent: 'summary' },
    { keywords: ['recently added', 'latest', 'new items', 'recent'], intent: 'recent_items' },

    // Proof & Coverage
    { keywords: ['missing photo', 'no photo', 'need photo', 'without photo', 'items without'], intent: 'missing_photos' },
    { keywords: ['missing receipt', 'no receipt', 'need receipt'], intent: 'missing_receipts' },
    { keywords: ['missing serial', 'no serial', 'need serial', 'serial number', 'missing model', 'no model', 'need model', 'model number'], intent: 'missing_serial' },
    { keywords: ['proof', 'documentation', 'evidence', 'coverage', 'claim ready', 'claim readiness'], intent: 'proof_status' },
    { keywords: ['missing', 'incomplete', 'gaps', 'need to add', 'what am i missing'], intent: 'proof_gaps' },

    // Claims & Insurance
    { keywords: ['claim', 'insurance', 'file a claim', 'make a claim', 'insurance claim'], intent: 'claims_help' },
    { keywords: ['disaster', 'fire', 'flood', 'theft', 'stolen', 'damage', 'lost', 'robbed', 'burglary'], intent: 'disaster_help' },
    { keywords: ['adjuster', 'insurance company', 'policy'], intent: 'insurance_tips' },

    // Export & Reports
    { keywords: ['export', 'pdf', 'csv', 'report', 'download', 'share', 'generate report'], intent: 'export_help' },
    { keywords: ['print', 'email', 'send report'], intent: 'export_help' },
    { keywords: ['zip', 'photo pack', 'bundle', 'all photos'], intent: 'zip_export' },

    // Adding Content
    { keywords: ['add item', 'new item', 'scan', 'add something', 'scan item', 'photograph'], intent: 'add_item' },
    { keywords: ['add room', 'new room', 'create room'], intent: 'add_room' },
    { keywords: ['add home', 'new home', 'new property', 'second home', 'another home'], intent: 'add_home' },

    // Organization
    { keywords: ['organize', 'sort', 'arrange', 'categorize', 'move item'], intent: 'organize_help' },
    { keywords: ['room', 'rooms', 'spaces', 'areas', 'my rooms'], intent: 'rooms_info' },
    { keywords: ['home', 'homes', 'properties', 'my homes', 'switch home'], intent: 'homes_info' },
    { keywords: ['category', 'categories', 'types of items'], intent: 'categories_info' },

    // Item Actions
    { keywords: ['edit item', 'change item', 'update item', 'modify'], intent: 'edit_item' },
    { keywords: ['delete item', 'remove item', 'get rid of'], intent: 'delete_item' },
    { keywords: ['find item', 'search', 'where is', 'locate'], intent: 'find_item' },
    { keywords: ['high value', 'expensive', 'most valuable', 'big ticket'], intent: 'high_value_items' },

    // Settings & Account
    { keywords: ['setting', 'settings', 'preferences', 'config', 'options'], intent: 'settings' },
    { keywords: ['backup', 'sync', 'cloud', 'save my data'], intent: 'backup_info' },
    { keywords: ['biometric', 'face id', 'touch id', 'fingerprint', 'lock', 'security'], intent: 'security_info' },
    { keywords: ['language', 'spanish', 'italian', 'english', 'change language'], intent: 'language_info' },
    { keywords: ['profile', 'account', 'my account', 'my profile'], intent: 'profile_info' },
    { keywords: ['sign out', 'log out', 'logout', 'sign off'], intent: 'logout_help' },

    // Troubleshooting
    { keywords: ['not working', 'error', 'problem', 'bug', 'broken', 'issue'], intent: 'troubleshoot' },
    { keywords: ['slow', 'loading', 'taking forever', 'stuck'], intent: 'performance_help' },
    { keywords: ['sync failed', 'not syncing', 'upload failed'], intent: 'sync_help' },

    // Gratitude / Closing
    { keywords: ['thank', 'thanks', 'appreciate', 'awesome', 'great', 'perfect', 'amazing'], intent: 'thanks' },
    { keywords: ['bye', 'goodbye', 'see you', 'later', 'gotta go'], intent: 'goodbye' },

    // Fun / Easter eggs
    { keywords: ['joke', 'funny', 'make me laugh'], intent: 'joke' },
    { keywords: ['who made you', 'who created', 'developer', 'who built'], intent: 'creator' },

    // Generic Help (Moved to bottom to prevent hijacking specific queries)
    { keywords: ['help', 'what can you do', 'how do i', 'guide', 'tutorial', 'assist', 'support'], intent: 'help' },
];

// ============================================================
// INTENT HANDLERS
// ============================================================

function handleGreeting(factPack: FactPack | null): BotResponse {
    const itemCount = factPack?.total_items || 0;
    const value = factPack?.total_value || 0;
    const formatted = value.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

    if (itemCount === 0) {
        return {
            message: `👋 Welcome to ProvLy\n\nI'm your inventory assistant. I can help you:\n• Document your belongings\n• Prepare for insurance claims\n• Export professional reports\n\nLet's start by adding your first item!`,
            actions: [
                { label: '📷 Scan First Item', screen: 'CameraScan', icon: 'camera' },
                { label: '🏠 Set Up Rooms', screen: 'ManageRooms', icon: 'home' },
            ],
            intent: 'greeting',
        };
    }
    return {
        message: `👋 Hey there!\n\nYour inventory at a glance:\n📦 ${itemCount} items tracked\n💰 ${formatted} total value\n\nHow can I help you today?`,
        actions: [
            { label: '📊 Full Summary', screen: 'HomeTab', icon: 'chart' },
            { label: '📷 Add Item', screen: 'CameraScan', icon: 'camera' },
        ],
        intent: 'greeting',
    };
}

function handleHelp(): BotResponse {
    return {
        message: `🤖 I'm your ProvLy Assistant\n\nI can help with:\n\n📦 Inventory\n• "How many items?" / "Total value?"\n• "What's missing photos?" / "Missing serials?"\n• "Show my high-value items"\n\n📋 Insurance Claims\n• "How do I file a claim?"\n• "My house was flooded"\n• "What proof do I need?"\n\n📤 Reports & Export\n• "Export to PDF"\n• "Generate a claim report"\n• "Download my photos"\n\n🏠 Organization\n• "Add a room" / "Add an item"\n• "How do I organize?"\n• "Switch between homes"\n\n⚙️ App & Settings\n• "Enable biometric lock"\n• "Change language"\n• "Upgrade to Pro"`,
        actions: [
            { label: '📦 View Inventory', screen: 'HomeTab', icon: 'box' },
            { label: '📤 Claim Center', screen: 'ClaimCenter', icon: 'file' },
        ],
        intent: 'help',
    };
}

function handleAboutApp(): BotResponse {
    return {
        message: `📱 About ProvLy\n\nProvLy is a privacy-first home inventory app that helps you:\n\n✅ Document belongings with photos & prices\n✅ Track value of everything you own\n✅ Prepare for claims with professional exports\n✅ Stay organized by room and category\n\nPrivacy First:\n• All data stored locally on your device\n• No tracking or ads\n• Optional encrypted cloud sync\n\nPerfect for renters, homeowners, and anyone who wants peace of mind!`,
        actions: [
            { label: '🚀 Get Started', screen: 'CameraScan', icon: 'rocket' },
        ],
        intent: 'about_app',
    };
}

function handlePrivacyInfo(): BotResponse {
    return {
        message: `🔒 Your Privacy Matters\n\nYour Data, Your Device:\n• Everything stored locally by default\n• We can't see your items or photos\n• No data sold or shared. Ever.\n\nOptional Cloud Sync (Pro):\n• End-to-end encrypted\n• Only YOU have the key\n• Sync across devices securely\n\nWhat we DON'T do:\n❌ Track your behavior\n❌ Sell your data\n❌ Access without permission\n❌ Upload without consent\n\nYour inventory = Your business.`,
        actions: [
            { label: '📜 View Full Policy', screen: 'Legal', params: { type: 'privacy' }, icon: 'document' },
        ],
        intent: 'privacy_info',
    };
}

function handlePricingInfo(factPack: FactPack | null): BotResponse {
    const itemCount = factPack?.total_items || 0;
    return {
        message: `💎 Subscription Options\n\nFree Tier (Current)\n✅ Unlimited items, rooms, homes\n✅ Local storage\n✅ Basic exports\n\nPro Tier\n• $6.99/month or $69.99/year (save 17%)\n\n✨ Pro Features:\n• Unlimited PDF/CSV exports\n• Cloud sync & backup\n• ZIP claim packs (all photos)\n• Priority support\n\nYou have ${itemCount} items - consider Pro for easy backup!`,
        actions: [
            { label: '⬆️ View Pro', screen: 'Upgrade', icon: 'star' },
        ],
        intent: 'pricing_info',
    };
}

function handleCountItems(factPack: FactPack | null): BotResponse {
    const count = factPack?.total_items || 0;
    const rooms = factPack?.rooms_count || 0;

    if (count === 0) {
        return {
            message: `📦 You don't have any items yet!\n\nStart by scanning or adding your first item. Even a few documented items can help with insurance claims.`,
            actions: [
                { label: '📷 Add First Item', screen: 'CameraScan', icon: 'camera' },
            ],
            intent: 'count_items',
        };
    }
    return {
        message: `📦 Item Count\n\nYou have ${count} items across ${rooms} room${rooms !== 1 ? 's' : ''}.\n\n💡 Tip: Keep adding items to ensure complete coverage for claims.`,
        actions: [
            { label: '📷 Add More', screen: 'CameraScan', icon: 'camera' },
            { label: '🏠 View by Room', screen: 'RoomsTab', icon: 'home' },
        ],
        intent: 'count_items',
    };
}

function handleTotalValue(factPack: FactPack | null): BotResponse {
    const value = factPack?.total_value || 0;
    const count = factPack?.total_items || 0;
    const formatted = value.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

    if (count === 0) {
        return {
            message: `💰 Your inventory value is currently $0.\n\nAdd items with their purchase prices to track your total home value.`,
            actions: [
                { label: '📷 Add First Item', screen: 'CameraScan', icon: 'camera' },
            ],
            intent: 'total_value',
        };
    }

    const highValue = factPack?.high_value_items || [];
    let message = `💰 Total Inventory Value\n\nYour ${count} items are worth approximately ${formatted}.`;

    if (highValue.length > 0) {
        message += `\n\nYour Top Items:\n${highValue.slice(0, 5).map(i => `• ${i.name} ($${i.price.toLocaleString()})`).join('\n')}`;
    }

    message += `\n\n💡 Tip: High-value items should have prices and photos for best claim coverage.`;

    return {
        message,
        actions: [
            { label: '🏠 View All Items', screen: 'HomeTab', icon: 'list' },
        ],
        intent: 'total_value',
    };
}

function handleSummary(factPack: FactPack | null): BotResponse {
    const count = factPack?.total_items || 0;
    const value = factPack?.total_value || 0;
    const missing = factPack?.items_missing_proof || 0;
    const rooms = factPack?.rooms_count || 0;
    const formatted = value.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

    const coverage = factPack?.aggregate_proof_score ?? (count > 0 ? Math.round(((count - missing) / count) * 100) : 100);
    let statusEmoji = '✅';
    let statusText = 'Excellent! Your inventory is highly documented and ready for claims.';
    if (coverage < 40) {
        statusEmoji = '🚨';
        statusText = 'Critical Gaps! Many items lack photos. In a disaster, undocumented items are rarely fully reimbursed.';
    } else if (coverage < 75) {
        statusEmoji = '⚠️';
        statusText = 'Partial Coverage. Consider adding more photos to secure your high-value assets.';
    }

    let message = `${statusEmoji} Detailed Inventory Report\n\n`;
    message += `📊 Totals\n• Items: ${count}\n• Value: ${formatted}\n• Rooms: ${rooms}\n\n`;

    message += `📸 Claim Readiness: ${coverage}%\n`;
    message += `• ${statusText}\n\n`;

    const catDist = factPack?.category_distribution;
    if (catDist && Object.keys(catDist).length > 0) {
        message += `📂 Category Breakdown\n`;
        const sortedCats = Object.entries(catDist).sort((a, b) => b[1] - a[1]).slice(0, 5);
        sortedCats.forEach(([cat, qty]) => {
            message += `• ${cat}: ${qty} item${qty !== 1 ? 's' : ''}\n`;
        });
        message += `\n`;
    }

    const highValue = factPack?.high_value_items || [];
    if (highValue.length > 0) {
        message += `\n\n💎 High-Value Assets\n`;
        highValue.slice(0, 3).forEach(item => {
            message += `• ${item.name} ($${item.price.toLocaleString()})\n`;
        });
        message += `\n`;
    }

    message += `💡 Insurance Pro-Tip:\nWalk through your home once a month and record a 360° video with your phone's camera. It's the ultimate secondary proof for an adjuster!`;

    const missingItem = factPack?.items_needing_photos?.[0];
    const actions: ActionButton[] = [
        { label: '📤 Export PDF Report', screen: 'ClaimCenter', icon: 'download' }
    ];

    if (missingItem) {
        actions.unshift({ label: `📸 Photo: ${missingItem.name}`, screen: 'ItemDetail', params: { itemId: missingItem.id }, icon: 'camera' });
    } else {
        actions.unshift({ label: '📸 Add Missing Photos', screen: 'CameraScan', icon: 'camera' });
    }

    return {
        message,
        actions,
        intent: 'summary',
    };
}

function handleRecentItems(factPack: FactPack | null): BotResponse {
    const recent = factPack?.recent_items || [];
    if (recent.length === 0) {
        return {
            message: `📝 No recent items to show.\n\nStart adding items to build your inventory!`,
            actions: [
                { label: '📷 Add Item', screen: 'CameraScan', icon: 'camera' },
            ],
            intent: 'recent_items',
        };
    }

    return {
        message: `📝 Recently Added\n\n${recent.slice(0, 5).map((item, i) => `${i + 1}. ${item}`).join('\n')}\n\nKeep the momentum going!`,
        actions: [
            { label: '📷 Add More', screen: 'CameraScan', icon: 'camera' },
            { label: '🏠 View All', screen: 'HomeTab', icon: 'list' },
        ],
        intent: 'recent_items',
    };
}

function handleMissingReceipts(factPack: FactPack | null): BotResponse {
    const total = factPack?.total_items || 0;
    const missing = factPack?.items_missing_receipts || 0;

    if (total === 0) {
        return {
            message: `📦 Your inventory is currently empty.\n\nOnce you add items with their purchase prices, I can help you track documentation gaps here.`,
            actions: [{ label: '📷 Add First Item', screen: 'CameraScan', icon: 'camera' }],
            intent: 'missing_receipts',
        };
    }

    if (missing === 0) {
        const missingPhotos = factPack?.items_missing_proof || 0;
        let photoWarning = "";
        let actionLabel = "📷 Add More Items";
        let actionScreen = "CameraScan";

        if (missingPhotos > 0) {
            photoWarning = `\n\n⚠️ However, you still have ${missingPhotos} items missing photos. While prices are great, insurance adjusters usually require photo proof of the item's condition too!`;
            actionLabel = "📸 Fix Photo Gaps";
            actionScreen = "ClaimCenter";
        }

        return {
            message: `✅ Everything looks great for prices!\n\nAll your ${total} items have purchase prices recorded. This is essential for proving the value of your assets during an insurance claim.${photoWarning}`,
            actions: [
                { label: actionLabel, screen: actionScreen, icon: 'camera' },
            ],
            intent: 'missing_receipts',
        };
    }

    const missingItems = factPack?.items_needing_receipts || [];
    const actions: ActionButton[] = [];

    if (missingItems.length > 0) {
        missingItems.slice(0, 2).forEach(item => {
            actions.push({ label: `💰 Price for ${item.name}`, screen: 'ItemDetail', params: { itemId: item.id }, icon: 'cash' });
        });
    }

    return {
        message: `💰 Purchase Prices & Documentation Needed\n\n${missing} item${missing !== 1 ? 's' : ''} are missing purchase prices or value documentation.\n\nWhy prices matter:\n• Adjusters need a "starting point" for depreciation\n• Proves the item wasn't a standard model\n• Speeds up the reimbursement process\n\nPro tip: If you don't have the original receipt, look up the current replacement cost!`,
        actions,
        intent: 'missing_receipts',
    };
}

function handleMissingSerial(factPack: FactPack | null): BotResponse {
    const total = factPack?.total_items || 0;
    const missing = factPack?.items_missing_serial || 0;

    if (total === 0) {
        return {
            message: `🆔 No items found.\n\nAdd your electronics or appliances first—those are the items where serial numbers matter most for insurance.`,
            actions: [{ label: '📷 Add Item', screen: 'CameraScan', icon: 'camera' }],
            intent: 'missing_serial',
        };
    }

    if (missing === 0) {
        return {
            message: `✅ Identification Complete\n\nAll your ${total} items have serial or model numbers recorded. This is excellent for verifying ownership with insurance!`,
            actions: [
                { label: '📊 Check My Coverage', screen: 'ClaimCenter', icon: 'shield-check' },
            ],
            intent: 'missing_serial',
        };
    }

    const missingItems = factPack?.items_needing_serial || [];
    const actions: ActionButton[] = [];

    if (missingItems.length > 0) {
        missingItems.slice(0, 3).forEach(item => {
            actions.push({
                label: `🆔 ID: ${item.name}`,
                screen: 'ItemDetail',
                params: { itemId: item.id },
                icon: 'barcode-scan'
            });
        });
    }

    return {
        message: `🆔 Missing Serial/Model Numbers\n\nThere are ${missing} item${missing !== 1 ? 's' : ''} lacking serial or model numbers.\n\nWhy this matters:\n• Confirms specific item ownership\n• Prevents "fraud" suspicion from adjusters\n• Helps track replacement parts/warranty\n\nPro tip: You can usually find these on the back or bottom of electronics and appliances.`,
        actions,
        intent: 'missing_serial',
    };
}

function handleMissingPhotos(factPack: FactPack | null): BotResponse {
    const total = factPack?.total_items || 0;
    const missing = factPack?.items_missing_proof || 0;

    if (total === 0) {
        return {
            message: `📸 No photos to check.\n\nYour inventory is currently empty. Start scanning your belongings to build your claim readiness!`,
            actions: [{ label: '📷 Scan Item', screen: 'CameraScan', icon: 'camera' }],
            intent: 'missing_photos',
        };
    }

    if (missing === 0) {
        return {
            message: `✅ Great job!\n\nAll ${total} of your items have photos attached. This gives you the best coverage for insurance claims.`,
            actions: [
                { label: '📷 Add More Items', screen: 'CameraScan', icon: 'camera' },
            ],
            intent: 'missing_photos',
        };
    }

    const missingItems = factPack?.items_needing_photos || [];
    const actions: ActionButton[] = [];

    if (missingItems.length > 0) {
        // Add up to 2 specific items
        missingItems.slice(0, 2).forEach(item => {
            actions.push({ label: `📸 Add to ${item.name}`, screen: 'ItemDetail', params: { itemId: item.id }, icon: 'camera' });
        });
    } else {
        actions.push({ label: '📷 Add Photos Now', screen: 'CameraScan', icon: 'camera' });
    }

    return {
        message: `📸 Photos Needed\n\n${missing} item${missing !== 1 ? 's' : ''} missing photos.\n\nWhy photos matter:\n• Prove you owned the item\n• Show condition before loss\n• Document model/brand/features\n\nPro tip: Start with your most expensive items first!`,
        actions,
        intent: 'missing_photos',
    };
}

function handleProofGaps(factPack: FactPack | null): BotResponse {
    const total = factPack?.total_items || 0;
    const missingPhotos = factPack?.items_missing_proof || 0;
    const missingReceipts = factPack?.items_missing_receipts || 0;
    const missingSerial = factPack?.items_missing_serial || 0;
    const coverage = total > 0 ? (factPack?.aggregate_proof_score || 0) : 0;

    if (total === 0) {
        return {
            message: `🛡️ Claim Readiness: 0%\n\nYour inventory is currently empty. To prepare for claims, you should:\n1. 📷 Add items with photos\n2. 💰 Include purchase prices\n3. 🆔 Note serial numbers\n\nStart your inventory to improve your score!`,
            actions: [{ label: '📷 Add First Item', screen: 'CameraScan', icon: 'camera' }],
            intent: 'proof_gaps',
        };
    }

    let grade = 'A+';
    if (coverage < 50) grade = 'D';
    else if (coverage < 70) grade = 'C';
    else if (coverage < 90) grade = 'B';
    else if (coverage < 100) grade = 'A';

    const actions: ActionButton[] = [
        { label: '📋 Claim Center', screen: 'ClaimCenter', icon: 'file' }
    ];

    const firstMissingPhoto = factPack?.items_needing_photos?.[0];
    const firstMissingReceipt = factPack?.items_needing_receipts?.[0];
    const firstMissingSerial = factPack?.items_needing_serial?.[0];

    if (firstMissingPhoto) {
        actions.unshift({ label: `📸 Photo: ${firstMissingPhoto.name}`, screen: 'ItemDetail', params: { itemId: firstMissingPhoto.id }, icon: 'camera' });
    }
    if (firstMissingReceipt) {
        actions.unshift({ label: `🧾 Price: ${firstMissingReceipt.name}`, screen: 'ItemDetail', params: { itemId: firstMissingReceipt.id }, icon: 'cash' });
    }
    if (firstMissingSerial) {
        actions.unshift({ label: `🆔 ID: ${firstMissingSerial.name}`, screen: 'ItemDetail', params: { itemId: firstMissingSerial.id }, icon: 'barcode-scan' });
    }

    return {
        message: `🔍 Proof Report Card: ${grade}\n\nOverall Readiness: ${coverage}%\n\nGaps Found:\n• ${missingPhotos} items missing photos\n• ${missingReceipts} items missing purchase prices\n• ${missingSerial} items missing serial/model numbers\n\nGoal: 100% = Maximum insurance payout with zero stress.`,
        actions: actions.slice(0, 3), // Keep it concise
        intent: 'proof_gaps',
    };
}

function handleClaimsHelp(): BotResponse {
    return {
        message: `📋 Filing an Insurance Claim\n\nBefore disaster strikes:\n1. ✅ Document all items with photos\n2. ✅ Record purchase prices\n3. ✅ Capture Serial & Model numbers\n4. ✅ Export your inventory regularly\n\nWhen filing a claim:\n1. Contact your insurance company\n2. Get a claim number\n3. Send your ProvLy PDF export\n4. Provide photos of each item\n\nProvLy helps by:\n• Organizing all your proof\n• Generating professional reports\n• Tracking what's documented`,
        actions: [
            { label: '📤 Claim Center', screen: 'ClaimCenter', icon: 'file' },
            { label: '📊 Check My Coverage', screen: 'ClaimCenter', icon: 'list' },
        ],
        intent: 'claims_help',
    };
}

function handleDisasterHelp(): BotResponse {
    return {
        message: `🚨 Dealing with Loss or Damage?\n\nI'm sorry to hear that. Here's what to do:\n\nImmediate Steps:\n1. ✅ Ensure everyone's safety\n2. 📞 Contact insurance ASAP\n3. 📸 Document current damage\n4. 📝 Get a claim number\n\nUse ProvLy to:\n1. Export your full inventory PDF\n2. Share all item photos\n3. Reference purchase values\n\n⚠️ Important: Don't throw anything away until the adjuster has seen it.`,
        actions: [
            { label: '📤 Export for Claim', screen: 'ClaimCenter', icon: 'download' },
        ],
        intent: 'disaster_help',
    };
}

function handleInsuranceTips(): BotResponse {
    return {
        message: `📌 Insurance Claim Tips\n\nDocumentation is Key:\n• Photos > Memory\n• Receipts = Gold\n• Serial numbers help\n\nWhat adjusters look for:\n• Proof of ownership\n• Pre-loss condition\n• Purchase value evidence\n\nCommon mistakes:\n❌ Waiting too long to document\n❌ Not having photos\n❌ Guessing on values\n❌ Throwing away damaged items\n\nProvLy helps you avoid all of these!`,
        actions: [
            { label: '📸 Add More Proof', screen: 'CameraScan', icon: 'camera' },
        ],
        intent: 'insurance_tips',
    };
}

function handleExportHelp(): BotResponse {
    return {
        message: `📤 Export Your Inventory\n\nPDF Report (Best for claims)\n• Includes photos\n• Room-by-room layout\n• Professional format\n\nCSV Spreadsheet\n• All item details\n• Easy to edit\n• Import to other tools\n\nZIP Photo Pack (Pro)\n• All your photos bundled\n• Organized by room\n• Perfect for claims\n\nGo to Claim Center to export!`,
        actions: [
            { label: '📤 Go to Claim Center', screen: 'ClaimCenter', icon: 'download' },
        ],
        intent: 'export_help',
    };
}

function handleZipExport(): BotResponse {
    return {
        message: `📦 ZIP Photo Pack\n\nBundle ALL your inventory photos into one downloadable ZIP file.\n\nIncludes:\n• Every item photo\n• Organized by room\n• Named for easy reference\n\nGreat for:\n• Insurance claims\n• Moving\n• Estate planning\n\n*This is a Pro feature. Upgrade for unlimited exports!*`,
        actions: [
            { label: '📤 Claim Center', screen: 'ClaimCenter', icon: 'package' },
            { label: '⬆️ View Pro', screen: 'Upgrade', icon: 'star' },
        ],
        intent: 'zip_export',
    };
}

function handleAddItem(): BotResponse {
    return {
        message: `📷 Adding Items\n\nMethod 1: Quick Scan (Fastest)\n1. Tap Scan in the nav bar\n2. Point camera at item\n3. Take a photo\n4. Fill in details\n\nMethod 2: Manual Entry\n1. Go to any room\n2. Tap + Add Item\n3. Type details\n4. Add photos later\n\n💡 Pro tip: Photos are the most important proof!`,
        actions: [
            { label: '📷 Quick Scan', screen: 'CameraScan', icon: 'camera' },
            { label: '✏️ Manual Entry', screen: 'AddItem', icon: 'edit' },
        ],
        intent: 'add_item',
    };
}

function handleAddRoom(): BotResponse {
    return {
        message: `🏠 Adding Rooms\n\nSteps:\n1. Go to Vault (bottom nav)\n2. Tap "+ Add Room"\n3. Name it (e.g., "Living Room")\n4. Pick an icon\n5. Start adding items!\n\nCommon rooms:\n• Living Room • Kitchen\n• Bedroom • Bathroom\n• Garage • Office\n• Basement • Attic`,
        actions: [
            { label: '🏠 Manage Rooms', screen: 'ManageRooms', icon: 'home' },
        ],
        intent: 'add_room',
    };
}

function handleAddHome(): BotResponse {
    return {
        message: `🏡 Adding Another Property\n\nPerfect for:\n• Vacation homes\n• Rental properties\n• Moving to a new place\n\nHow to add:\n1. Go to Vault\n2. Look for home switcher at top\n3. Tap "+" to add new home\n4. Name it and add address\n\nEach home gets its own rooms and items!`,
        actions: [
            { label: '🏠 Manage Homes', screen: 'ManageRooms', icon: 'plus' },
        ],
        intent: 'add_home',
    };
}

function handleRoomsInfo(factPack: FactPack | null): BotResponse {
    const rooms = factPack?.rooms_count || 0;
    return {
        message: `🏠 Rooms (${rooms} total)\n\nRooms help you organize items by location.\n\nYou can:\n• Create any room\n• Assign items to rooms\n• View items by room\n• Export room-by-room\n\nTip: The more organized, the easier it is to find things!`,
        actions: [
            { label: '🏠 View Rooms', screen: 'RoomsTab', icon: 'home' },
            { label: '➕ Add Room', screen: 'ManageRooms', icon: 'plus' },
        ],
        intent: 'rooms_info',
    };
}

function handleHomesInfo(factPack: FactPack | null): BotResponse {
    const homes = factPack?.homes_count || 1;
    return {
        message: `🏡 Properties (${homes})\n\nManage multiple homes from one app!\n\nEach home has:\n• Its own rooms\n• Separate inventory\n• Individual stats\n• Property-specific exports\n\nPerfect for homeowners with multiple properties or preparing to move.`,
        actions: [
            { label: '🏠 Manage Homes', screen: 'ManageRooms', icon: 'home' },
        ],
        intent: 'homes_info',
    };
}

function handleCategoriesInfo(factPack: FactPack | null): BotResponse {
    const catDist = factPack?.category_distribution;
    let message = `📁 Item Categories\n\nCategories help organize and filter your inventory for reports.\n\n`;

    if (catDist && Object.keys(catDist).length > 0) {
        message += `Your top categories:\n`;
        const sortedCats = Object.entries(catDist).sort((a, b) => b[1] - a[1]).slice(0, 5);
        sortedCats.forEach(([cat, qty]) => {
            message += `• ${cat}: ${qty} item${qty !== 1 ? 's' : ''}\n`;
        });
    } else {
        message += `Common categories:\n• 📱 Electronics\n• 🛋️ Furniture\n• 👕 Clothing\n• 🔧 Tools\n• 💍 Jewelry\n`;
    }

    return {
        message,
        actions: [
            { label: '📦 View All Items', screen: 'HomeTab', icon: 'list' },
        ],
        intent: 'categories_info',
    };
}

function handleHighValueItems(factPack: FactPack | null): BotResponse {
    const highValue = factPack?.high_value_items || [];
    const value = factPack?.total_value || 0;
    const formatted = value.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

    if (highValue.length === 0) {
        return {
            message: `💎 High-Value Items\n\nNo high-value items tracked yet.\n\nFocus on documenting:\n• Electronics (TVs, computers)\n• Appliances\n• Jewelry\n• Collectibles\n• Furniture\n\nThese items matter most for claims!`,
            actions: [
                { label: '📷 Add Item', screen: 'CameraScan', icon: 'camera' },
            ],
            intent: 'high_value_items',
        };
    }

    const itemsMissingWork = highValue.filter(i => !i.has_photo || !i.has_receipt);
    const actions: ActionButton[] = [];

    if (itemsMissingWork.length > 0) {
        // Offer to fix the most expensive one that is incomplete
        const target = itemsMissingWork[0];
        const icon = !target.has_photo ? 'camera' : 'cash';
        const label = !target.has_photo ? `📸 Photo: ${target.name}` : `🧾 Price: ${target.name}`;
        actions.push({ label, screen: 'ItemDetail', params: { itemId: target.id }, icon });
    }

    actions.push({ label: '📋 Claim Center', screen: 'ClaimCenter', icon: 'file' });

    return {
        message: `💎 Your Most Valuable Items\n\nTotal value: ${formatted}\n\nTop items:\n${highValue.slice(0, 5).map((item, i) => `${i + 1}. ${item.name} ($${item.price.toLocaleString()})`).join('\n')}\n\n💡 Tip: Ensuring your top 5 items have photos and receipts covers ~80% of your claim risk!`,
        actions,
        intent: 'high_value_items',
    };
}

function handleOrganizeHelp(factPack: FactPack | null): BotResponse {
    const itemsWithoutCategory = factPack?.total_items ? factPack.total_items - Object.values(factPack.category_distribution || {}).reduce((a, b) => a + b, 0) : 0;

    let message = `📁 Organization Tips\n\nBy Room:\n• Assign every item to a room\n• Makes finding things easy\n\nBy Value:\n• Document expensive items first\n• High-value items need photos most\n\nBy Category:\n• Group similar items\n• Better for filtering reports`;

    if (itemsWithoutCategory > 0) {
        message += `\n\n💡 You have ${itemsWithoutCategory} items without a category! Adding categories makes your claim report look more professional.`;
    }

    message += `\n\nQuick wins:\n1. Start with the living room\n2. Move room by room\n3. Take 10 mins/day`;

    return {
        message,
        actions: [
            { label: '🏠 Manage Rooms', screen: 'ManageRooms', icon: 'folder' },
            { label: '📋 Proof Gaps', screen: 'ClaimCenter', icon: 'shield' },
        ],
        intent: 'organize_help',
    };
}

function handleEditItem(): BotResponse {
    return {
        message: `✏️ Editing Items\n\nTo edit:\n1. Find the item (Home or Room view)\n2. Tap on it\n3. Make your changes\n4. Save\n\nYou can change:\n• Name & description\n• Price & purchase date\n• Room assignment\n• Category\n• Add/remove photos`,
        actions: [
            { label: '🏠 View Items', screen: 'HomeTab', icon: 'list' },
        ],
        intent: 'edit_item',
    };
}

function handleDeleteItem(): BotResponse {
    return {
        message: `🗑️ Deleting Items\n\nTo delete:\n1. Open the item\n2. Scroll down\n3. Tap "Delete Item"\n4. Confirm\n\nNote: Deleted items can be recovered if you have cloud sync enabled (Pro feature).`,
        actions: [
            { label: '🏠 View Items', screen: 'HomeTab', icon: 'list' },
        ],
        intent: 'delete_item',
    };
}

function handleFindItem(): BotResponse {
    return {
        message: `🔍 Finding Items\n\nOptions:\n1. Browse by room - Tap any room to see items inside\n2. Home dashboard - See recent & high-value items\n3. Scroll through - Items are listed by room\n\n*Search feature coming in a future update!*`,
        actions: [
            { label: '🏠 Browse Rooms', screen: 'RoomsTab', icon: 'search' },
        ],
        intent: 'find_item',
    };
}

function handleSettings(): BotResponse {
    return {
        message: `⚙️ Settings\n\nCustomize ProvLy to your liking:\n\n• Profile - Your name & avatar\n• Security - Biometric lock, privacy\n• Appearance - Theme, language\n• Data - Export, backup\n• Support - Help, legal\n\nTap below to open Settings!`,
        actions: [
            { label: '⚙️ Open Settings', screen: 'SettingsTab', icon: 'settings' },
        ],
        intent: 'settings',
    };
}

function handleBackupInfo(): BotResponse {
    return {
        message: `☁️ Backup & Sync\n\nLocal Storage (Default)\n• Data on your device\n• No internet needed\n• You control everything\n\nCloud Sync (Pro)\n• Encrypted backup\n• Sync across devices\n• Never lose data\n\nManual backup:\nExport PDF/CSV regularly to Google Drive, iCloud, or email yourself!`,
        actions: [
            { label: '⚙️ Check Settings', screen: 'SettingsTab', icon: 'cloud' },
            { label: '📤 Export Now', screen: 'ClaimCenter', icon: 'download' },
        ],
        intent: 'backup_info',
    };
}

function handleSecurityInfo(): BotResponse {
    return {
        message: `🔐 Security Features\n\nBiometric Lock:\n• Use Face ID or Touch ID\n• Lock when app closes\n• Enable in Settings → Security\n\nData Encryption:\n• Local data protected\n• Cloud sync uses E2E encryption\n• Only YOU can access\n\nPrivacy:\n• No trackers\n• No ads\n• No data selling`,
        actions: [
            { label: '⚙️ Security Settings', screen: 'SettingsTab', icon: 'lock' },
        ],
        intent: 'security_info',
    };
}

function handleLanguageInfo(): BotResponse {
    return {
        message: `🌐 Language Settings\n\nSupported languages:\n• 🇺🇸 English\n• 🇪🇸 Español\n• 🇮🇹 Italiano\n\nTo change:\n1. Go to Settings\n2. Find Language option\n3. Pick your language\n4. App updates instantly!`,
        actions: [
            { label: '⚙️ Settings', screen: 'SettingsTab', icon: 'globe' },
        ],
        intent: 'language_info',
    };
}

function handleProfileInfo(): BotResponse {
    return {
        message: `👤 Your Profile\n\nProfile includes:\n• Display name\n• Avatar photo\n• Email (for account)\n\nTo edit:\n1. Go to Profile tab\n2. Tap "Edit Profile"\n3. Update your info\n4. Save!`,
        actions: [
            { label: '👤 View Profile', screen: 'SettingsTab', icon: 'user' },
        ],
        intent: 'profile_info',
    };
}

function handleLogoutHelp(): BotResponse {
    return {
        message: `👋 Signing Out\n\nTo sign out:\n1. Go to Profile tab\n2. Scroll to bottom\n3. Tap "Sign Out"\n\nNote: Your local data stays on the device. You can sign back in anytime!`,
        actions: [
            { label: '⚙️ Settings', screen: 'SettingsTab', icon: 'exit' },
        ],
        intent: 'logout_help',
    };
}

function handleTroubleshoot(): BotResponse {
    return {
        message: `🔧 Troubleshooting\n\nCommon fixes:\n\nApp slow or freezing?\n• Close and reopen\n• Restart your phone\n• Check storage space\n\nData not saving?\n• Make sure you tap Save\n• Check for error messages\n\nSomething else?\nTry these steps:\n1. Force close the app\n2. Reopen\n3. If issues persist, export your data and reinstall\n\n*Your data is stored locally and survives reinstalls!*`,
        actions: [
            { label: '📤 Export Backup', screen: 'ClaimCenter', icon: 'download' },
        ],
        intent: 'troubleshoot',
    };
}

function handlePerformanceHelp(): BotResponse {
    return {
        message: `⚡ Performance Tips\n\nIf the app is slow:\n\n1. Close background apps - Free up memory\n2. Restart the app - Clears cache\n3. Check storage - Need space for photos\n4. Restart phone - Fresh start\n\nFor best performance:\n• Keep OS updated\n• Don't run too many apps\n• Regularly export old data`,
        intent: 'performance_help',
    };
}

function handleSyncHelp(): BotResponse {
    return {
        message: `🔄 Sync Issues\n\nIf sync isn't working:\n\n1. Check internet connection\n2. Try Wi-Fi instead of cellular\n3. Force close & reopen app\n4. Check Settings for sync status\n\nRemember: Sync is a Pro feature. Free accounts use local-only storage.`,
        actions: [
            { label: '⚙️ Check Settings', screen: 'SettingsTab', icon: 'sync' },
        ],
        intent: 'sync_help',
    };
}

function handleThanks(): BotResponse {
    const responses = [
        `😊 You're welcome! Happy to help with your inventory.`,
        `🙌 Anytime! Keep documenting those items.`,
        `👍 Glad I could help! Your home is getting more organized.`,
        `✨ No problem! Remember to add photos to new purchases.`,
        `💪 You got this! Your inventory is in great hands.`,
    ];
    return {
        message: responses[Math.floor(Math.random() * responses.length)],
        intent: 'thanks',
    };
}

function handleGoodbye(): BotResponse {
    const responses = [
        `👋 Take care! Your inventory is looking great.`,
        `🏠 Bye! Keep your home documented.`,
        `✌️ See you later! Come back anytime.`,
        `🌟 Goodbye! Happy organizing.`,
    ];
    return {
        message: responses[Math.floor(Math.random() * responses.length)],
        intent: 'goodbye',
    };
}

function handleJoke(): BotResponse {
    const jokes = [
        `😄 Why did the inventory go to therapy?\n\nIt had too many unresolved items!`,
        `🏠 What did the house say to the inventory app?\n\nYou really know how to organize my life!`,
        `📸 Why are photos great at parties?\n\nThey always capture the moment!`,
        `💡 How many items does it take to change a lightbulb?\n\nJust one, but make sure to document it first!`,
    ];
    return {
        message: jokes[Math.floor(Math.random() * jokes.length)],
        intent: 'joke',
    };
}

function handleCreator(): BotResponse {
    return {
        message: `🧑‍💻 Who Built ProvLy\n\nProvLy was crafted with ❤️ by a team passionate about:\n\n• Privacy-first design\n• Beautiful, simple interfaces\n• Helping people protect their belongings\n\nWe believe everyone deserves peace of mind when it comes to their stuff.\n\n*Thanks for using ProvLy*`,
        intent: 'creator',
    };
}

function handleUnknown(factPack: FactPack | null): BotResponse {
    const count = factPack?.total_items || 0;
    return {
        message: `🤔 I'm not sure about that, but I can help with:\n\nInventory:\n• "How many items?" • "Total value?"\n• "What's missing photos?"\n\nClaims:\n• "How to file a claim?"\n• "Export my inventory"\n\nOrganization:\n• "Add a room" • "Add an item"\n\nApp Info:\n• "What is ProvLy?" • "Upgrade to Pro"\n\nYou have ${count} items. What would you like to know?`,
        actions: [
            { label: '❓ Full Help', screen: 'help', icon: 'help' },
            { label: '📊 Dashboard', screen: 'HomeTab', icon: 'chart' },
        ],
        intent: 'unknown',
    };
}

// ============================================================
// MAIN ENGINE FUNCTION
// ============================================================

/**
 * Detect intent from user message
 */
function detectIntent(text: string): string {
    const lowerText = text.toLowerCase().trim();

    // Check for exact/near-exact matches first
    for (const pattern of INTENT_PATTERNS) {
        for (const keyword of pattern.keywords) {
            if (lowerText.includes(keyword)) {
                return pattern.intent;
            }
        }
    }

    return 'unknown';
}

/**
 * Main entry point: Generate response from user message
 */
export function respondToUserMessage(input: {
    text: string;
    factPack?: FactPack | null;
    locale?: 'en' | 'es' | 'it';
}): BotResponse {
    const { text, factPack = null } = input;
    const intent = detectIntent(text);

    switch (intent) {
        case 'greeting':
            return handleGreeting(factPack);
        case 'help':
            return handleHelp();
        case 'about_app':
            return handleAboutApp();
        case 'privacy_info':
            return handlePrivacyInfo();
        case 'pricing_info':
            return handlePricingInfo(factPack);
        case 'count_items':
            return handleCountItems(factPack);
        case 'total_value':
            return handleTotalValue(factPack);
        case 'summary':
            return handleSummary(factPack);
        case 'recent_items':
            return handleRecentItems(factPack);
        case 'missing_photos':
            return handleMissingPhotos(factPack);
        case 'missing_receipts':
            return handleMissingReceipts(factPack);
        case 'missing_serial':
            return handleMissingSerial(factPack);
        case 'proof_status':
        case 'proof_gaps':
            return handleProofGaps(factPack);
        case 'claims_help':
            return handleClaimsHelp();
        case 'disaster_help':
            return handleDisasterHelp();
        case 'insurance_tips':
            return handleInsuranceTips();
        case 'export_help':
            return handleExportHelp();
        case 'zip_export':
            return handleZipExport();
        case 'add_item':
            return handleAddItem();
        case 'add_room':
            return handleAddRoom();
        case 'add_home':
            return handleAddHome();
        case 'rooms_info':
            return handleRoomsInfo(factPack);
        case 'homes_info':
            return handleHomesInfo(factPack);
        case 'categories_info':
            return handleCategoriesInfo(factPack);
        case 'high_value_items':
            return handleHighValueItems(factPack);
        case 'organize_help':
            return handleOrganizeHelp(factPack);
        case 'edit_item':
            return handleEditItem();
        case 'delete_item':
            return handleDeleteItem();
        case 'find_item':
            return handleFindItem();
        case 'settings':
            return handleSettings();
        case 'backup_info':
            return handleBackupInfo();
        case 'security_info':
            return handleSecurityInfo();
        case 'language_info':
            return handleLanguageInfo();
        case 'profile_info':
            return handleProfileInfo();
        case 'logout_help':
            return handleLogoutHelp();
        case 'troubleshoot':
            return handleTroubleshoot();
        case 'performance_help':
            return handlePerformanceHelp();
        case 'sync_help':
            return handleSyncHelp();
        case 'thanks':
            return handleThanks();
        case 'goodbye':
            return handleGoodbye();
        case 'joke':
            return handleJoke();
        case 'creator':
            return handleCreator();
        default:
            return handleUnknown(factPack);
    }
}
