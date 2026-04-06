import { create } from 'zustand';
import { Alert } from 'react-native';
import { itemsRepo, LocalItem, Home as DBHome } from '../db/repositories/itemsRepo';
import { activitiesRepo, Activity } from '../db/repositories/activitiesRepo';
import { maintenanceTasksRepo, MaintenanceTask } from '../db/repositories/maintenanceTasksRepo';
import { maintenanceAutopilot } from '../lib/maintenanceAutopilot';
import { careAiService, AiTaskSuggestion } from '../services/careAiService';
import { useAuthStore } from './authStore';

export interface Home extends DBHome {
    itemCount: number;
    roomCount: number;
    totalValue: number;
}

export interface Room {
    id: string;
    name: string;
    icon: string;
    itemCount: number;
    parentId?: string;
    homeId?: string;
    orderIndex: number;
}

export interface InventoryItem extends LocalItem {
    photos: string[]; // Keep frontend consistent
}

interface InventoryState {
    homes: Home[];
    activeHomeId: string | null;
    rooms: Room[];
    items: InventoryItem[];
    activities: Activity[];
    maintenanceTasks: MaintenanceTask[];
    aiInsights: Record<string, AiTaskSuggestion[]>; // itemId -> suggestions
    loading: boolean;
    initialized: boolean;
    error: string | null;
    capturedPhotos: string[]; // Photos taken during scans but not yet saved to items

    fetchInventory: () => Promise<void>;

    // Home Management
    setActiveHome: (id: string) => void;
    addHome: (name: string, address?: string, templateType?: 'basic' | 'advanced' | 'empty') => Promise<void>;
    updateHome: (id: string, updates: Partial<DBHome>) => Promise<void>;
    deleteHome: (id: string) => Promise<void>;

    // Room Management
    addRoom: (name: string, icon: string, parentId?: string, homeId?: string) => Promise<Room>;
    updateRoom: (id: string, updates: Partial<Room>) => Promise<void>;
    reorderRooms: (homeId: string, orderedIds: string[]) => Promise<void>;
    deleteRoom: (id: string) => Promise<void>;

