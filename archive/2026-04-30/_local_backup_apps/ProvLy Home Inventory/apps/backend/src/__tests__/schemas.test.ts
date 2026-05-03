import {
    CreateHomeInput,
    CreateRoomInput,
    CreateItemInput,
    UpdateItemInput,
} from '../../../../packages/shared/src/index';

describe('Zod Schemas', () => {
    describe('CreateHomeInput', () => {
        it('should validate a valid home input', () => {
            const input = { name: 'My House', address: '123 Main St' };
            const result = CreateHomeInput.safeParse(input);
            expect(result.success).toBe(true);
        });

        it('should reject empty name', () => {
            const input = { name: '', address: '123 Main St' };
            const result = CreateHomeInput.safeParse(input);
            expect(result.success).toBe(false);
        });

        it('should allow missing address', () => {
            const input = { name: 'My House' };
            const result = CreateHomeInput.safeParse(input);
            expect(result.success).toBe(true);
        });
    });

    describe('CreateItemInput', () => {
        it('should validate a full item input', () => {
            const input = {
                roomId: '550e8400-e29b-41d4-a716-446655440000',
                name: 'MacBook Pro',
                category: 'Electronics',
                brand: 'Apple',
                model: 'M3 Max',
                purchasePrice: 3499,
            };
            const result = CreateItemInput.safeParse(input);
            expect(result.success).toBe(true);
        });

        it('should reject invalid UUID for roomId', () => {
            const input = {
                roomId: 'not-a-uuid',
                name: 'TV',
            };
            const result = CreateItemInput.safeParse(input);
            expect(result.success).toBe(false);
        });

        it('should require name', () => {
            const input = {
                roomId: '550e8400-e29b-41d4-a716-446655440000',
            };
            const result = CreateItemInput.safeParse(input);
            expect(result.success).toBe(false);
        });
    });

    describe('UpdateItemInput', () => {
        it('should allow partial updates', () => {
            const input = { brand: 'Sony' };
            const result = UpdateItemInput.safeParse(input);
            expect(result.success).toBe(true);
        });

        it('should allow empty object', () => {
            const input = {};
            const result = UpdateItemInput.safeParse(input);
            expect(result.success).toBe(true);
        });
    });
});
