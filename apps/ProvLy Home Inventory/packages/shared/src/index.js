"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateItemInput = exports.CreateItemInput = exports.CreateRoomInput = exports.CreateHomeInput = exports.ExportJobSchema = exports.DocumentSchema = exports.ItemSchema = exports.RoomSchema = exports.HomeSchema = exports.ProfileSchema = exports.ExportStatus = exports.DocType = exports.ItemStatus = exports.SubscriptionTier = void 0;
const zod_1 = require("zod");
// === Enums ===
exports.SubscriptionTier = zod_1.z.enum(['free', 'plus', 'pro']);
exports.ItemStatus = zod_1.z.enum(['active', 'discarded', 'sold']);
exports.DocType = zod_1.z.enum(['receipt', 'warranty', 'manual', 'photo', 'other']);
exports.ExportStatus = zod_1.z.enum(['pending', 'processing', 'completed', 'failed', 'expired']);
// === Schemas ===
exports.ProfileSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    fullName: zod_1.z.string().nullable(),
    subscriptionTier: exports.SubscriptionTier,
    aiEnabled: zod_1.z.boolean(),
});
exports.HomeSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    userId: zod_1.z.string().uuid(),
    name: zod_1.z.string().min(1),
    address: zod_1.z.string().nullable(),
    createdAt: zod_1.z.string(),
});
exports.RoomSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    homeId: zod_1.z.string().uuid(),
    name: zod_1.z.string().min(1),
    roomType: zod_1.z.string().nullable(),
    createdAt: zod_1.z.string(),
});
exports.ItemSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    roomId: zod_1.z.string().uuid(),
    name: zod_1.z.string().min(1),
    category: zod_1.z.string().nullable(),
    brand: zod_1.z.string().nullable(),
    model: zod_1.z.string().nullable(),
    serialNumber: zod_1.z.string().nullable(),
    purchaseDate: zod_1.z.string().nullable(),
    purchasePrice: zod_1.z.number().nullable(),
    notes: zod_1.z.string().nullable(),
    status: exports.ItemStatus,
    createdAt: zod_1.z.string(),
    updatedAt: zod_1.z.string(),
});
exports.DocumentSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    itemId: zod_1.z.string().uuid(),
    fileType: zod_1.z.string(),
    docType: exports.DocType,
    storagePath: zod_1.z.string(),
    originalName: zod_1.z.string().nullable(),
    createdAt: zod_1.z.string(),
});
exports.ExportJobSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    userId: zod_1.z.string().uuid(),
    homeId: zod_1.z.string().uuid().nullable(),
    status: exports.ExportStatus,
    format: zod_1.z.string(),
    storagePath: zod_1.z.string().nullable(),
    expiresAt: zod_1.z.string().nullable(),
    createdAt: zod_1.z.string(),
});
// === Input Schemas (for creation/updates) ===
exports.CreateHomeInput = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Home name is required'),
    address: zod_1.z.string().optional(),
});
exports.CreateRoomInput = zod_1.z.object({
    homeId: zod_1.z.string().uuid(),
    name: zod_1.z.string().min(1, 'Room name is required'),
    roomType: zod_1.z.string().optional(),
});
exports.CreateItemInput = zod_1.z.object({
    roomId: zod_1.z.string().uuid(),
    name: zod_1.z.string().min(1, 'Item name is required'),
    category: zod_1.z.string().optional(),
    brand: zod_1.z.string().optional(),
    model: zod_1.z.string().optional(),
    serialNumber: zod_1.z.string().optional(),
    purchaseDate: zod_1.z.string().optional(),
    purchasePrice: zod_1.z.number().optional(),
    notes: zod_1.z.string().optional(),
});
exports.UpdateItemInput = exports.CreateItemInput.partial().omit({ roomId: true });
