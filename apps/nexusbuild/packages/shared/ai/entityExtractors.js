export const PATTERNS = {
    gpu: /(gtx|rtx|rx|radeon|quadr[oa]|firepro|arc\s*a|nvidia|geforce)\s*\w*/i,
    cpu: /(ryzen\s*\d?\s*\d{4}|i[3579]-?\d{4,5}[kf]?|core\s*i[3579]|fx-?\d{4}|xeon|threadripper)/i,
    ram: /(ddr[345]|(\d{1,3})\s*gb\s*(ram|memory|ddr)?|\d{4}\s*mhz)/i,
    storage: /(ssd|hdd|nvme|(\d+)\s*(tb|gb)\s*(ssd|hdd|storage|drive)?)/i,
    psu: /((\d{3,4})\s*w(att)?|power\s*supply|psu|corsair\s*rm|evga|seasonic)/i,
    motherboard: /([abxz]\d{3}[me]?|motherboard|mobo|lga\s*\d{4}|am[45])/i,
    cooler: /(cooler|aio|noctua|hyper\s*212|stock\s*cooler|liquid\s*cool|air\s*cool)/i,
    case: /(mid\s*tower|full\s*tower|mini\s*itx|atx\s*case|meshify|lian\s*li|nzxt)/i,
    budget: /\$\s?(\d{3,5})|(\d{3,5})\s*(dollars?|usd|budget)/i,
    resolution: /(4k|2160p|1440p|2k|qhd|1080p|fhd|full\s*hd)/i,
};

export const GAMES = [
    'cyberpunk', 'fortnite', 'valorant', 'cs2', 'csgo', 'counter-strike',
    'elden ring', 'hogwarts', 'starfield', 'cod', 'warzone', 'apex',
    'minecraft', 'gta', 'rdr2', 'baldur', 'diablo', 'overwatch',
    'league', 'dota', 'pubg', 'rust', 'ark', 'destiny'
];
