/**
 * 🔥 KNOWLEDGE: Roast My Build
 * 
 * Logic to professionally insult bad PC builds.
 * Triggered by 'roast my build', 'rate my setup', etc.
 */

export const ROAST_LOGIC = {
    // === ROAST PATTERNS ===
    bottlenecks: {
        'cpu_bottleneck': {
            check: (cpu, gpu) => gpu.price > 1000 && cpu.price < 200,
            roast: "You paired a ${gpu} with a ${cpu}? That GPU is going to be waiting on the CPU like it's at the DMV. Bottleneck city."
        },
        'gpu_bottleneck': {
            check: (cpu, gpu) => cpu.price > 500 && gpu.price < 300,
            roast: "All that CPU power and you bought a ${gpu}? That's like putting a Ferrari engine in a Honda Civic."
        }
    },

    badValue: {
        'overkill_ram': {
            check: (ram) => ram.capacity >= 128 && !ram.isWorkstation,
            roast: "128GB of RAM just to play Minecraft and open 3 Chrome tabs? Chrome thanks you for your donation."
        },
        'cheap_psu': {
            check: (psu, totalCost) => totalCost > 2000 && psu.price < 80,
            roast: "A $2000 PC with a $60 PSU? I hope you like fireworks, because that thing is a ticking time bomb."
        },
        'hdd_boot': {
            check: (storage) => storage.type === 'HDD' && storage.isBoot,
            roast: "Booting off an HDD in 2024? I didn't know we were doing a historical reenactment of 2010."
        }
    },

    // === BRAND ROASTS ===
    brands: {
        'Alienware': "Ah, Alienware. Paying double the price for plastic casing and zero airflow. Classic.",
        'UserBenchmark': "Did you get these recs from UserBenchmark? Because they are objectively wrong.",
        'NoRGB': "No RGB? I respect the stealth look, but how will you know it's fast if it doesn't glow red?"
    },

    // === GENERIC ROASTS ===
    generic: [
        "It's not the worst build I've seen... wait, yes it is.",
        "I've clearanced better PCs at Goodwill.",
        "Did you pick these parts by throwing darts at a catalog?",
        "This build has 'buyer's remorse' written all over it."
    ]
};

export default ROAST_LOGIC;
