const assert = require('assert');

const run = async () => {
    const module = await import('../synonyms.js');
    const normalizeUserMessage =
        module.normalizeUserMessage ||
        module.default?.normalizeUserMessage;

    if (typeof normalizeUserMessage !== 'function') {
        throw new TypeError('normalizeUserMessage is not a function');
    }

    const gfxResult = normalizeUserMessage('Need a gfx card upgrade for my rig.', { logMatches: false });
    assert.ok(gfxResult.normalized.toLowerCase().includes('gpu'));

    const moboResult = normalizeUserMessage('Is this mobo compatible with my power supply?', { logMatches: false });
    assert.ok(moboResult.normalized.toLowerCase().includes('motherboard'));
    assert.ok(moboResult.normalized.toLowerCase().includes('psu'));

    const chipGpu = normalizeUserMessage('Need a chip for graphics work.', { logMatches: false });
    assert.ok(chipGpu.normalized.toLowerCase().includes('gpu'));

    const chipCpu = normalizeUserMessage('Need a chip for my processor upgrade.', { logMatches: false });
    assert.ok(chipCpu.normalized.toLowerCase().includes('cpu'));
};

run().then(() => {
    console.log('Synonym normalization tests passed.');
}).catch((error) => {
    console.error('Synonym normalization tests failed.');
    console.error(error);
    process.exit(1);
});
