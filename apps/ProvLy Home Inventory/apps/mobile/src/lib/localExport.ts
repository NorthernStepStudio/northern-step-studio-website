// apps/mobile/src/lib/localExport.ts
// Local export functionality - generates CSV/reports from SQLite without backend

import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { itemsRepo } from '../db/repositories/itemsRepo';
import JSZip from 'jszip';

// Cast FileSystem to any to avoid linter issues with cacheDirectory/EncodingType
// which definitely exist in the Expo SDK but are missing from some type definitions.
const FS = FileSystem as any;

export interface ExportResult {
    success: boolean;
    filename: string;
    itemCount: number;
    totalValue: number;
}

/**
 * Generates a PRO "Claim Pack" ZIP dossier containing:
 * - Inventory CSV
 * - Summary Report (TXT)
 * - All Item Photos (in /photos folder)
 */
export async function exportClaimPack(homeId?: string): Promise<ExportResult> {
    try {
        const zip = new JSZip();

        // 1. Generate Content Data
        const csvContent = await generateCSVContent(homeId);
        const summaryContent = await generateSummaryContent(homeId);

        // 2. Add Reports to Zip
        zip.file("inventory.csv", csvContent);
        zip.file("summary_report.txt", summaryContent);

        // 3. Add Photos
        const media = await itemsRepo.getAllMedia();
        const items = await itemsRepo.listItems();
        const rooms = await itemsRepo.listRooms();
        const roomMap = new Map(rooms.map(r => [r.id, r.name]));

        // Filter by home if needed
        const relevantItems = homeId ? items.filter(i => i.homeId === homeId) : items;
        const relevantItemIds = new Set(relevantItems.map(i => i.id));
        const relevantMedia = media.filter(m => relevantItemIds.has(m.itemId));

        let imgIndex = 0;
        for (const m of relevantMedia) {
            try {
                // Read file as base64
                const b64 = await FS.readAsStringAsync(m.uri, { encoding: FS.EncodingType.Base64 });
                const extension = m.uri.split('.').pop() || 'jpg';

                const item = relevantItems.find(i => i.id === m.itemId);
                const safeItemName = (item?.name || 'Item').replace(/[^a-z0-9]/gi, '_').substring(0, 20);
                const roomName = item?.roomId ? (roomMap.get(item.roomId) || 'Unknown Room') : 'Uncategorized';
                const safeRoomName = roomName.replace(/[^a-z0-9 ]/gi, '_');

                // Place in room-specific folder
                const photoPath = `photos/${safeRoomName}/${safeItemName}_${imgIndex++}.${extension}`;
                zip.file(photoPath, b64, { base64: true });
            } catch (e) {
                console.warn(`Failed to pack image ${m.uri}`, e);
            }
        }

        // 4. Generate Zip File
        const base64Zip = await zip.generateAsync({ type: "base64" });

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        const filename = `ProvLy_ClaimPack_${timestamp}.zip`;
        const tempPath = `${FS.cacheDirectory}${filename}`;

        await FS.writeAsStringAsync(tempPath, base64Zip, { encoding: FS.EncodingType.Base64 });

        // 5. Share
        if (!(await Sharing.isAvailableAsync())) {
            throw new Error('Sharing is unavailable');
        }

        await Sharing.shareAsync(tempPath, {
            mimeType: 'application/zip',
            dialogTitle: 'Export Claim Pack Dossier',
            UTI: 'public.archive' // Important for iOS
        });

        const totalValue = relevantItems.reduce((sum, item) => sum + (Number(item.purchasePrice) || 0), 0);

        return {
            success: true,
            filename,
            itemCount: relevantItems.length,
            totalValue
        };
    } catch (error: any) {
        console.error('Export Claim Pack Error:', error);
        throw new Error(`Failed to create Claim Pack: ${error.message}`);
    }
}

/**
 * Shared Helper: Generate CSV Content String
 */
