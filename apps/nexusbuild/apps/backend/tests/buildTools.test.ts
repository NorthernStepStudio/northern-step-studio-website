import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { checkCompatibility, estimateWattage } from '../src/tools/buildTools';

describe('checkCompatibility', () => {
    it('passes for a compatible AMD AM5 build', () => {
        const result = checkCompatibility({
            cpu: 'AMD Ryzen 7 7800X3D',
            motherboard: 'ASUS ROG Strix B650E-F',
            ram: 'Corsair Vengeance DDR5 32GB',
        });

        assert.equal(result.ok, true);
        assert.equal(result.issues.length, 0);
    });

    it('fails for a CPU and motherboard socket mismatch', () => {
        const result = checkCompatibility({
            cpu: 'AMD Ryzen 7 7800X3D',
            motherboard: 'ASUS ROG B550-F Gaming',
        });

        assert.equal(result.ok, false);
        assert.ok(result.issues.length > 0);
        assert.match(result.issues[0], /Socket mismatch/);
    });

    it('fails for DDR5 RAM on an AM4 motherboard', () => {
        const result = checkCompatibility({
            cpu: 'AMD Ryzen 7 5800X3D',
            motherboard: 'ASUS B550-F',
            ram: 'Corsair DDR5 32GB',
        });

        assert.equal(result.ok, false);
        assert.ok(result.issues.some((issue) => issue.includes('DDR4')));
    });

    it('fails for DDR4 RAM on an AM5 motherboard', () => {
        const result = checkCompatibility({
            cpu: 'AMD Ryzen 7 7700X',
            motherboard: 'MSI MAG X670E',
            ram: 'G.Skill DDR4 32GB',
        });

        assert.equal(result.ok, false);
        assert.ok(result.issues.some((issue) => issue.includes('DDR5')));
    });

    it('warns when a high-power GPU is paired with a low-wattage PSU', () => {
        const result = checkCompatibility({
            cpu: 'Intel Core i7-14700K',
            motherboard: 'MSI MAG B760 Tomahawk',
            gpu: 'NVIDIA GeForce RTX 4080',
            psu: 'EVGA 650W',
        });

        assert.ok(result.warnings.length > 0);
        assert.ok(result.warnings.some((warning) => warning.includes('850W')));
    });
});

describe('estimateWattage', () => {
    it('calculates a reasonable wattage for a mid-range build', () => {
        const result = estimateWattage({
            cpu: 'AMD Ryzen 5 7600X',
            gpu: 'NVIDIA RTX 4060 Ti',
        });

        assert.ok(result.watts_recommended >= 400);
        assert.ok(result.watts_recommended <= 600);
        assert.ok(Object.hasOwn(result.breakdown, 'CPU'));
        assert.ok(Object.hasOwn(result.breakdown, 'GPU'));
    });

    it('recommends high wattage for an RTX 4090 build', () => {
        const result = estimateWattage({
            cpu: 'Intel Core i9-14900K',
            gpu: 'NVIDIA RTX 4090',
        });

        assert.ok(result.watts_recommended >= 850);
        assert.ok(result.notes.length > 0);
    });
});
