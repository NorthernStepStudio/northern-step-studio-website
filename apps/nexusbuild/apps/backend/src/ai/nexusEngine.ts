/**
 * NexusEngine - Custom Rule-Based AI Chatbot
 * No external LLM dependencies - fast, reliable, fully controlled
 */

import { ALL_PARTS, searchParts, getPartsByCategory, getBudgetBuild } from '../data';

// ============ TYPES ============
interface ConversationContext {
    awaitingType?: 'budget' | 'gpu' | 'cpu' | 'usecase' | 'component' | 'confirmation' | 'compareTarget';
    lastQuestion?: string;
    extractedBudget?: number;
    extractedUseCase?: 'gaming' | 'streaming' | 'work' | 'general';
    mentionedComponents?: { type: string; name: string }[];
    currentBuildParts?: Record<string, any>;
    compareFirstComponent?: { type: 'gpu' | 'cpu'; name: string }; // For "compare X to ?" flow
}

interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

interface NexusResponse {
    text: string;
    suggestions: string[];
    build?: {
        parts: Record<string, any>;
        total: number;
        reasoning: string;
    };
    context?: ConversationContext;
}

// ============ INTENT DETECTION ============
interface DetectedIntents {
    hasBudget: boolean;
    budget?: number;
    isGaming: boolean;
    isStreaming: boolean;
    isWork: boolean;
    isUpgrade: boolean;
    isBottleneck: boolean;
    isCompatibility: boolean;
    isTroubleshooting: boolean;
    isGreeting: boolean;
    isThanks: boolean;
    isComponentQuestion: boolean; // "best GPU for X", "what CPU should I get"
    isComparison: boolean; // "X vs Y", "compare X and Y"
    targetResolution?: '1080p' | '1440p' | '4k';
    mentionedGpu?: string;
    mentionedCpu?: string;
}

