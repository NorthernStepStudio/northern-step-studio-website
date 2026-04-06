import { generateCSV } from '../services/exportService';

// Mock items for testing
const mockItems = [
    {
        id: '1',
        name: 'MacBook Pro',
        category: 'Electronics',
        brand: 'Apple',
        model: 'M3 Max',
        serial_number: 'ABC123',
        purchase_date: '2024-01-15',
        purchase_price: 3499,
        room_name: 'Office',
        photo_path: null,
    },
    {
        id: '2',
        name: 'Samsung TV',
        category: 'Electronics',
        brand: 'Samsung',
        model: 'QN65',
        serial_number: null,
        purchase_date: '2023-06-01',
        purchase_price: 1299,
        room_name: 'Living Room',
        photo_path: null,
    },
];

describe('Export Service', () => {
    describe('generateCSV', () => {
        it('should generate valid CSV with headers', () => {
            const buffer = generateCSV(mockItems);
            const csv = buffer.toString('utf-8');

            // Check headers
            expect(csv).toContain('Item Name');
            expect(csv).toContain('Room');
            expect(csv).toContain('Brand');
            expect(csv).toContain('Purchase Price');
        });

        it('should include all item data', () => {
            const buffer = generateCSV(mockItems);
            const csv = buffer.toString('utf-8');

            expect(csv).toContain('MacBook Pro');
            expect(csv).toContain('Apple');
            expect(csv).toContain('3499');
            expect(csv).toContain('Office');
        });

        it('should handle empty items array', () => {
            const buffer = generateCSV([]);
            const csv = buffer.toString('utf-8');

            // Should still have headers
            expect(csv).toContain('Item Name');
            expect(csv.split('\n').length).toBeLessThanOrEqual(2); // Header + possibly empty line
        });

        it('should handle null values gracefully', () => {
            const buffer = generateCSV(mockItems);
            const csv = buffer.toString('utf-8');

            // Samsung TV has null serial_number, should not throw
            expect(csv).toContain('Samsung TV');
        });
    });
});
