/**
 * 💼 KNOWLEDGE: Workstation & Productivity
 * 
 * Specialized knowledge for professional workloads:
 * Video Editing, 3D Rendering, Machine Learning, Coding, etc.
 */

export const WORKSTATION_KNOWLEDGE = {
    // === VIDEO EDITING ===
    videoEditing: {
        title: 'Video Editing Workstation',
        software: ['Adobe Premiere Pro', 'DaVinci Resolve', 'After Effects'],
        priorities: [
            { component: 'CPU', importance: 'High', note: 'Premiere loves Intel QuickSync (iGPU). High core count for export.' },
            { component: 'GPU', importance: 'Very High', note: 'Resolve needs VRAM. 12GB minimum for 4K. NVIDIA CUDA is superior.' },
            { component: 'RAM', importance: 'Critical', note: '32GB minimum. 64GB+ for 4K/8K or complex AE comps.' },
            { component: 'Storage', importance: 'High', note: 'Fast Gen4 NVMe for footage. Separate OS and scratch drives recommended.' }
        ],
        recommendations: {
            'Premiere Pro': 'Intel Core i7/i9 (w/ iGPU) + NVIDIA GPU',
            'DaVinci Resolve': 'NVIDIA GPU with high VRAM (RTX 3090/4090) + High core count CPU (AMD/Intel)',
            'After Effects': 'Single-core speed (High GHz) + Massive RAM (64GB-128GB)'
        }
    },

    // === 3D RENDERING ===
    rendering3D: {
        title: '3D Modeling & Rendering',
        software: ['Blender', 'Cinema 4D', 'Maya', 'V-Ray', 'Arnold'],
        engines: {
            'CPU Rendering': {
                description: 'Uses CPU cores. Scales perfectly with thread count.',
                bestHardware: 'Threadripper, Ryzen 9 9950X, i9-14900K',
                keyMetric: 'Multi-core Cinebench score'
            },
            'GPU Rendering': {
                description: 'Uses Graphics Card. Much faster than CPU for supported engines.',
                bestHardware: 'NVIDIA RTX 4090 (OptiX API is king). Multiple GPUs scale well.',
                keyMetric: 'VRAM capacity (to fit scenes) + CUDA core count'
            }
        },
        recommendations: {
            'Blender': 'NVIDIA RTX GPU (OptiX is faster than CUDA/OpenCL). High VRAM ensures you can render complex scenes.',
            'V-Ray': 'Check if you use CPU or GPU engine. Hybrid setups work well.'
        }
    },

    // === MACHINE LEARNING / AI ===
    machineLearning: {
        title: 'AI / Deep Learning',
        software: ['TensorFlow', 'PyTorch', 'Stable Diffusion', 'LLMs (Ollama)'],
        ruleOfThumb: 'VRAM is King.',
        notes: [
            'NVIDIA is the only real choice due to CUDA support.',
            'AMD ROCm is improving but still second class.',
            'Consumer cards (RTX 3090/4090) are great value due to 24GB VRAM.',
            'For professionals: A6000 Ada (48GB) allows larger batch sizes.'
        ],
        requirements: {
            'Student/Beginner': 'RTX 3060 12GB or RTX 4060 Ti 16GB (Cheap 16GB VRAM)',
            'Serious Hobbyist': 'RTX 3090/4090 (24GB VRAM)',
            'Researcher': 'Dual RTX 4090 or RTX 6000 Ada'
        }
    },

    // === SOFTWARE DEVELOPMENT ===
    development: {
        title: 'Software Development',
        scenarios: {
            'Web Dev': {
                needs: 'Medium RAM (32GB for Docker), Fast Single Core.',
                hardware: 'Any modern i5/Ryzen 5, 32GB RAM.'
            },
            'Game Dev (Unreal/Unity)': {
                needs: 'Strong GPU, High RAM, Fast compiling CPU.',
                hardware: 'Ryzen 9 / i7 + RTX 4070 or better + 64GB RAM.'
            },
            'Virtualization/Servers': {
                needs: 'Cores and RAM. GPU irrelevant.',
                hardware: 'Ryzen 9 9950X (32 threads) + 96GB/128GB RAM.'
            }
        }
    },

    // === MUSIC PRODUCTION ===
    musicProduction: {
        title: 'Music Production (DAW)',
        software: ['Ableton Live', 'FL Studio', 'Logic Pro', 'Pro Tools'],
        priorities: [
            { component: 'CPU', importance: 'Critical', note: 'Single-core speed for real-time chains. Cores for number of tracks.' },
            { component: 'RAM', importance: 'High', note: '32GB+ for large sample libraries (Kontakt).' },
            { component: 'Storage', importance: 'High', note: 'Silent NVMe drives. No HDDs (noise).' },
            { component: 'Silence', importance: 'Critical', note: 'Quiet case fans and cooler are vital for recording.' },
            { component: 'DPC Latency', importance: 'Critical', note: 'Avoid motherboards/drivers with high DPC latency.' }
        ],
        notes: 'GPU is irrelevant for audio. Integrated graphics are fine and quieter.'
    }
};

export default WORKSTATION_KNOWLEDGE;
