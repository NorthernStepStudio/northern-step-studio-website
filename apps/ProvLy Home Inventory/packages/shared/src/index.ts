import { z } from 'zod';

// === Enums ===
export const SubscriptionTier = z.enum(['free', 'plus', 'pro']);
export const ItemStatus = z.enum(['active', 'discarded', 'sold']);
export const DocType = z.enum(['receipt', 'warranty', 'manual', 'photo', 'other']);
export const ExportStatus = z.enum(['pending', 'processing', 'completed', 'failed', 'expired']);

// === Schemas ===
export const ProfileSchema = z.object({
  id: z.string().uuid(),
  fullName: z.string().nullable(),
  subscriptionTier: SubscriptionTier,
  aiEnabled: z.boolean(),
});

export const HomeSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  name: z.string().min(1),
  address: z.string().nullable(),
  createdAt: z.string(),
});

export const RoomSchema = z.object({
  id: z.string().uuid(),
  homeId: z.string().uuid(),
  name: z.string().min(1),
  roomType: z.string().nullable(),
  createdAt: z.string(),
});

export const ItemSchema = z.object({
  id: z.string().uuid(),
  roomId: z.string().uuid(),
  name: z.string().min(1),
  category: z.string().nullable(),
  brand: z.string().nullable(),
  model: z.string().nullable(),
  serialNumber: z.string().nullable(),
  purchaseDate: z.string().nullable(),
  purchasePrice: z.number().nullable(),
  notes: z.string().nullable(),
  status: ItemStatus,
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const DocumentSchema = z.object({
  id: z.string().uuid(),
  itemId: z.string().uuid(),
  fileType: z.string(),
  docType: DocType,
  storagePath: z.string(),
  originalName: z.string().nullable(),
  createdAt: z.string(),
});

export const ExportJobSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  homeId: z.string().uuid().nullable(),
  status: ExportStatus,
  format: z.string(),
  storagePath: z.string().nullable(),
  expiresAt: z.string().nullable(),
  createdAt: z.string(),
});

// === Input Schemas (for creation/updates) ===
export const CreateHomeInput = z.object({
  name: z.string().min(1, 'Home name is required'),
  address: z.string().optional(),
});

export const CreateRoomInput = z.object({
  homeId: z.string().uuid(),
  name: z.string().min(1, 'Room name is required'),
  roomType: z.string().optional(),
});

export const CreateItemInput = z.object({
  roomId: z.string().uuid(),
  name: z.string().min(1, 'Item name is required'),
  category: z.string().optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
  serialNumber: z.string().optional(),
  purchaseDate: z.string().optional(),
  purchasePrice: z.number().optional(),
  notes: z.string().optional(),
});

export const UpdateItemInput = CreateItemInput.partial().omit({ roomId: true });

// === Types ===
export type Profile = z.infer<typeof ProfileSchema>;
export type Home = z.infer<typeof HomeSchema>;
export type Room = z.infer<typeof RoomSchema>;
export type Item = z.infer<typeof ItemSchema>;
export type Document = z.infer<typeof DocumentSchema>;
export type ExportJob = z.infer<typeof ExportJobSchema>;
export type CreateHomeInputType = z.infer<typeof CreateHomeInput>;
export type CreateRoomInputType = z.infer<typeof CreateRoomInput>;
export type CreateItemInputType = z.infer<typeof CreateItemInput>;
export type UpdateItemInputType = z.infer<typeof UpdateItemInput>;
