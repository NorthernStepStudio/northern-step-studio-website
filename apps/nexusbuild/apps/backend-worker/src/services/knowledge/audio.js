/**
 * 🎧 KNOWLEDGE: PC Audio Guide
 *
 * Headphones, Microphones, DACs, and Audio Interfaces.
 */

export const AUDIO_KNOWLEDGE = {
    // === HEADPHONES ===
    headphones: {
        types: {
            'Open Back': {
                pros: ['Wide soundstage (immersive)', 'Natural sound', 'Breathable ears'],
                cons: ['Sound leaks out', 'Zero isolation (hear fan noise)'],
                bestFor: ['Competitive FPS (positional audio)', 'Critical listening'],
                examples: ['Sennheiser HD 560S', 'Beyerdynamic DT 990 Pro', 'Philips SHP9500']
            },
            'Closed Back': {
                pros: ['Passive noise isolation', 'Typically more bass', 'Sound stays in'],
                cons: ['Narrow soundstage (in-head feeling)', 'Ears get hot'],
                bestFor: ['Noisy environments', 'Bass-heavy music', 'Office'],
                examples: ['Beyerdynamic DT 770 Pro', 'Audio-Technica M50x', 'AKG K371']
            },
            'IEMs': {
                name: 'In-Ear Monitors',
                pros: ['Excellent value (Chi-Fi)', 'Comfort issues solved', 'Great isolation'],
                cons: ['Cable tangling', 'Ear canal comfort variance'],
                bestFor: ['Gaming (Wallhacks tier imaging)', 'Budget audiophiles'],
                examples: ['Moondrop Aria', 'Truthhear x Crinacle Zero', 'Linsoul 7Hz Salnotes Zero']
            }
        },
        recommendations: {
            budget: 'Koss KSC75 or Linsoul 7Hz Salnotes Zero ($20)',
            gamingHeadset: 'HyperX Cloud II or PC38X (actually good)',
            competitiveFPS: 'Sennheiser HD 560S (Wallhack tier imaging)',
            wireless: 'Audeze Maxwell (Best sound quality wireless)',
            audiophileEntry: 'Hifiman Sundara (Planar Magnetic)'
        }
    },

    // === MICROPHONES ===
    microphones: {
        types: {
            'Dynamic': {
                description: 'Less sensitive, rejects background noise better.',
                bestFor: 'Untreated rooms, podcasting.',
                example: 'Shure SM7B, Samson Q2U'
            },
            'Condenser': {
                description: 'Very sensitive, captures high detail but also keyboard clicks/fans.',
                bestFor: 'Studio environments, vocals.',
                example: 'Blue Yeti, Audio-Technica AT2020'
            }
        },
        interfaces: {
            'USB': {
                description: 'Plug and play. Built-in ADC.',
                pros: ['Easy', 'Cheaper'],
                cons: ['Limited upgrade path']
            },
            'XLR': {
                description: 'Analogue connection. Needs Audio Interface.',
                pros: ['Higher quality ceiling', 'Mixer control'],
                cons: ['Expensive setup (Mic + Interface + Cable)']
            }
        }
    },

    // === DACs & AMPs ===
    dacAmp: {
        basics: {
            'DAC': 'Digital to Analog Converter. Cleans up the sound signal.',
            'Amp': 'Amplifier. Makes it louder and drives high impedance headphones.',
        },
        doINeedOne: [
            'For most "gaming" headsets: NO.',
            'For high impedance (250 ohm+) headphones: YES.',
            'If you hear static/hiss from motherboard audio: YES (Apple USB-C Dongle is a $9 fix).',
            'Apple USB-C Dongle is surprisingly a very good DAC for < $10.'
        ],
        recommendations: {
            budget: 'Apple USB-C Dongle ($9) - Seriously.',
            entry: 'FiiO E10K-TC ($75)',
            midRange: 'JDS Labs Atom Stack or Schiit Modi/Magni ($200)',
            integrated: 'Topping DX3 Pro+ ($200)'
        }
    },

    // === COMMON MYTHS ===
    myths: [
        '7.1 Surround Sound in headsets is a GIMMICK. Stereo with good imaging is better.',
        'Gold plated cables improve digital sound quality (False).',
        'You need 192kHz audio (False, humans can\'t hear difference past 44.1/48kHz).'
    ]
};

export default AUDIO_KNOWLEDGE;
