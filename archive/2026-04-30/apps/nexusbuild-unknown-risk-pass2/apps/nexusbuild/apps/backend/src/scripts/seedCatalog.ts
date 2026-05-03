import { PrismaClient } from '@prisma/client';
import { ALL_PARTS } from '../data/index';

const prisma = new PrismaClient();

async function main() {
    console.log('[SeedCatalog] Starting part synchronization...');
    
    // 1. Find or create a system admin user to own the catalog
    let admin = await prisma.user.findFirst({
        where: { isAdmin: true }
    });
    
    if (!admin) {
        console.log('[SeedCatalog] No admin found. Creating a temporary system account...');
        admin = await prisma.user.create({
            data: {
                username: 'SystemCatalog',
                email: 'catalog@nexusbuild.app',
                passwordHash: 'REDACTED_SYSTEM_ONLY',
                isAdmin: true
            }
        });
    }
    
    // 2. Find or create a "Global Catalog" build
    let catalogBuild = await prisma.build.findFirst({
        where: { 
            userId: admin.id,
            name: 'OFFICIAL_GLOBAL_CATALOG'
        }
    });
    
    if (!catalogBuild) {
        console.log('[SeedCatalog] Creating official global catalog build...');
        catalogBuild = await prisma.build.create({
            data: {
                userId: admin.id,
                name: 'OFFICIAL_GLOBAL_CATALOG',
                description: 'This build contains all parts from the hardcoded database to expose them to the Admin Console.',
                totalPrice: 0,
                isPublic: false
            }
        });
    }
    
    console.log(`[SeedCatalog] Sycing ${ALL_PARTS.length} parts to the database...`);
    
    // 3. Upsert parts
    let addedCount = 0;
    let updatedCount = 0;
    
    for (const part of ALL_PARTS) {
        const existing = await prisma.part.findFirst({
            where: {
                buildId: catalogBuild.id,
                name: part.name
            }
        });
        
        if (existing) {
            await prisma.part.update({
                where: { id: existing.id },
                data: {
                    price: part.price,
                    category: part.category,
                    specifications: part.specs as any
                }
            });
            updatedCount++;
        } else {
            await prisma.part.create({
                data: {
                    buildId: catalogBuild.id,
                    name: part.name,
                    category: part.category,
                    price: part.price,
                    specifications: part.specs as any
                }
            });
            addedCount++;
        }
    }
    
    // 4. Update catalog build price
    const totalCatalogPrice = ALL_PARTS.reduce((sum, p) => sum + p.price, 0);
    await prisma.build.update({
        where: { id: catalogBuild.id },
        data: { totalPrice: totalCatalogPrice }
    });
    
    console.log(`[SeedCatalog] Complete! Added: ${addedCount}, Updated: ${updatedCount}`);
    console.log(`[SeedCatalog] Total parts in DB: ${await prisma.part.count()}`);
}

main()
    .catch((e) => {
        console.error('[SeedCatalog] Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