async function generateCSVContent(homeId?: string): Promise<string> {
    let items = await itemsRepo.listItems();
    let rooms = await itemsRepo.listRooms();
    const media = await itemsRepo.getAllMedia();

    if (homeId) {
        items = items.filter(i => i.homeId === homeId);
        rooms = rooms.filter(r => r.homeId === homeId);
    }

    const roomMap = new Map(rooms.map(r => [r.id, r.name]));

    const headers = ['Name', 'Category', 'Room', 'Description', 'Value', 'Quantity', 'Purchase Date', 'Serial Number', 'Model Number', 'Notes', 'Photos', 'Created At'];

    const rows = items.map(item => {
        const roomName = item.roomId ? (roomMap.get(item.roomId) || 'Unknown') : 'No Room';
        const itemPhotos = media.filter(m => m.itemId === item.id).map(m => m.uri).join('; ');

        return [
            escapeCSV(item.name || ''),
            escapeCSV(item.category || ''),
            escapeCSV(roomName),
            escapeCSV(item.description || ''),
            item.purchasePrice?.toString() || '0',
            item.quantity?.toString() || '1',
            item.purchaseDate || '',
            escapeCSV(item.serialNumber || ''),
            escapeCSV(item.modelNumber || ''),
            escapeCSV(item.notes || ''),
            escapeCSV(itemPhotos),
            item.createdAt || ''
        ];
    });

    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
}

/**
 * Shared Helper: Generate Summary Report String
 */
async function generateSummaryContent(homeId?: string): Promise<string> {
    let rooms = await itemsRepo.listRooms();
    let items = await itemsRepo.listItems();
    const media = await itemsRepo.getAllMedia();

    if (homeId) {
        rooms = rooms.filter(r => r.homeId === homeId);
        items = items.filter(i => i.homeId === homeId);
    }

    const totalItems = items.length;
    const totalValue = items.reduce((sum, item) => sum + (Number(item.purchasePrice) || 0), 0);
    const missingPhotos = items.filter(i => media.filter(m => m.itemId === i.id).length === 0);
    const missingReceipts = items.filter(i => (Number(i.purchasePrice) || 0) <= 0);
    const criticalGaps = items.filter(i =>
        media.filter(m => m.itemId === i.id).length === 0 && (Number(i.purchasePrice) || 0) <= 0
    );

    const highValueItems = [...items]
        .sort((a, b) => (Number(b.purchasePrice) || 0) - (Number(a.purchasePrice) || 0))
        .slice(0, 10)
        .filter(i => (Number(i.purchasePrice) || 0) > 0);

    // Category Breakdown
    const categoryMap: Record<string, { count: number, value: number }> = {};
    items.forEach(item => {
        const cat = item.category || 'Uncategorized';
        if (!categoryMap[cat]) categoryMap[cat] = { count: 0, value: 0 };
        categoryMap[cat].count++;
        categoryMap[cat].value += (Number(item.purchasePrice) || 0);
    });

    const categoryStats = Object.entries(categoryMap)
        .sort((a, b) => b[1].value - a[1].value)
        .map(([cat, stats]) => `  - ${cat.padEnd(20)}: ${stats.count.toString().padStart(3)} items ($${stats.value.toLocaleString()})`)
        .join('\n');

    // Room Stats & Item Lists
    const roomDetails = rooms.map(room => {
        const roomItems = items.filter(i => i.roomId === room.id);
        const roomValue = roomItems.reduce((sum, i) => sum + (Number(i.purchasePrice) || 0), 0);

        const itemLines = roomItems.map(i => {
            const name = i.name.substring(0, 35).padEnd(35);
            const price = `$${(Number(i.purchasePrice) || 0).toLocaleString()}`.padStart(12);
            const cat = `[${(i.category || 'Other').substring(0, 15)}]`.padEnd(18);
            return `    ${cat} ${name} ${price}`;
        }).join('\n');

        return `
[ ROOM: ${room.name.toUpperCase()} ]
-------------------------------------------------------------------------------
Items: ${roomItems.length.toString().padStart(2)} | Room Valuation: $${roomValue.toLocaleString()}
-------------------------------------------------------------------------------
    CATEGORY           ITEM NAME                                 VALUATION
${itemLines || '    (No items found in this room)'}
`.trim();
    }).join('\n\n');

    const timestamp = new Date().toLocaleString();

    return `
===============================================
         PROVLY INVENTORY SUMMARY
===============================================

Generated: ${timestamp}
Property:  ${homeId ? (await itemsRepo.listHomes()).find(h => h.id === homeId)?.name || 'Property' : 'All Properties'}

EXECUTIVE SUMMARY
-----------------------------------------------
Total Items          : ${totalItems}
Total Estimated Value: $${totalValue.toLocaleString()}
Items Missing Photos : ${missingPhotos.length}
Items Missing Price  : ${missingReceipts.length}
Critical Gaps        : ${criticalGaps.length}

VALUATION BY CATEGORY
-----------------------------------------------
${categoryStats || '  No categories assigned'}

TOP 10 HIGH-VALUE ASSETS
-----------------------------------------------
${highValueItems.map((i, idx) => `${idx + 1}. ${i.name.padEnd(30)} $${(Number(i.purchasePrice) || 0).toLocaleString()}`).join('\n') || '  No priced items found'}

CRITICAL DOCUMENTATION GAPS
(Items missing both photo AND purchase price)
-----------------------------------------------
${criticalGaps.map(i => `- ${i.name}`).join('\n') || '  None - All items have at least one form of proof!'}

FULL INVENTORY BY ROOM
-----------------------------------------------
${roomDetails || '  No rooms or items configured'}

===============================================
         Report generated by ProvLy
         Secure your legacy.
===============================================
`.trim();
}

