import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function promoteAdmin() {
    const result = await prisma.user.updateMany({
        where: { email: 'admin@nexusbuild.app' },
        data: {
            isAdmin: true,
            isModerator: true,
            bio: 'NexusBuild Administrator',
        },
    });

    console.log(`✅ Updated ${result.count} user(s) to admin`);

    const user = await prisma.user.findUnique({
        where: { email: 'admin@nexusbuild.app' },
    });

    console.log('User status:', {
        email: user?.email,
        username: user?.username,
        isAdmin: user?.isAdmin,
        isModerator: user?.isModerator,
    });
}

promoteAdmin()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
