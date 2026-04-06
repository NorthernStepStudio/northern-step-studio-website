export const GAME_GENRES = [
    'Action', 'FPS', 'TPS', 'Battle Royale', 'MOBA', 'RTS', 'Strategy', 'Sim', 'Sports', 'Racing',
    'Fighting', 'Platformer', 'Puzzle', 'RPG', 'JRPG', 'ARPG', 'Roguelike', 'MMO', 'Survival',
    'Horror', 'Sandbox', 'Open World', 'Narrative', 'Indie', 'Casual', 'Rhythm', 'VR', 'Co-op',
    'Tactics', 'Card/Deckbuilder', 'Metroidvania', 'City Builder', 'Flight Sim', 'Stealth'
];

export const GAME_TAGS = [
    'Esports', 'AAA', 'Indie', 'Story-driven', 'Modded', 'VR-ready', 'Controller-friendly', 'Ultra-wide'
];

export const WORKSTATION_CATEGORIES = [
    'Video Editing', 'Motion Graphics', '3D Modeling', 'CAD/Engineering', 'Architecture', 'AI/ML',
    'Programming', 'Data Science', 'Audio Production', 'Photography', 'Streaming', 'Virtualization',
    'Cybersecurity', 'Office', 'Communication', 'Game Dev', 'Database', 'Benchmarking'
];

export const MOCK_GAMES = [
    { id: 'g1', title: 'Cyberpunk 2077', genre: 'RPG', tags: ['AAA', 'Story-driven', 'Ray Tracing'], performance: 'GPU Heavy' },
    { id: 'g2', title: 'Call of Duty: Warzone', genre: 'Battle Royale', tags: ['Esports', 'AAA', 'Co-op'], performance: 'CPU Heavy (High FPS)' },
    { id: 'g3', title: 'Valorant', genre: 'FPS', tags: ['Esports', 'Competitive'], performance: 'CPU Bound' },
    { id: 'g4', title: 'Elden Ring', genre: 'ARPG', tags: ['AAA', 'Open World', 'Controller-friendly'], performance: 'Balanced' },
    { id: 'g5', title: 'Microsoft Flight Simulator', genre: 'Flight Sim', tags: ['Sim', 'VR-ready'], performance: 'CPU/RAM Heavy' },
    { id: 'g6', title: 'Minecraft (Modded)', genre: 'Sandbox', tags: ['Indie', 'Modded', 'Co-op'], performance: 'RAM Heavy' },
    { id: 'g7', title: 'Fortnite', genre: 'Battle Royale', tags: ['Esports', 'Cross-play'], performance: 'Balanced' },
    { id: 'g8', title: 'League of Legends', genre: 'MOBA', tags: ['Esports'], performance: 'CPU Bound' },
    { id: 'g9', title: 'Counter-Strike 2', genre: 'FPS', tags: ['Esports', 'Competitive'], performance: 'CPU Heavy' },
    { id: 'g10', title: 'Baldur\'s Gate 3', genre: 'RPG', tags: ['Story-driven', 'Co-op'], performance: 'CPU/Sim Heavy' },
    { id: 'g11', title: 'Starfield', genre: 'RPG', tags: ['AAA', 'Open World'], performance: 'CPU/SSD Heavy' },
    { id: 'g12', title: 'Red Dead Redemption 2', genre: 'Action', tags: ['AAA', 'Story-driven'], performance: 'GPU Heavy' },
    { id: 'g13', title: 'Apex Legends', genre: 'Battle Royale', tags: ['Esports', 'Fast-paced'], performance: 'Balanced' },
    { id: 'g14', title: 'Overwatch 2', genre: 'FPS', tags: ['Esports', 'Co-op'], performance: 'Balanced' },
    { id: 'g15', title: 'The Witcher 3', genre: 'RPG', tags: ['Story-driven', 'Open World'], performance: 'GPU Heavy' },
];

export const MOCK_TOOLS = [
    { id: 't1', name: 'Adobe Premiere Pro', category: 'Video Editing', focus: 'CPU + RAM', notes: 'Quick Sync / NVENC helpful' },
    { id: 't2', name: 'DaVinci Resolve', category: 'Video Editing', focus: 'GPU VRAM', notes: 'Heavy GPU reliance' },
    { id: 't3', name: 'Blender', category: '3D Modeling', focus: 'GPU Compute', notes: 'CUDA/OptiX preferred' },
    { id: 't4', name: 'AutoCAD', category: 'CAD/Engineering', focus: 'Single-core CPU', notes: 'High frequency CPU needed' },
    { id: 't5', name: 'SolidWorks', category: 'CAD/Engineering', focus: 'Workstation GPU', notes: 'Certified drivers sometimes needed' },
    { id: 't6', name: 'Visual Studio Code', category: 'Programming', focus: 'RAM + CPU', notes: 'Lightweight, scalable' },
    { id: 't7', name: 'Docker / Kubernetes', category: 'Programming', focus: 'RAM + Cores', notes: 'Virtualization support needed' },
    { id: 't8', name: 'Stable Diffusion (Local)', category: 'AI/ML', focus: 'High VRAM', notes: 'NVIDIA GPU strongly recommended' },
    { id: 't9', name: 'Unreal Engine 5', category: 'Game Dev', focus: 'GPU + RAM', notes: 'Compile times love cores' },
    { id: 't10', name: 'Unity', category: 'Game Dev', focus: 'Balanced', notes: 'Standard 3D workload' },
    { id: 't11', name: 'OBS Studio', category: 'Streaming', focus: 'Encoder', notes: 'NVENC/AV1 support crucial' },
    { id: 't12', name: 'Adobe After Effects', category: 'Motion Graphics', focus: 'RAM', notes: 'RAM hungry (32GB+)' },
    { id: 't13', name: 'Cinema 4D', category: '3D Modeling', focus: 'CPU', notes: 'Single-core view, Multi-core render' },
    { id: 't14', name: 'Maya', category: '3D Modeling', focus: 'Balanced', notes: 'Industry standard' },
    { id: 't15', name: 'Revit', category: 'Architecture', focus: 'RAM + CPU', notes: 'Single-threaded mostly' },
];
