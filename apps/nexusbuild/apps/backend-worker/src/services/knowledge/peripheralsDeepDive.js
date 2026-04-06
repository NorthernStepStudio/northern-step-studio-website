/**
 * 🖱️ KNOWLEDGE: Peripherals Deep Dive
 *
 * Keyboards (Switches, layouts) and Mice (Sensors, shapes).
 */

export const PERIPHERALS_DEEP_DIVE = {
    // === KEYBOARDS ===
    keyboards: {
        switches: {
            'Linear (Red/Yellow)': {
                feel: 'Smooth, no bump.',
                sound: 'Quiet(er)',
                bestFor: 'Gaming (fast actuation)'
            },
            'Tactile (Brown)': {
                feel: 'Bump on actuation.',
                sound: 'Moderate',
                bestFor: 'Typing and Hybrid use'
            },
            'Clicky (Blue)': {
                feel: 'Bump + Audible Click.',
                sound: 'Loud',
                bestFor: 'Typing (if you live alone)',
                note: 'Annoying for voice chat.'
            },
            'Hall Effect / Magnetic': {
                feel: 'Smooth Linear (adjustable)',
                feature: 'Rapid Trigger (reset key without fully releasing).',
                bestFor: 'Competitive FPS (Valorant/CS2 essential).',
                models: ['Wooting 60HE', 'Razer Huntsman V3 Pro', 'SteelSeries Apex Pro']
            }
        },
        sizes: {
            '100% (Full)': 'Number pad included. Best for productivity.',
            'TKL (Tenkeyless)': 'No numpad. More mouse space.',
            '75%': 'Compact TKL. Arrow keys kept. Popular modern layout.',
            '60%': 'No arrows/F-keys. Maximum mouse space. Requires layers.'
        },
        keycaps: {
            'ABS': 'Smooth, develops shine over time (oils). Cheaper.',
            'PBT': 'Textured, durable, never shines. Higher quality sound.'
        },
        modding: [
            'Lube switches: Smoother feel, better sound',
            'Tape Mod: Deepens sound (Thock)',
            'Stabilizer tuning: Removes rattle'
        ]
    },

    // === MICE ===
    mice: {
        shapes: {
            'Ergo (Ergonomic)': {
                desc: 'Shaped for right hand. Best for palm grip / comfort.',
                examples: ['Razer DeathAdder', 'Zowie EC', 'Logitech G502']
            },
            'Symmetrical (Ambi)': {
                desc: 'Best for Claw/Fingertip grip. Aim potential.',
                examples: ['Logitech G Pro X Superlight', 'Razer Viper', 'Zowie FK']
            }
        },
        grips: {
            'Palm': 'Hand rests on mouse. Relaxed. Needs larger ergo mouse.',
            'Claw': 'Palm touches back, fingers arched. Stability + Speed.',
            'Fingertip': 'Only fingers touch. Maximum micro-adjustment speed. Needs small mouse.'
        },
        tech: {
            'Polling Rate': {
                '1000Hz': 'Standard (1ms). Perfectly fine for 99% of people.',
                '4000Hz/8000Hz': 'Smoother cursor, eats CPU usage (needs strong CPU).'
            },
            'Weight': {
                'Ultralight (<60g)': 'Standard for FPS. Reduces fatigue and inertia.',
                'Heavy (>90g)': 'Brick. G502 lovers only.'
            },
            'Sensor': {
                'Flawless': 'Anything from PixArt 3360/3389/3395 or Logitech Hero 25K. You can\'t make them spin out.'
            }
        },
        recommendations: {
            'Safe Shape (Ambi)': 'Logitech G Pro X Superlight 2',
            'Safe Shape (Ergo)': 'Razer DeathAdder V3 Pro',
            'Budget King': 'VGN Dragonfly F1, Zaopin Z1 Pro (Chinese mice are amazing value)',
            'MMO': 'Razer Naga (12 side buttons)'
        }
    }
};

export default PERIPHERALS_DEEP_DIVE;
