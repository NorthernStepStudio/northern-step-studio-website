import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUsers() {
    const users = await prisma.user.findMany({
        select: {
            id: true,
            email: true,
            username: true,
            isAdmin: true,
            isModerator: true,
            createdAt: true,
        },
    });

    console.log('All users in database:');
    console.log(JSON.stringify(users, null, 2));
    console.log(`\nTotal users: ${users.length}`);
}

checkUsers()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