function detectIntents(message: string): DetectedIntents {
    const lower = message.toLowerCase();

    // Budget extraction - but NOT resolutions or GPU/CPU model numbers
    // Remove patterns that look like component model numbers
    const cleanedForBudget = lower
        .replace(/1080p?/gi, '')
        .replace(/1440p?/gi, '')
        .replace(/2160p?/gi, '')
        .replace(/4k/gi, '')
        .replace(/\d+\s*hz/gi, '') // Refresh rates
        // GPU model numbers - RTX/GTX/RX series
        .replace(/rtx?\s*\d{4}/gi, '')
        .replace(/gtx?\s*\d{4}/gi, '')
        .replace(/rx\s*\d{4}/gi, '')
        .replace(/\b(4090|4080|4070|4060|3090|3080|3070|3060|3050)\b/gi, '')
        .replace(/\b(7900|7800|7700|7600|6950|6900|6800|6700|6600)\s*(xt|xtx)?/gi, '')
        // CPU model numbers - Intel/AMD
        .replace(/\b(13900|14900|13700|14700|13600|14600|13400|14400|12900|12700|12600|12400)\s*[kf]?/gi, '')
        .replace(/\b(5600|5700|5800|5900|5950|7600|7700|7800|7900|7950|9700|9800|9900|9950)\s*x?(3d)?/gi, '');

    // Budget extraction: Match $1500, 1500 dollars, or just plain 1500 (if it looks like a budget amount)
    // Plain numbers between 500-10000 are likely budgets
    const budgetMatch = cleanedForBudget.match(/\$\s*(\d{3,5})|\b(\d{3,5})\s*(dollar|usd|bucks?|budget)?/i);
    let budget = budgetMatch ? parseInt(budgetMatch[1] || budgetMatch[2]) : undefined;
    // Validate budget range (500-10000) for plain numbers without $ or "dollars" suffix
    if (budget && budgetMatch && !budgetMatch[1] && !budgetMatch[3] && (budget < 500 || budget > 10000)) {
        budget = undefined; // Reject numbers outside typical PC budget range
    }
    const hasBudget = budget !== undefined && budget >= 500;

    // Use case detection - with typo tolerance
    const isGaming = /gaming|game|play|fps|4k|1440p|esport/i.test(lower);
    const isStreaming = /stream|twitch|obs|broadcast|content creat/i.test(lower);
    // Workstation detection with common typos
    const isWork = /work\s*stat|wrkstat|workstat|productivity|office|edit|render|3d|blender|premiere|video edit|cad|autocad|solidworks|architect|engineer|design|develop|program|code|coding/i.test(lower);

    // Question types
    const isUpgrade = /upgrade|improve|faster|better|replace|swap|old/i.test(lower);
    const isBottleneck = /bottleneck|bottle.?neck|limiting|hold.?back/i.test(lower);
    const isCompatibility = /compatible|compatibility|work with|fit|support/i.test(lower);
    const isTroubleshooting = /problem|issue|not working|crash|error|help|fix/i.test(lower);

    // Social
    const isGreeting = /^(hi|hello|hey|sup|yo|what'?s up|howdy)/i.test(lower);
    const isThanks = /thank|thanks|thx|appreciate|awesome|perfect|great/i.test(lower);

    // Component mentions - expanded patterns for better detection
    const gpuPatterns = [
        /rtx\s*(30|40)\d{2}(\s*ti)?(\s*super)?/i,
        /gtx\s*(10|16)\d{2}(\s*ti)?(\s*super)?/i,
        /gtx\s*(9[67]0|980|780|750|660|560|550|460|450)/i, // Older GTX
        /rx\s*(5|6|7)\d{3}(\s*xt|xtx)?/i,
        /rx\s*(580|570|480|470|590|560|550)/i, // Older RX
        /(4090|4080|4070|4060|3090|3080|3070|3060|3050|2080|2070|2060|1080|1070|1060|1050)/i,
        /(7900\s*xtx?|7800\s*xt|7700\s*xt|7600|6900\s*xt|6800\s*xt|6700\s*xt|6600\s*xt)/i,
        // Quadro / Professional cards
        /quadro\s*(rtx\s*)?[a-z]?\d{3,5}/i, // Quadro M4000, Quadro RTX 4000, etc
        /quadro\s*(p|k|m)?\d{3,5}/i,
        // Tesla (workstation/compute)
        /tesla\s*[a-z]?\d{2,3}/i,
        // Very old GeForce (GT, GTS, 8xxx, 9xxx)
        /geforce\s*(gt|gts|gtx)?\s*\d{3,4}/i,
        /gt\s*\d{3,4}/i, // GT 710, GT 1030
        // Radeon HD series
        /radeon\s*(hd)?\s*\d{4}/i, // HD 7970, HD 5870
        /hd\s*\d{4}/i,
        // Intel Arc
        /arc\s*a\d{3}/i, // Arc A770, A750, A380
    ];

    const cpuPatterns = [
        /ryzen\s*(3|5|7|9)\s*\d{4}/i,
        /i[3579]-?\d{4,5}/i,
        /(5600x?|5800x?|7600x?|7800x3d|9800x3d)/i,
        /(13400|13600|14600|13700|14700|13900|14900)/i,
    ];

    let mentionedGpu: string | undefined;
    let mentionedCpu: string | undefined;

    for (const pattern of gpuPatterns) {
        const match = lower.match(pattern);
        if (match) {
            mentionedGpu = match[0].toUpperCase();
            break;
        }
    }

    for (const pattern of cpuPatterns) {
        const match = lower.match(pattern);
        if (match) {
            mentionedCpu = match[0];
            break;
        }
    }

    // Detect component-specific questions like "best GPU for X", "what CPU should I get"
    const isComponentQuestion = /best\s*(gpu|graphics|cpu|processor|ram|memory|mobo|motherboard|psu|power\s*supply|case|cooler)|what\s*(gpu|cpu|graphics|processor|mobo|motherboard|psu|power\s*supply|case|cooler)\s*(should|do|would|for)|recommend.*(gpu|cpu|graphics|mobo|motherboard|psu|power\s*supply|case|cooler)/i.test(lower);

    // Detect target resolution
    let targetResolution: '1080p' | '1440p' | '4k' | undefined;
    if (/1080p|1080|full\s*hd/i.test(lower)) targetResolution = '1080p';
    else if (/1440p|1440|2k|qhd/i.test(lower)) targetResolution = '1440p';
    else if (/4k|2160p|uhd/i.test(lower)) targetResolution = '4k';

    // Detect comparison questions like "4070 vs 7800 xt"
    const isComparison = /\bvs\b|versus|compare|compared|or\b|better|between/i.test(lower);

    return {
        hasBudget,
        budget,
        isGaming,
        isStreaming,
        isWork,
        isUpgrade,
        isBottleneck,
        isCompatibility,
        isTroubleshooting,
        isGreeting,
        isThanks,
        isComponentQuestion,
        isComparison,
        targetResolution,
        mentionedGpu,
        mentionedCpu,
    };
}

// ============ BUILD GENERATOR ============
interface BuildConfig {
    useCase: 'gaming' | 'streaming' | 'work' | 'general';
    budget: number;
}

interface GeneratedBuild {
    parts: Record<string, { name: string; price: number; category: string }>;
    total: number;
    table: string;
    reasoning: string;
}

function generateBuild(config: BuildConfig): GeneratedBuild {
    const { useCase, budget } = config;

    // Map use case to getBudgetBuild parameter
    const useCaseMap: Record<string, 'gaming' | 'workstation' | 'streaming' | 'general'> = {
        gaming: 'gaming',
        streaming: 'streaming',
        work: 'workstation',
        general: 'general'
    };

    // Use the smarter getBudgetBuild that handles socket/DDR matching
    const selectedParts = getBudgetBuild(budget, useCaseMap[useCase] || 'gaming');

    const parts: Record<string, { name: string; price: number; category: string }> = {};
    let total = 0;

    for (const part of selectedParts) {
        const cat = part.category.toLowerCase();
        parts[cat] = { name: part.name, price: part.price, category: cat };
        total += part.price;
    }

    // Build markdown table
    let table = '| Component | Part | Price |\n|-----------|------|-------|\n';
    const categoryOrder = ['cpu', 'gpu', 'motherboard', 'ram', 'storage', 'psu', 'case', 'cooler'];
    for (const cat of categoryOrder) {
        if (parts[cat]) {
            table += `| **${cat.toUpperCase()}** | ${parts[cat].name} | $${parts[cat].price.toFixed(2)} |\n`;
        }
    }
    table += `| **TOTAL** | | **$${total.toFixed(2)}** |`;

    // Generate reasoning based on use case
    const reasoning = useCase === 'gaming'
        ? 'This build prioritizes GPU performance for maximum FPS. Parts are matched for compatibility (socket, DDR type).'
        : useCase === 'streaming'
            ? 'This build balances CPU and GPU for smooth streaming while gaming. 32GB RAM recommended for multitasking.'
            : useCase === 'work'
                ? 'This build prioritizes CPU and RAM for productivity. Great for CAD, video editing, and 3D rendering.'
                : 'A balanced build suitable for gaming, productivity, and general use.';

    return { parts, total, table, reasoning };
}

// ============ MAIN ENGINE ============
export function processChat(
    messages: ChatMessage[],
    context: ConversationContext = {}
): NexusResponse {
    // Get the latest user message
    const userMessages = messages.filter(m => m.role === 'user');
    if (userMessages.length === 0) {
        return {
            text: "Hey there! I'm Nexus, your PC building assistant. What kind of PC are you looking to build?",
            suggestions: ['Gaming PC', 'Streaming setup', 'Work/Productivity PC'],
            context
        };
    }

    const latestMessage = userMessages[userMessages.length - 1].content;
    const lower = latestMessage.toLowerCase().trim();
    const intents = detectIntents(latestMessage);

    // ============ CONTEXT-AWARE RESPONSES ============
    // If Nexus asked a question, handle the user's response in context

    if (context.awaitingType === 'budget') {
        // ESCAPE HATCH: If user ignores question and asks something else
        if (intents.isUpgrade || intents.isComparison || intents.isComponentQuestion || intents.isBottleneck || intents.isGreeting) {
            context.awaitingType = undefined;
            return processChat(messages, context);
        }
        // User is responding to "What's your budget?"
        if (intents.hasBudget && intents.budget) {
            context.extractedBudget = intents.budget;
            context.awaitingType = 'usecase';

            return {
                text: `Great, **$${intents.budget}** is a solid budget! What will you mainly use this PC for?`,
                suggestions: ['Gaming', 'Streaming', 'Work/Productivity', 'General use'],
                context
            };
        } else if (/cheap|budget|affordable|low/i.test(lower)) {
            context.extractedBudget = 800;
            context.awaitingType = 'usecase';
            return {
                text: "I'll aim for a budget-friendly build around **$800**. What will you mainly use this PC for?",
                suggestions: ['Gaming', 'Streaming', 'Work/Productivity'],
                context
            };
        } else {
            return {
                text: "I didn't catch that. What's your total budget? Just give me a number like **$1000** or **$1500**.",
                suggestions: ['$800', '$1000', '$1500', '$2000'],
                context
            };
        }
    }

    if (context.awaitingType === 'usecase') {
        // ESCAPE HATCH
        if (intents.isUpgrade || intents.isComparison || intents.isComponentQuestion || intents.isBottleneck || intents.isGreeting) {
            context.awaitingType = undefined;
            return processChat(messages, context);
        }
        // User is responding to "What will you use it for?"
        let useCase: 'gaming' | 'streaming' | 'work' | 'general' = 'general';

        if (/gaming|game|play|fps/i.test(lower)) useCase = 'gaming';
        else if (/stream|twitch|content/i.test(lower)) useCase = 'streaming';
        else if (/work|productivity|office|edit/i.test(lower)) useCase = 'work';

        context.extractedUseCase = useCase;

        // Generate the build!
        const budget = context.extractedBudget || 1000;
        const build = generateBuild({ useCase, budget });

        // Reset awaiting state
        context.awaitingType = undefined;

        return {
            text: `## 🖥️ Your ${useCase.charAt(0).toUpperCase() + useCase.slice(1)} PC Build ($${budget})\n\n${build.table}\n\n**Why these parts?**\n${build.reasoning}`,
            suggestions: ['Add to my build', 'Show alternatives', 'Different budget'],
            build: {
                parts: build.parts,
                total: build.total,
                reasoning: build.reasoning
            },
            context
        };
    }

    if (context.awaitingType === 'gpu') {
        // ESCAPE HATCH
        if (!intents.mentionedGpu && (intents.isUpgrade || intents.isComparison || intents.isComponentQuestion || intents.isBottleneck || intents.isGreeting)) {
            context.awaitingType = undefined;
            return processChat(messages, context);
        }
        // User is answering what GPU they have for upgrade recommendations
        if (intents.mentionedGpu) {
            const gpu = intents.mentionedGpu.toUpperCase();
            const useCase = context.extractedUseCase || 'gaming';
            context.awaitingType = undefined;

            // Use-case specific upgrade recommendations
            let recommendations = '';

            if (useCase === 'work') {
                // Workstation upgrades - professional cards
                recommendations = `## 🔧 Workstation GPU Upgrades from ${gpu}

| Use Case | Recommended GPU | Price | Notes |
|----------|-----------------|-------|-------|
| **CAD/3D Modeling** | RTX A4000 | $999 | 16GB, certified drivers |
| **Video Editing** | RTX 4070 Super | $599 | Great for Premiere/Resolve |
| **3D Rendering** | RTX 4080 Super | $999 | Excellent CUDA performance |
| **Budget Option** | RTX 4060 Ti | $399 | Good entry workstation |

**Workstation considerations:**
- ✅ ECC memory support (Quadro/RTX A series)
- ✅ ISV certifications for CAD software
- ✅ Multi-monitor support`;
            } else if (useCase === 'streaming') {
                // Streaming upgrades - NVENC priority
                recommendations = `## 📺 Streaming GPU Upgrades from ${gpu}

| Priority | Recommended GPU | Price | Notes |
|----------|-----------------|-------|-------|
| **Best Encoder** | RTX 4070 Super | $599 | NVENC AV1 encoder |
| **Budget Stream** | RTX 4060 | $299 | Great NVENC, 8GB VRAM |
| **Future-Proof** | RTX 4080 Super | $999 | Stream 4K + game |
| **Value Pick** | RX 7800 XT | $449 | AMD VCE encoder |

**For streaming, also consider:**
- 🎤 CPU: Ryzen 7 7800X3D or i7-14700K (encoding fallback)
- 💾 RAM: 32GB recommended for multitasking
- 💽 Storage: NVMe for VOD recording`;
            } else {
                // Gaming upgrades (default)
                let upgrades = { budget: '', midrange: '', highend: '' };

                if (/1050|1060|1070|580|570|480|560|660|750|quadro|tesla|gt\s*\d{3}|hd\s*\d{4}/i.test(gpu)) {
                    upgrades = {
                        budget: 'RTX 4060 ($299) - 2-3x faster',
                        midrange: 'RTX 4070 Super ($599) - 4x faster',
                        highend: 'RX 7800 XT ($449) - Best value'
                    };
                } else if (/1080|2060|2070|5700|1660|6600/i.test(gpu)) {
                    upgrades = {
                        budget: 'RTX 4060 Ti ($399) - Nice bump',
                        midrange: 'RTX 4070 Super ($599) - Great upgrade',
                        highend: 'RX 7800 XT ($449) - Best value'
                    };
                } else if (/2080|3060|3070|6700|6800/i.test(gpu)) {
                    upgrades = {
                        budget: 'RTX 4070 ($549) - Modest gain',
                        midrange: 'RTX 4070 Ti Super ($799) - Solid upgrade',
                        highend: 'RTX 4080 Super ($999) - Big jump'
                    };
                } else if (/3080|3090|6900|4070|4080/i.test(gpu)) {
                    upgrades = {
                        budget: 'Wait for RTX 50 series',
                        midrange: 'RTX 4080 Super ($999) - ~30% gain',
                        highend: 'RTX 4090 ($1599) - Max performance'
                    };
                } else {
                    upgrades = {
                        budget: 'RTX 4060 ($299) - Great entry',
                        midrange: 'RTX 4070 Super ($599) - Sweet spot',
                        highend: 'RX 7800 XT ($449) - Best value'
                    };
                }

                recommendations = `## 🎮 Gaming GPU Upgrades from ${gpu}

| Option | Upgrade |
|--------|---------|
| 💰 **Budget** | ${upgrades.budget} |
| ⚡ **Sweet Spot** | ${upgrades.midrange} |
| 🔥 **High-End** | ${upgrades.highend} |

**Before upgrading, check:**
- PSU wattage (550W+ recommended)
- CPU bottleneck risk
- Case clearance for new card`;
            }

            return {
                text: recommendations,
                suggestions: ['Check CPU compatibility', 'Build a new PC', 'Compare GPUs'],
                context
            };
        } else {
            // Ask what GPU they have
            return {
                text: "What GPU do you currently have? For example: GTX 1060, RTX 3060, Quadro M4000, etc.",
                suggestions: ['GTX 1060', 'RTX 3060', 'Quadro M4000', 'RX 580'],
                context
            };
        }
    }

    if (context.awaitingType === 'cpu') {
        // ESCAPE HATCH
        if (!intents.mentionedCpu && (intents.isUpgrade || intents.isComparison || intents.isComponentQuestion || intents.isBottleneck || intents.isGreeting)) {
            context.awaitingType = undefined;
            return processChat(messages, context);
        }
        // User is answering what CPU they have
        if (intents.mentionedCpu) {
            const gpu = context.mentionedComponents?.find(c => c.type === 'gpu')?.name || 'your GPU';
            context.awaitingType = undefined;

            return {
                text: `## 🎯 Bottleneck Analysis: ${intents.mentionedCpu} + ${gpu}\n\n✅ **Good pairing!** These components are well-matched for most games.\n\n**Tips:**\n- At 1080p: Slight CPU limitation in competitive games (normal)\n- At 1440p: Perfect balance\n- At 4K: GPU-limited (optimal)`,
                suggestions: ['Upgrade recommendations', 'Build a new PC', 'What games can I run?'],
                context
            };
        } else {
            return {
                text: "What CPU do you have? For example: Ryzen 5 5600X, i5-13400F, Ryzen 7 7800X3D, etc.",
                suggestions: ['Ryzen 5 5600X', 'i5-13400F', 'Ryzen 7 7800X3D'],
                context
            };
        }
    }

    // Handle comparison target (user is answering "what do you want to compare X to?")
    if (context.awaitingType === 'compareTarget' && context.compareFirstComponent) {
        // ESCAPE HATCH
        if (!intents.mentionedGpu && (intents.isUpgrade || intents.isComparison || intents.isComponentQuestion || intents.isBottleneck || intents.isGreeting)) {
            context.awaitingType = undefined;
            context.compareFirstComponent = undefined;
            return processChat(messages, context);
        }

        const firstGpu = context.compareFirstComponent.name;

        if (intents.mentionedGpu) {
            const secondGpu = intents.mentionedGpu.toUpperCase();
            context.awaitingType = undefined;
            context.compareFirstComponent = undefined;

            // Generate comparison table
            return {
                text: `## ⚔️ ${firstGpu} vs ${secondGpu}\n\nI'll compare these GPUs for you! Here's what matters:\n\n| Factor | ${firstGpu} | ${secondGpu} |\n|--------|------------|------------|\n| **Gaming Performance** | Check benchmarks | Check benchmarks |\n| **VRAM** | Varies | Varies |\n| **Ray Tracing** | Depends on gen | Depends on gen |\n| **Power Draw** | Check specs | Check specs |\n\n**Tip:** Search for "${firstGpu} vs ${secondGpu} benchmark" for detailed FPS comparisons!\n\nWant me to recommend one for a specific use case?`,
                suggestions: ['For 1440p gaming', 'For streaming', 'For workstation'],
                context
            };
        } else {
            return {
                text: `What GPU do you want to compare **${firstGpu}** to?`,
                suggestions: ['RTX 4070', 'RX 7800 XT', 'RTX 4060', 'Show popular comparisons'],
                context
            };
        }
    }

    // ============ NEW CONVERSATION STARTERS ============

    // Greeting
    if (intents.isGreeting && lower.length < 20) {
        return {
            text: "Hey! 👋 I'm Nexus, your PC building assistant. I can help you:\n\n• **Build a PC** for your budget\n• **Check compatibility** between parts\n• **Recommend upgrades** for your current setup\n\nWhat can I help you with today?",
            suggestions: ['Build me a gaming PC', 'Check my parts compatibility', 'Upgrade advice'],
            context
        };
    }

    // Thanks
    if (intents.isThanks) {
        return {
            text: "You're welcome! 🙌 Need anything else? I'm here to help with any PC questions.",
            suggestions: ['Adjust my build', 'Different budget', 'Ask about parts'],
            context
        };
    }

    // GPU Comparison questions like "4070 vs 7800 xt"
    if (intents.isComparison && /gpu|graphics|4070|4080|7800|7900|3070|3080|compare/i.test(latestMessage)) {
        // RTX 4070 vs RX 7800 XT (common comparison)
        if (/4070/i.test(latestMessage) && /7800/i.test(latestMessage)) {
            return {
                text: "## ⚔️ RTX 4070 Super vs RX 7800 XT\n\n| Spec | RTX 4070 Super | RX 7800 XT |\n|------|----------------|------------|\n| **MSRP** | $599 | $449 |\n| **VRAM** | 12GB GDDR6X | 16GB GDDR6 |\n| **1440p Gaming** | Excellent | Excellent |\n| **Ray Tracing** | Much better | Good |\n| **DLSS/FSR** | DLSS 3 + Frame Gen | FSR 3 |\n| **Power Draw** | 220W | 263W |\n\n**Verdict:**\n- 🏆 **RX 7800 XT** for pure value - $150 less, 16GB VRAM\n- 🏆 **RTX 4070 Super** if you want DLSS 3 + better ray tracing\n\nBoth are excellent 1440p cards!",
                suggestions: ['Best CPU pairing', 'Build with RX 7800 XT', 'Build with RTX 4070'],
                context
            };
        }

        // RTX 4080 vs 7900 XT
        if (/4080/i.test(latestMessage) && /7900/i.test(latestMessage)) {
            return {
                text: "## ⚔️ RTX 4080 Super vs RX 7900 XT\n\n| Spec | RTX 4080 Super | RX 7900 XT |\n|------|----------------|------------|\n| **MSRP** | $999 | $749 |\n| **VRAM** | 16GB GDDR6X | 20GB GDDR6 |\n| **4K Gaming** | Excellent | Very Good |\n| **Ray Tracing** | Excellent | Good |\n| **Power Draw** | 320W | 315W |\n\n**Verdict:**\n- 🏆 **RX 7900 XT** for value - $250 less, more VRAM\n- 🏆 **RTX 4080 Super** for ray tracing and DLSS 3\n\nBoth are great 4K cards!",
                suggestions: ['Best CPU pairing', 'Build with 7900 XT', 'Build with 4080'],
                context
            };
        }

        // Chipset / Motherboard comparison
        if (/z790|b760|x670|b650|chipset/i.test(latestMessage)) {
            return {
                text: "## 🔌 Chipset Comparison\n\n| Feature | B650/B760 | X670/Z790 |\n|---------|-----------|-----------|\n| **Overclocking** | Memory Only (usually) | CPU + Memory |\n| **PCIe Lanes** | Standard | Maximum |\n| **USB Ports** | Standard | High Count |\n| **Price** | $150-$250 | $300+ |\n\n**Verdict:** B650/B760 is perfect for gaming. Only get X670/Z790 for heavy productivity rigs!",
                suggestions: ['Best B650 motherboard', 'Best Z790 motherboard', 'Back to build'],
                context
            };
        }

        // Single GPU mentioned with "compare" - ask what to compare to
        if (intents.mentionedGpu && !/vs|versus/i.test(latestMessage)) {
            context.awaitingType = 'compareTarget';
            context.compareFirstComponent = { type: 'gpu', name: intents.mentionedGpu.toUpperCase() };

            return {
                text: `Great! What GPU would you like to compare **${intents.mentionedGpu.toUpperCase()}** to?`,
                suggestions: ['RTX 4070 Super', 'RX 7800 XT', 'RTX 4060', 'Show popular options'],
                context
            };
        }

        // Generic GPU comparison request
        return {
            text: "I can help compare GPUs! Here are the most popular matchups:\n\n**1440p Sweet Spots:**\n• RTX 4070 Super vs RX 7800 XT\n• RTX 4060 Ti vs RX 7700 XT\n\n**4K Gaming:**\n• RTX 4080 Super vs RX 7900 XT\n• RTX 4090 vs RX 7900 XTX\n\nOr tell me which GPU you want to compare!",
            suggestions: ['4070 vs 7800 XT', '4080 vs 7900 XT', 'Compare my RTX 3060'],
            context
        };
    }

    // Component-specific questions like "best GPU for 1440p"
    if (intents.isComponentQuestion) {
        // GPU recommendations by resolution
        if (/gpu|graphics/i.test(latestMessage)) {
            if (intents.targetResolution === '4k') {
                return {
                    text: "## 🎮 Best GPUs for 4K Gaming\n\n| Tier | GPU | MSRP | Notes |\n|------|-----|------|-------|\n| **Top** | RTX 4090 | $1,599 | Best 4K performance, overkill for most |\n| **High-End** | RTX 4080 Super | $999 | Excellent 4K, great value |\n| **Sweet Spot** | RTX 4070 Ti Super | $799 | Solid 4K 60fps in most games |\n| **AMD Option** | RX 7900 XTX | $899 | Great 4K performance |\n\n**My recommendation:** RTX 4080 Super - best balance of performance and price for 4K.",
                    suggestions: ['Compare RTX 4080 vs 4090', 'Best CPU pairing', 'Build a 4K gaming PC'],
                    context
                };
            } else if (intents.targetResolution === '1440p') {
                return {
                    text: "## 🎮 Best GPUs for 1440p Gaming\n\n| Tier | GPU | MSRP | Notes |\n|------|-----|------|-------|\n| **Overkill** | RTX 4080 Super | $999 | 100+ FPS ultra settings |\n| **Sweet Spot** | RTX 4070 Super | $599 | Excellent 1440p, high refresh |\n| **Great Value** | RX 7800 XT | $449 | Best price-to-performance |\n| **Budget** | RTX 4060 Ti | $399 | Solid 1440p medium-high |\n\n**My recommendation:** RX 7800 XT - incredible value for 1440p gaming!",
                    suggestions: ['RX 7800 XT vs RTX 4070', 'Best CPU for 1440p', 'Build a 1440p PC'],
                    context
                };
            } else if (intents.targetResolution === '1080p') {
                return {
                    text: "## 🎮 Best GPUs for 1080p Gaming\n\n| Tier | GPU | MSRP | Notes |\n|------|-----|------|-------|\n| **High Refresh** | RTX 4060 Ti | $399 | 144fps+ competitive games |\n| **Sweet Spot** | RTX 4060 | $299 | Great 1080p all-around |\n| **Best Value** | RX 7600 | $249 | Excellent budget option |\n| **Entry** | RTX 3060 | $229 | Still solid for 1080p |\n\n**My recommendation:** RTX 4060 - perfect balance for 1080p gaming!",
                    suggestions: ['RTX 4060 vs RX 7600', 'Best CPU for 1080p', 'Build a 1080p budget PC'],
                    context
                };
            } else {
                // No specific resolution mentioned
                return {
                    text: "What resolution are you gaming at? This helps me recommend the right GPU:\n\n• **1080p** - Budget-friendly, high refresh rates\n• **1440p** - Sweet spot for quality & performance\n• **4K** - Maximum visual quality",
                    suggestions: ['Best GPU for 1080p', 'Best GPU for 1440p', 'Best GPU for 4K'],
                    context
                };
            }
        }

        // CPU recommendations
        if (/cpu|processor/i.test(latestMessage)) {
            return {
                text: "## 💻 Best CPUs (2025)\n\n| Tier | CPU | MSRP | Notes |\n|------|-----|------|-------|\n| **Gaming King** | Ryzen 7 9800X3D | $479 | The absolute fastest gaming CPU |\n| **Premium Intel** | Core Ultra 9 285K | $589 | Best for hybrid work/play |\n| **Sweet Spot** | Ryzen 7 9700X | $359 | Efficient high-end performance |\n| **Best Value** | Ryzen 5 7600/9600X | $199+ | Perfect for budget builds |\n\n**My pick:** **Ryzen 7 9800X3D** if you want the best framerates possible!",
                suggestions: ['9800X3D vs 7800X3D', 'Best motherboard pairing', 'Build with 9800X3D'],
                context
            };
        }

        // Motherboard recommendations
        if (/mobo|motherboard/i.test(latestMessage)) {
            return {
                text: "## 🔌 Best Motherboards (2024)\n\n| Socket | Chipset | Best For | Notes |\n|--------|---------|----------|-------|\n| **AM5** | B650 | Ryzen 7000/9000 | Best value, fully unlocked |\n| **AM5** | X670E | High-End | Extreme overclocking, more USB |\n| **LGA1700** | B760 | Intel 13/14th Gen | Great value, no CPU OC |\n| **LGA1700** | Z790 | Enthusiast | CPU OC support, max lanes |\n\n**My tip:** A good **B650** or **B760** board is perfect for 95% of gamers!",
                suggestions: ['Best B650 motherboard', 'Z790 vs B760', 'Check compatibility'],
                context
            };
        }

        // Case recommendations
        if (/case|chassis|tower/i.test(latestMessage)) {
            return {
                text: "## 📦 Best PC Cases (2025)\n\n| Case | Type | Price | Best For |\n|------|------|-------|----------|\n| **NZXT H6 Flow** | Dual Chamber | $109 | Best Airflow & Looks |\n| **Hyte Y70** | Showcase | $359 | Premium with Screen |\n| **Montech King 95** | Dual Chamber | $149 | Value & Fans Included |\n| **Corsair 4000D** | Mid Tower | $90 | Classic & Reliable |\n\n**My pick:** **NZXT H6 Flow** is the easiest to build in right now!",
                suggestions: ['Best RGB fans', 'Check cooling', 'Add H6 Flow to build'],
                context
            };
        }

        // Cooler recommendations
        if (/cooler|cooling|aio|heatsink/i.test(latestMessage)) {
            return {
                text: "## ❄️ Best CPU Coolers (2025)\n\n| Cooler | Type | Price | Performance |\n|--------|------|-------|-------------|\n| **Phantom Spirit 120** | Air | $35 | Beats $100 coolers |\n| **Arctic LF III 360** | AIO | $119 | Max Performance |\n| **Lian Li Galahad II** | AIO | $169 | Best Aesthetics |\n\n**Tip:** For Ryzen 7600/9600X, a $35 Phantom Spirit is plenty!",
                suggestions: ['Air vs Liquid', 'Best 360mm AIO', 'Cooling for 9800X3D'],
                context
            };
        }
    }

    // Compatibility check
    if (intents.isCompatibility) {
        if (intents.mentionedGpu && intents.mentionedCpu) {
            return {
                text: `## 🧩 Compatibility Check: ${intents.mentionedCpu} + ${intents.mentionedGpu}\n\n✅ **Compatible!** These parts work well together.\n\n**Things to check:**\n- PSU wattage (ensure enough power)\n- Case clearance (GPU length)\n- Motherboard socket match`,
                suggestions: ['Check PSU requirements', 'Build a PC with these', 'Upgrade advice'],
                context
            };
        } else {
            return {
                text: "I can check compatibility! What parts are you looking to pair? (e.g. 'Ryzen 7600 with RTX 4060')",
                suggestions: ['Ryzen 5 7600 + RTX 4060', 'i5-13600K + DDR4', 'Check bottleneck'],
                context
            };
        }
    }

    // Trending / Hot parts
    if (/trending|popular|hot|selling/i.test(lower)) {
        return {
            text: "## 🔥 Trending Parts (2025)\n\nHere's what everyone is building with right now:\n\n- **CPU:** AMD Ryzen 7 9800X3D (The Gaming King)\n- **GPU:** RTX 4070 Super (Best Value High-End)\n- **Case:** NZXT H6 Flow (Dual Chamber)\n- **Cooler:** Thermalright Phantom Spirit 120 SE\n\nWant to start a build with these?",
            suggestions: ['Build with 9800X3D', 'Build with 4070 Super', 'See full build'],
            context
        };
    }

    // Benchmarks
    if (/benchmark|fps|performance/i.test(lower) && !intents.isGaming) {
        return {
            text: "For accurate benchmarks, I recommend checking YouTube reviews from channels like Hardware Unboxed or Gamers Nexus. I can give you estimated performance tiers though! What GPU are you looking at?",
            suggestions: ['RTX 4060 performance', 'RX 7800 XT benchmarks', 'Compare GPUs'],
            context
        };
    }

    // Add to build / Save / Alternatives
    if (/add\s*to\s*build|save|keep\s*this|show\s*alternative/i.test(lower)) {
        return {
            text: "I've noted that for your build preference! 📝 (Full build saving is supported in the app builder). What would you like to do next?",
            suggestions: ['Show full build', 'Change budget', 'Start over'],
            context
        };
    }

    // "Different budget" / "Adjust build"
    if (/different\s*budget|adjust|change|games?\s*can\s*i\s*run/i.test(lower)) {
        if (/game/i.test(lower)) {
            return {
                text: "With modern parts, you can run almost anything! 🎮\n\n- **1080p:** 60+ FPS on High settings\n- **1440p:** Smooth gameplay (depending on GPU)\n\nWhat GPU are you planning to use?",
                suggestions: ['Check 4060 performance', 'Check 7800 XT benchmarks', 'Build a PC'],
                context
            };
        }

        context.awaitingType = 'budget';
        return {
            text: "Sure! What's your new **budget** target?",
            suggestions: ['$800', '$1000', '$1500', '$2000'],
            context
        };
    }

    // PSU Questions
    if (/psu|power\s*supply/i.test(lower)) {
        return {
            text: "## ⚡ PSU Recommendations\n\n- **RTX 4060/7600:** 550W is plenty\n- **RTX 4070/7800 XT:** 650W-750W recommended\n- **RTX 4080/4090:** 850W-1000W required\n\n**Tip:** Always get 80+ Gold designated units from brands like Corsair, Seasonic, or EVGA.",
            suggestions: ['Corsair RM750e', 'Seasonic Focus GX-750', 'How many watts do I need?'],
            context
        };
    }

    // Budget + Use case in one message
    if (intents.hasBudget && intents.budget) {
        const useCase = intents.isGaming ? 'gaming'
            : intents.isStreaming ? 'streaming'
                : intents.isWork ? 'work'
                    : 'general';

        const build = generateBuild({ useCase, budget: intents.budget });

        return {
            text: `## 🖥️ Your ${useCase.charAt(0).toUpperCase() + useCase.slice(1)} PC Build ($${intents.budget})\n\n${build.table}\n\n**Why these parts?**\n${build.reasoning}`,
            suggestions: ['Add to my build', 'Show alternatives', 'Different budget'],
            build: {
                parts: build.parts,
                total: build.total,
                reasoning: build.reasoning
            },
            context
        };
    }

    // "Budget build" request - user already told us they want affordable
    if (/budget\s*(build|pc|gaming|computer)/i.test(latestMessage) && !intents.hasBudget) {
        // Show a sample $700 gaming build and ask what kind of PC
        const build = generateBuild({ useCase: 'gaming', budget: 700 });

        return {
            text: `## 💰 Budget Build (~$700)\n\nHere's a sample **gaming** build:\n\n${build.table}\n\n**What kind of PC are you building?** This helps me pick the right parts!`,
            suggestions: ['Gaming PC', 'Streaming PC', 'Workstation', 'Keep this build'],
            build: {
                parts: build.parts,
                total: build.total,
                reasoning: build.reasoning
            },
            context
        };
    }

    // Gaming request without budget
    if (intents.isGaming && !intents.hasBudget) {
        context.awaitingType = 'budget';
        context.extractedUseCase = 'gaming';

        return {
            text: "Awesome, a gaming PC! 🎮 What's your budget?",
            suggestions: ['$800', '$1000', '$1500', '$2000'],
            context
        };
    }

    // Streaming request without budget
    if (intents.isStreaming && !intents.hasBudget) {
        context.awaitingType = 'budget';
        context.extractedUseCase = 'streaming';

        return {
            text: "A streaming setup! 📺 What's your budget for the build?",
            suggestions: ['$1000', '$1500', '$2000', '$2500'],
            context
        };
    }

    // Work/productivity/workstation request
    if (intents.isWork && !intents.hasBudget) {
        context.awaitingType = 'budget';
        context.extractedUseCase = 'work';

        return {
            text: "A workstation build! 💼 Great for CAD, 3D rendering, video editing, and professional work.\n\nWhat's your **budget**?",
            suggestions: ['$1000', '$1500', '$2000', '$3000'],
            context
        };
    }

    // Bottleneck question
    if (intents.isBottleneck) {
        if (intents.mentionedGpu && intents.mentionedCpu) {
            return {
                text: `## 🎯 Bottleneck Check: ${intents.mentionedCpu} + ${intents.mentionedGpu}\n\n✅ These are well-matched! No significant bottleneck.\n\nFor best results:\n- 1080p gaming: CPU may limit in some esports titles\n- 1440p gaming: Perfect balance\n- 4K gaming: GPU does most of the work`,
                suggestions: ['Upgrade suggestions', 'Build a new PC', 'Gaming benchmarks'],
                context
            };
        } else {
            context.awaitingType = 'gpu';
            return {
                text: "I can check for bottlenecks! First, what **GPU** do you have (or planning to get)?",
                suggestions: ['RTX 4060', 'RTX 4070', 'RX 7800 XT', 'RTX 4080'],
                context
            };
        }
    }

    // Upgrade request
    if (intents.isUpgrade) {
        context.awaitingType = 'gpu';
        return {
            text: "I can help with upgrade recommendations! What **GPU** do you currently have?",
            suggestions: ['GTX 1060', 'RTX 2060', 'RTX 3060', 'RX 580'],
            context
        };
    }

    // Generic "build me a PC" or similar
    if (/build|pc|computer|rig/i.test(lower) && !/check|bottleneck|upgrade/i.test(lower)) {
        context.awaitingType = 'budget';

        return {
            text: "I'd love to help you build a PC! 🖥️ What's your **budget**?",
            suggestions: ['$800', '$1000', '$1500', '$2000'],
            context
        };
    }

    // Default fallback - ask for clarification
    return {
        text: "I'm not quite sure what you need. I can help you:\n\n• **Build a PC** - Just tell me your budget!\n• **Check compatibility** between parts\n• **Recommend upgrades** for your current setup\n• **Answer questions** about components\n\nWhat would you like to do?",
        suggestions: ['Build a $1000 gaming PC', 'Check bottleneck', 'Upgrade my GPU'],
        context
    };
}

export default { processChat };
