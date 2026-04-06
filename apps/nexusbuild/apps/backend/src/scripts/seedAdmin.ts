import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const readPasswordArg = () => {
    const arg = process.argv.find((value) => value.startsWith('--password='));
    return arg ? arg.slice('--password='.length) : null;
};

async function main() {
    console.log('Seeding admin account...');

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@nexusbuild.app';
    const adminPassword = process.env.NEXUSBUILD_ADMIN_PASSWORD || readPasswordArg();
    const adminUsername = process.env.NEXUSBUILD_ADMIN_USERNAME || 'NexusAdmin';

    if (!adminPassword || adminPassword.trim().length < 12) {
        throw new Error('Provide a strong admin password with NEXUSBUILD_ADMIN_PASSWORD or --password=<value>.');
    }

    const existing = await prisma.user.findUnique({
        where: { email: adminEmail },
    });

    if (existing) {
        const passwordHash = await bcrypt.hash(adminPassword, 10);

        console.log('Admin account already exists');
        console.log('  Email:', existing.email);
        console.log('  Username:', existing.username);
        console.log('  Is Admin:', existing.isAdmin);

        await prisma.user.update({
            where: { id: existing.id },
            data: {
                username: adminUsername,
                passwordHash,
                isAdmin: true,
                isModerator: true,
                bio: existing.bio || 'NexusBuild Administrator',
                isPublicProfile: false,
            },
        });
        console.log('Updated existing user role and password.');
        return;
    }

    const passwordHash = await bcrypt.hash(adminPassword, 10);

    const admin = await prisma.user.create({
        data: {
            email: adminEmail,
            username: adminUsername,
            passwordHash,
            isAdmin: true,
            isModerator: true,
            bio: 'NexusBuild Administrator',
            isPublicProfile: false,
        },
    });

    console.log('Admin account created successfully.');
    console.log('  ID:', admin.id);
    console.log('  Email:', admin.email);
    console.log('  Username:', admin.username);
    console.log('Password was supplied through an environment variable or CLI argument and was not written to disk.');
}

main()
    .catch((error) => {
        console.error('Error seeding admin:', error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
