import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const readPasswordArg = () => {
    const arg = process.argv.find((value) => value.startsWith('--password='));
    return arg ? arg.slice('--password='.length) : null;
};

async function seedAdminUser() {
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@nexusbuild.app').toLowerCase();
    const adminUsername = process.env.NEXUSBUILD_ADMIN_USERNAME || 'NexusAdmin';
    const adminPassword = process.env.NEXUSBUILD_ADMIN_PASSWORD || readPasswordArg();

    if (!adminPassword) {
        console.log('[seed] Skipping admin seed: no password provided.');
        console.log('[seed] Provide NEXUSBUILD_ADMIN_PASSWORD or --password=<value> to seed admin credentials.');
        return;
    }

    if (adminPassword.trim().length < 12) {
        throw new Error('Admin password must be at least 12 characters.');
    }

    const passwordHash = await bcrypt.hash(adminPassword, 10);
    const existing = await prisma.user.findUnique({
        where: { email: adminEmail },
    });

    if (existing) {
        await prisma.user.update({
            where: { id: existing.id },
            data: {
                username: adminUsername,
                passwordHash,
                isAdmin: true,
                isModerator: true,
                isSuspended: false,
                bio: existing.bio || 'NexusBuild Administrator',
                isPublicProfile: false,
            },
        });
        console.log(`[seed] Updated admin user: ${adminEmail}`);
        return;
    }

    await prisma.user.create({
        data: {
            email: adminEmail,
            username: adminUsername,
            passwordHash,
            isAdmin: true,
            isModerator: true,
            isSuspended: false,
            bio: 'NexusBuild Administrator',
            isPublicProfile: false,
        },
    });

    console.log(`[seed] Created admin user: ${adminEmail}`);
}

async function main() {
    console.log('[seed] Starting seed process...');
    await seedAdminUser();
    console.log('[seed] Seed complete.');
}

main()
    .catch((error) => {
        console.error('[seed] Failed:', error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
