import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function promoteUser() {
    const user = await prisma.user.update({
        where: { email: 'contact@nexusbuild.app' },
        data: {
            isAdmin: true,
            isModerator: true,
            bio: 'NexusBuild Administrator',
        },
    });

    console.log('✅ PROMOTED TO ADMIN:');
    console.log(`   Email: ${user.email}`);
    console.log(`   Username: ${user.username}`);
    console.log(`   isAdmin: ${user.isAdmin}`);
    console.log(`   isModerator: ${user.isModerator}`);
}

promoteUser()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