/**
 * Generates a CSV export of all inventory items and shares it
 */
export async function exportInventoryCSV(homeId?: string): Promise<ExportResult> {
    try {
        const csvContent = await generateCSVContent(homeId);
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        const filename = `ProvLy_Inventory_${timestamp}.csv`;

        // Write and Share
        const fileUri = `${FS.cacheDirectory}${filename}`;
        await FS.writeAsStringAsync(fileUri, csvContent);

        if (!(await Sharing.isAvailableAsync())) throw new Error('Sharing not available');

        await Sharing.shareAsync(fileUri, {
            mimeType: 'text/csv',
            dialogTitle: 'Export Inventory CSV',
            UTI: 'public.comma-separated-values-text'
        });

        // Recalculate basic stats for return
        const items = await itemsRepo.listItems();
        const relevant = homeId ? items.filter(i => i.homeId === homeId) : items;

        return {
            success: true,
            filename,
            itemCount: relevant.length,
            totalValue: relevant.reduce((s, i) => s + (Number(i.purchasePrice) || 0), 0)
        };
    } catch (error: any) {
        console.error('Export CSV Error:', error);
        throw new Error(`Failed to export CSV: ${error.message}`);
    }
}

/**
 * Generates a summary report text file with inventory statistics
 */
export async function exportInventorySummary(homeId?: string): Promise<ExportResult> {
    try {
        const summaryContent = await generateSummaryContent(homeId);
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        const filename = `ProvLy_Summary_${timestamp}.txt`;

        const fileUri = `${FS.cacheDirectory}${filename}`;
        await FS.writeAsStringAsync(fileUri, summaryContent);

        if (!(await Sharing.isAvailableAsync())) throw new Error('Sharing is not available');

        await Sharing.shareAsync(fileUri, {
            mimeType: 'text/plain',
            dialogTitle: 'Export Summary Report',
        });

        // Quick re-calc for return values
        const items = await itemsRepo.listItems();
        const relevant = homeId ? items.filter(i => i.homeId === homeId) : items;

        return {
            success: true,
            filename,
            itemCount: relevant.length,
            totalValue: relevant.reduce((s, i) => s + (Number(i.purchasePrice) || 0), 0)
        };
    } catch (error: any) {
        console.error('Export Summary Error:', error);
        throw new Error(`Failed to export Summary: ${error.message}`);
    }
}

/**
 * Escape a value for CSV format
 */
function escapeCSV(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
}

export const localExport = {
    exportCSV: exportInventoryCSV,
    exportSummary: exportInventorySummary,
    exportClaimPack: exportClaimPack
};
