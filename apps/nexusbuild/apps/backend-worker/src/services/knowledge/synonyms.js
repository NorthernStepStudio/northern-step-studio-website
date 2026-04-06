/**
 * 🔤 Synonym Map
 * Canonical terms for use cases, game genres, and brands.
 */

export const SYNONYM_MAP = {
    useCases: {
        gaming: [
            'gaming', 'game', 'games', 'play', 'fps', 'esports', 'competitive', 'ranked'
        ],
        work: [
            'work', 'workstation', 'productivity', 'office', 'editing', 'rendering',
            'coding', 'programming', 'professional', 'creator', 'content creation'
        ],
        streaming: [
            'streaming', 'stream', 'livestream', 'broadcast', 'obs', 'twitch', 'youtube'
        ],
    },
    gameGenres: {
        fps: ['fps', 'shooter', 'first person shooter', 'tactical shooter'],
        rpg: ['rpg', 'role playing', 'role-playing', 'jrpg', 'action rpg'],
        moba: ['moba', 'arena', 'dota', 'league', 'lol'],
        battle_royale: ['battle royale', 'br'],
        strategy: ['strategy', 'rts', 'tactics', '4x'],
        sim: ['sim', 'simulation', 'simulator', 'flight sim', 'racing sim'],
        racing: ['racing', 'racer', 'driving'],
        sports: ['sports', 'sports game', 'fifa', 'nba', 'mlb'],
        survival: ['survival', 'survival crafting'],
        sandbox: ['sandbox', 'open world', 'crafting'],
    },
    brands: {
        nvidia: ['nvidia', 'geforce', 'rtx', 'gtx', 'quadro'],
        amd: ['amd', 'radeon', 'rx', 'ryzen', 'threadripper'],
        intel: ['intel', 'core', 'arc', 'xeon', 'pentium', 'celeron'],
        apple: ['apple', 'mac', 'macbook', 'm1', 'm2', 'm3'],
    },
};

export default SYNONYM_MAP;
