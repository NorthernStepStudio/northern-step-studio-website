import { useMemo } from 'react';
import { useInventoryStore, InventoryItem } from '../stores/inventoryStore';

export interface ProofPoints {
    photos: number;
    price: number;
    date: number;
    description: number;
    total: number;
}

export const useProofScore = () => {
    const { items, activeHomeId } = useInventoryStore();

    // Filter items by active home
    const homeItems = useMemo(() => {
        return items.filter(i => i.homeId === activeHomeId);
    }, [items, activeHomeId]);

    const calculateItemScore = (item: InventoryItem): ProofPoints => {
        const points = {
            photos: item.photos && item.photos.length > 0 ? 40 : 0,
            price: (Number(item.purchasePrice) || 0) > 0 ? 30 : 0,
            date: item.purchaseDate ? 5 : 0,
            description: item.description && item.description.length > 10 ? 15 : 0,
            serial: (item.serialNumber || item.modelNumber) ? 10 : 0,
        };

        return {
            ...points,
            total: points.photos + points.price + points.date + points.description,
        };
    };

    const aggregateScore = useMemo(() => {
        if (homeItems.length === 0) return 0;

        const totalPoints = homeItems.reduce((acc, item) => {
            return acc + calculateItemScore(item).total;
        }, 0);

        return Math.round(totalPoints / homeItems.length);
    }, [homeItems]);

    const missingDocs = useMemo(() => {
        return homeItems.filter(item => calculateItemScore(item).total < 100).map(item => ({
            id: item.id,
            name: item.name,
            score: calculateItemScore(item).total,
            missing: {
                photos: !item.photos || item.photos.length === 0,
                price: !(Number(item.purchasePrice) && Number(item.purchasePrice) > 0),
                date: !item.purchaseDate,
                description: !(item.description && item.description.length > 10),
            }
        }));
    }, [homeItems]);

    const missingDocsBreakdown = useMemo(() => {
        const stats = {
            photos: 0,
            receipts: 0,
            serial: 0,
            all: 0,
        };

        homeItems.forEach(item => {
            const score = calculateItemScore(item);
            if (score.total < 100) {
                stats.all++;
                if (!item.photos || item.photos.length === 0) stats.photos++;
                if (!(Number(item.purchasePrice) && Number(item.purchasePrice) > 0)) stats.receipts++;
                if (!item.serialNumber && !item.modelNumber) stats.serial++;
            }
        });

        return stats;
    }, [homeItems]);

    return {
        aggregateScore,
        missingDocs,
        missingDocsBreakdown,
        totalItems: homeItems.length,
        isFullyVerified: homeItems.length > 0 && aggregateScore === 100,
    };
};