    // Item Management
    addItem: (item: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt' | 'localOnly' | 'dirty' | 'version'>) => Promise<LocalItem>;
    updateItem: (id: string, updates: Partial<InventoryItem>) => Promise<void>;
    deleteItem: (id: string) => Promise<void>;

    // Maintenance Management
    addMaintenanceTask: (task: Partial<MaintenanceTask>) => Promise<void>;
    updateMaintenanceTask: (id: string, updates: Partial<MaintenanceTask>) => Promise<void>;
    deleteMaintenanceTask: (id: string) => Promise<void>;
    bulkUpdateMaintenanceTasks: (ids: string[], updates: Partial<MaintenanceTask>) => Promise<void>;
    bulkDeleteMaintenanceTasks: (ids: string[]) => Promise<void>;
    bulkDeleteItems: (ids: string[]) => Promise<void>;
    bulkMarkItemsAsClean: (ids: string[]) => Promise<void>;
    applyAutopilot: (itemId: string) => Promise<void>;
    dismissAiInsight: (itemId: string, index: number) => void;

    // Photo Buffer
    addCapturedPhoto: (uri: string) => void;
    removeCapturedPhoto: (uri: string) => void;
    clearCapturedPhotos: () => void;

    setupInventoryTemplate: (type: 'basic' | 'advanced', homeId?: string) => Promise<void>;
    seedCareDemo: () => Promise<void>;

    // Helpers
    getChildRooms: (parentId: string) => Room[];
    getParentRooms: () => Room[];
    getItemsByRoom: (roomId: string) => InventoryItem[];
    getAllPhotos: () => { uri: string, itemId: string, itemName: string }[];
}

export const useInventoryStore = create<InventoryState>((set, get) => ({
    homes: [],
    activeHomeId: null,
    rooms: [],
    items: [],
    activities: [],
    maintenanceTasks: [],
    aiInsights: {},
    loading: false,
    initialized: false,
    error: null,
    capturedPhotos: [],

    fetchInventory: async () => {
        set({ loading: true, error: null });
        try {
            console.log('Fetching inventory data...');

            // 1. Fetch Homes
            console.log('Fetching homes...');
            const homesData = await itemsRepo.listHomes();
            console.log('Fetched homes:', homesData.length);

            // 2. Fetch Rooms
            console.log('Fetching rooms...');
            const roomsData = await itemsRepo.listRooms();
            console.log('Fetched rooms:', roomsData.length);

            // 3. Fetch Items
            console.log('Fetching items...');
            const itemsData = await itemsRepo.listItems();
            console.log('Fetched items:', itemsData.length);

            // 4. Fetch Media
            console.log('Fetching media...');
            const mediaData = await itemsRepo.getAllMedia();
            console.log('Fetched media:', mediaData.length);

            // 5. Optimize Media Mapping (O(N) instead of O(N*M))
            const mediaMap = new Map<string, string[]>();
            mediaData.forEach(m => {
                if (!mediaMap.has(m.itemId)) {
                    mediaMap.set(m.itemId, []);
                }
                mediaMap.get(m.itemId)?.push(m.uri);
            });

            // Map Items with Photos
            const mappedItems: InventoryItem[] = itemsData.map((i) => ({
                ...i,
                photos: mediaMap.get(i.id) || []
            }));

            // Map Rooms
            const mappedRooms: Room[] = roomsData.map((r) => ({
                id: r.id,
                name: r.name,
                icon: r.icon,
                parentId: r.parentId,
                homeId: r.homeId,
                orderIndex: r.orderIndex || 0,
                itemCount: mappedItems.filter(i => i.roomId === r.id).length
            }));

            // Map Homes
            const mappedHomes: Home[] = homesData.map(h => ({
                ...h,
                roomCount: mappedRooms.filter(r => r.homeId === h.id).length,
                itemCount: mappedItems.filter(i => i.homeId === h.id).length,
                totalValue: mappedItems.filter(i => i.homeId === h.id).reduce((sum, i) => sum + (Number(i.purchasePrice) || 0), 0)
            }));

            // Auto-select active home if none
            let activeId = get().activeHomeId;
            if (!activeId && mappedHomes.length > 0) {
                activeId = mappedHomes[0].id;
            }

            // 4b. Fetch Maintenance Tasks
            console.log('Fetching maintenance tasks...');
            const maintenanceData = await maintenanceTasksRepo.listTasks(activeId || undefined);
            console.log('Fetched maintenance tasks:', maintenanceData.length);

            // 6. Fetch Activities
            let activitiesData: Activity[] = [];
            if (activeId) {
                console.log('Fetching activities...');
                activitiesData = await activitiesRepo.listRecentActivities(activeId, 5);
                console.log('Fetched activities:', activitiesData.length);
            }

            set({
                homes: mappedHomes,
                activeHomeId: activeId,
                rooms: mappedRooms,
                items: mappedItems,
                activities: activitiesData,
                maintenanceTasks: maintenanceData,
                loading: false,
                initialized: true
            });
            console.log('Inventory store updated successfully');

        } catch (error: any) {
            console.error('Fetch Inventory Error:', error);
            set({ error: error.message, loading: false });
        }
    },

    setActiveHome: (id) => {
        set({ activeHomeId: id });
        get().fetchInventory();
    },

    addHome: async (name, address, templateType = 'empty') => {
        try {
            const home = await itemsRepo.createHome({ name, address });

            // Apply template if requested
            if (templateType && templateType !== 'empty') {
                console.log(`[Inventory] Applying ${templateType} template to new home: ${home.id}`);
                await get().setupInventoryTemplate(templateType, home.id);
            }

            await activitiesRepo.logActivity({
                type: 'home_added',
                title: `Added home: ${name}`,
                homeId: home.id
            });

            await get().fetchInventory();
        } catch (error: any) { console.error(error); throw error; }
    },

    updateHome: async (id, updates) => {
        try {
            await itemsRepo.updateHome(id, updates);
            await get().fetchInventory();
        } catch (error: any) { console.error(error); throw error; }
    },

    deleteHome: async (id) => {
        try {
            await itemsRepo.deleteHome(id);
            await get().fetchInventory();
        } catch (error: any) { console.error(error); throw error; }
    },

    addRoom: async (name, icon, parentId, homeId) => {
        try {
            const hId = homeId || get().activeHomeId || 'default-home';
            const newRoom = await itemsRepo.createRoom({
                name,
                icon,
                parentId,
                homeId: hId,
                orderIndex: get().rooms.filter(r => r.homeId === hId).length
            });

            await activitiesRepo.logActivity({
                type: 'room_added',
                title: `Added room: ${name}`,
                homeId: hId
            });

            await get().fetchInventory();
            return newRoom;
        } catch (error: any) {
            console.error('Add Room Error:', error);
            throw error;
        }
    },

    updateRoom: async (id, updates) => {
        try {
            await itemsRepo.updateRoom(id, {
                name: updates.name,
                parentId: updates.parentId,
                icon: updates.icon,
                orderIndex: updates.orderIndex
            });
            get().fetchInventory();
        } catch (error: any) { console.error(error); throw error; }
    },

    reorderRooms: async (homeId, orderedIds) => {
        try {
            for (let i = 0; i < orderedIds.length; i++) {
                await itemsRepo.updateRoom(orderedIds[i], { orderIndex: i });
            }
            get().fetchInventory();
        } catch (error: any) { console.error(error); throw error; }
    },

    deleteRoom: async (id) => {
        try {
            const room = get().rooms.find(r => r.id === id);
            const hId = room?.homeId || get().activeHomeId || '';
            await itemsRepo.deleteRoom(id);

            if (room) {
                await activitiesRepo.logActivity({
                    type: 'room_deleted',
                    title: `Deleted room: ${room.name}`,
                    homeId: hId
                });
            }

            get().fetchInventory();
        } catch (error: any) { console.error(error); throw error; }
    },

    addItem: async (item) => {
        try {
            const hId = item.homeId || get().activeHomeId || 'default-home';
            const newItem = await itemsRepo.createItem({
                name: item.name,
                description: item.description,
                roomId: item.roomId,
                homeId: hId,
                purchasePrice: item.purchasePrice,
                purchaseDate: item.purchaseDate,
                quantity: item.quantity,
                notes: item.notes,
                category: item.category,
                photos: item.photos
            });

            await activitiesRepo.logActivity({
                type: 'item_added',
                title: `Added item: ${item.name}`,
                subtitle: item.category,
                homeId: hId
            });

            await get().fetchInventory();
            return newItem;
        } catch (error: any) { console.error(error); throw error; }
    },

    addMaintenanceTask: async (task) => {
        try {
            await maintenanceTasksRepo.createTask(task);
            get().fetchInventory();
        } catch (error: any) { console.error(error); throw error; }
    },

    updateMaintenanceTask: async (id, updates) => {
        try {
            await maintenanceTasksRepo.updateTask(id, updates);

            // AUTO-RESCHEDULING LOGIC
            if (updates.isCompleted === 1) {
                const task = get().maintenanceTasks.find(t => t.id === id);
                if (task && task.frequencyDays && task.frequencyDays > 0) {
                    console.log(`[Care Autopilot] Rescheduling recurring task: ${task.title}`);
                    const nextDueDate = new Date();
                    nextDueDate.setDate(nextDueDate.getDate() + task.frequencyDays);

                    await maintenanceTasksRepo.createTask({
                        itemId: task.itemId,
                        title: task.title,
                        description: task.description,
                        frequencyDays: task.frequencyDays,
                        dueDate: nextDueDate.toISOString(),
                        homeId: task.homeId
                    });
                }
            }

            await get().fetchInventory();
        } catch (error: any) { console.error(error); throw error; }
    },

    deleteMaintenanceTask: async (id) => {
        try {
            await maintenanceTasksRepo.deleteTask(id);
            get().fetchInventory();
        } catch (error: any) { console.error(error); throw error; }
    },

    bulkUpdateMaintenanceTasks: async (ids, updates) => {
        try {
            for (const id of ids) {
                await maintenanceTasksRepo.updateTask(id, updates);
                // Also handle individual rescheduling if completed
                if (updates.isCompleted === 1) {
                    const task = get().maintenanceTasks.find(t => t.id === id);
                    if (task && task.frequencyDays && task.frequencyDays > 0) {
                        const nextDueDate = new Date();
                        nextDueDate.setDate(nextDueDate.getDate() + task.frequencyDays);
                        await maintenanceTasksRepo.createTask({
                            itemId: task.itemId,
                            title: task.title,
                            description: task.description,
                            frequencyDays: task.frequencyDays,
                            dueDate: nextDueDate.toISOString(),
                            homeId: task.homeId
                        });
                    }
                }
            }
            await get().fetchInventory();
        } catch (error: any) { console.error(error); throw error; }
    },

    bulkDeleteMaintenanceTasks: async (ids) => {
        try {
            for (const id of ids) {
                await maintenanceTasksRepo.deleteTask(id);
            }
            await get().fetchInventory();
        } catch (error: any) { console.error(error); throw error; }
    },

    bulkDeleteItems: async (ids) => {
        try {
            for (const id of ids) {
                await itemsRepo.softDeleteItem(id);
            }
            await get().fetchInventory();
        } catch (error: any) { console.error(error); throw error; }
    },

    bulkMarkItemsAsClean: async (ids) => {
        try {
            await itemsRepo.markAsClean(ids, 'item');
            await get().fetchInventory();
        } catch (error: any) { console.error(error); throw error; }
    },

    applyAutopilot: async (itemId) => {
        try {
            const item = get().items.find(i => i.id === itemId);
            if (!item) return;

            const category = item.category || 'Other';
            const subCategory = maintenanceAutopilot.detectSubCategory(item.name, category);

            const blueprints = maintenanceAutopilot.getSuggestedTasks(subCategory);

            if (blueprints.length > 0) {
                console.log(`[Autopilot] Applying ${blueprints.length} tasks for item: ${item.name}`);
                for (const bp of blueprints) {
                    const dueDate = new Date();
                    dueDate.setDate(dueDate.getDate() + bp.frequencyDays);

                    await maintenanceTasksRepo.createTask({
                        itemId: item.id,
                        title: bp.title,
                        description: bp.description,
                        frequencyDays: bp.frequencyDays,
                        dueDate: dueDate.toISOString(),
                        homeId: item.homeId
                    });
                }

                await activitiesRepo.logActivity({
                    type: 'autopilot_engaged',
                    title: `Autopilot: Added ${blueprints.length} tasks`,
                    subtitle: `For ${item.name}`,
                    homeId: item.homeId || 'default-home'
                });

                get().fetchInventory();
            }
        } catch (error: any) { console.error('Autopilot error:', error); }
    },

    dismissAiInsight: (itemId, index) => {
        set(state => {
            const insights = state.aiInsights[itemId] || [];
            if (!insights[index]) return state;

            const newInsights = [...insights];
            newInsights.splice(index, 1);

            const newAiInsights = { ...state.aiInsights };
            if (newInsights.length === 0) {
                delete newAiInsights[itemId];
            } else {
                newAiInsights[itemId] = newInsights;
            }

            return { aiInsights: newAiInsights };
        });
    },

    deleteItem: async (id) => {
        try {
            const item = get().items.find(i => i.id === id);
            const hId = item?.homeId || get().activeHomeId || '';
            await itemsRepo.softDeleteItem(id);

            if (item) {
                await activitiesRepo.logActivity({
                    type: 'item_deleted',
                    title: `Deleted item: ${item.name}`,
                    homeId: hId
                });
            }

            get().fetchInventory();
        } catch (error: any) { console.error(error); throw error; }
    },

    updateItem: async (id, updates) => {
        try {
            // Update the item in the database
            await itemsRepo.updateItem(id, updates);

            // Handle photo updates separately if provided
            if (updates.photos) {
                // Get existing photos
                const existingPhotos = await itemsRepo.getMediaForItem(id);

                // Add new photos that aren't already stored
                for (const photoUri of updates.photos) {
                    if (!existingPhotos.includes(photoUri)) {
                        await itemsRepo.addMedia(id, photoUri);
                    }
                }
                // Note: We're not removing old photos to preserve history
            }

            get().fetchInventory();
        } catch (error: any) {
            console.error('Update item error:', error);
            throw error;
        }
    },

    setupInventoryTemplate: async (type, forcedHomeId) => {
        set({ loading: true });
        try {
            const basicRooms = [
                { name: 'Kitchen', icon: 'stove' },
                { name: 'Living Room', icon: 'sofa-outline' },
                { name: 'Master Bedroom', icon: 'bed-outline' },
                { name: 'Bathroom', icon: 'shower-outline' },
            ];

            const advancedRooms = [
                { name: 'Foyer', icon: 'door-open' },
                { name: 'Kitchen', icon: 'stove' },
                { name: 'Dining Room', icon: 'table-chair' },
                { name: 'Living Room', icon: 'sofa-outline' },
                { name: 'Family Room', icon: 'television-classic' },
                { name: 'Office', icon: 'briefcase-outline' },
                { name: 'Master Bedroom', icon: 'bed-outline' },
                { name: 'Kids Room', icon: 'baby-face-outline' },
                { name: 'Guest Room', icon: 'account-group-outline' },
                { name: 'Bathroom 1', icon: 'shower-outline' },
                { name: 'Bathroom 2', icon: 'bathtub-outline' },
                { name: 'Garage', icon: 'garage-variant' },
                { name: 'Basement', icon: 'stairs' },
                { name: 'Laundry', icon: 'washing-machine' },
            ];

            const roomsToCreate = type === 'basic' ? basicRooms : advancedRooms;
            const homeId = forcedHomeId || get().activeHomeId || 'default-home';

            // Sample items to help new users understand the app
            const sampleItems: Record<string, Array<{
                name: string; description: string; category: string;
                purchasePrice: number; notes?: string; serialNumber?: string;
            }>> = {
                'Kitchen': [
                    {
                        name: '📌 Example: Samsung Refrigerator RF28R7551SR',
                        description: 'French door, 28 cu.ft., stainless steel with ice maker.',
                        category: 'Appliances',
                        purchasePrice: 1899,
                        serialNumber: 'RF28-EXAMPLE',
                        notes: '📌 This is a sample item — edit or delete me! Add your own items with photos, purchase prices & serial numbers for best claim coverage.'
                    },
                    {
                        name: '📌 Example: KitchenAid Stand Mixer',
                        description: 'Artisan series, 5-quart, Empire Red. Model KSM150PSER.',
                        category: 'Appliances',
                        purchasePrice: 379,
                        notes: '💡 Tip: Add a photo of the item AND documentation of its value for best claim coverage.'
                    },
                    {
                        name: '📌 Example: Breville Espresso Machine',
                        description: 'Barista Express, brushed stainless steel. Includes grinder.',
                        category: 'Appliances',
                        purchasePrice: 699,
                        serialNumber: 'BES870-EXAMPLE',
                        notes: '💡 Tip: Use the camera scan to auto-detect item details with AI!'
                    },
                ],
                'Living Room': [
                    {
                        name: '📌 Example: Samsung 65" QLED TV',
                        description: '4K Smart TV, wall-mounted. Serial number on back label.',
                        category: 'Electronics',
                        purchasePrice: 1299,
                        serialNumber: 'QN65-EXAMPLE',
                        notes: '💡 Tip: Always include serial numbers for electronics — check the back or bottom of the device. Documentation of the purchase price is also critical.'
                    },
                    {
                        name: '📌 Example: West Elm Harmony Sofa',
                        description: '92" sofa, performance velvet in Ink Blue.',
                        category: 'Furniture',
                        purchasePrice: 1799,
                        notes: '💡 Tip: For furniture, note the brand, material, and color.'
                    },
                    {
                        name: '📌 Example: Sonos Arc Soundbar',
                        description: 'Premium smart soundbar, Dolby Atmos. Wall-mounted.',
                        category: 'Electronics',
                        purchasePrice: 899,
                        serialNumber: 'ARC-EXAMPLE',
                        notes: '💡 Tip: Group related items in the same room for easier tracking.'
                    },
                ],
                'Master Bedroom': [
                    {
                        name: '📌 Example: Casper Queen Mattress',
                        description: 'Queen size, 12" foam mattress with foundation.',
                        category: 'Furniture',
                        purchasePrice: 1095,
                        notes: '💡 Tip: Don\'t forget bedding, nightstands, and lamps — small items add up fast!'
                    },
                    {
                        name: '📌 Example: Apple MacBook Pro 14"',
                        description: 'M3 Pro chip, 18GB RAM, 512GB SSD. Space Black.',
                        category: 'Electronics',
                        purchasePrice: 1999,
                        serialNumber: 'MBP14-EXAMPLE',
                        notes: '💡 Tip: Laptops and personal electronics are often the most valuable items in a room.'
                    },
                    {
                        name: '📌 Example: Dyson Purifier Cool TP07',
                        description: 'Air purifier + fan combo. HEPA filter, WiFi connected.',
                        category: 'Appliances',
                        purchasePrice: 569,
                        notes: '💡 Tip: Include model numbers to make insurance claims faster.'
                    },
                ],
                'Bathroom': [
                    {
                        name: '📌 Example: Dyson Hair Dryer HD08',
                        description: 'Supersonic, includes styling attachments and case.',
                        category: 'Personal Care',
                        purchasePrice: 429,
                        serialNumber: 'HD08-EXAMPLE',
                        notes: '💡 Tip: Scan items with the camera for instant AI identification and price estimates!'
                    },
                    {
                        name: '📌 Example: Toto Washlet Bidet Seat',
                        description: 'Electronic bidet, heated seat, model C5.',
                        category: 'Fixtures',
                        purchasePrice: 398,
                        notes: '💡 Tip: Fixed installations and fixtures count — they\'re expensive to replace!'
                    },
                    {
                        name: '📌 Example: Oral-B iO Series 9',
                        description: 'Electric toothbrush with AI tracking, travel case included.',
                        category: 'Personal Care',
                        purchasePrice: 249,
                        notes: '💡 Tip: Small electronics are often overlooked but expensive to replace.'
                    },
                ],
            };

            for (const room of roomsToCreate) {
                const createdRoom = await itemsRepo.createRoom({
                    name: room.name,
                    icon: room.icon,
                    homeId: homeId
                });

                // Seed sample items for basic template
                if (type === 'basic' && sampleItems[room.name]) {
                    for (const item of sampleItems[room.name]) {
                        await itemsRepo.createItem({
                            ...item,
                            roomId: createdRoom.id,
                            homeId: homeId,
                            quantity: 1,
                        });
                    }
                }
            }

            await get().fetchInventory();
        } catch (error: any) {
            console.error('Template Setup Error:', error);
            set({ error: error.message });
        } finally {
            set({ loading: false });
        }
    },

    // Getters
    getChildRooms: (parentId) => get().rooms.filter(r => r.parentId === parentId),
    getParentRooms: () => get().rooms.filter(r => !r.parentId && r.homeId === get().activeHomeId),
    getItemsByRoom: (roomId) => get().items.filter(i => i.roomId === roomId),
    getAllPhotos: () => {
        const photos: { uri: string, itemId: string, itemName: string }[] = [];
        get().items.forEach(item => {
            item.photos.forEach(uri => {
                photos.push({ uri, itemId: item.id, itemName: item.name });
            });
        });
        // Sort by most recent items first (optional but nice)
        return photos.reverse();
    },

    addCapturedPhoto: (uri) => {
        const current = get().capturedPhotos;
        if (!current.includes(uri)) {
            set({ capturedPhotos: [uri, ...current].slice(0, 20) }); // Keep last 20
        }
    },

    removeCapturedPhoto: (uri) => {
        set({ capturedPhotos: get().capturedPhotos.filter(p => p !== uri) });
    },

    clearCapturedPhotos: () => {
        set({ capturedPhotos: [] });
    },

    seedCareDemo: async () => {
        set({ loading: true });
        try {
            const homeId = get().activeHomeId || 'default-home';

            // 1. Find or Create a Demo Room
            let kitchen = get().rooms.find(r => r.name === 'Kitchen' && r.homeId === homeId);
            if (!kitchen) {
                kitchen = await get().addRoom('Kitchen', 'stove', undefined, homeId);
            }
            const roomId = kitchen?.id;

            // 2. Create sample items
            const sampleItems = [
                {
                    name: 'Samsung Family Hub Refrigerator',
                    category: 'Appliances',
                    description: 'Smart fridge with touchscreen.',
                    purchasePrice: 2499,
                    warrantyExpiry: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days from now
                    photos: []
                },
                {
                    name: 'Carrier Infinity HVAC System',
                    category: 'HVAC',
                    description: 'High-efficiency central air.',
                    purchasePrice: 5200,
                    photos: []
                }
            ];

            for (const item of sampleItems) {
                const newItem = await get().addItem({
                    ...item,
                    roomId,
                    homeId,
                    quantity: 1
                });

                // 3. Trigger autopilot for each
                if (newItem) {
                    await get().applyAutopilot(newItem.id);
                }
            }

            // No need for final fetchInventory as addItem/applyAutopilot already do it
            Alert.alert('Care Demo Active', 'Sample items and maintenance tasks have been added to your Kitchen.');
        } catch (error: any) {
            console.error('Seed Demo Error:', error);
            throw error;
        } finally {
            set({ loading: false });
        }
    },
}));
