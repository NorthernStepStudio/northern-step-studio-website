import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkReports() {
    const reports = await prisma.bugReport.findMany({
        include: {
            user: {
                select: {
                    username: true,
                    email: true,
                }
            }
        },
        orderBy: { createdAt: 'desc' },
    });

    console.log(`Total bug reports in database: ${reports.length}\n`);

    reports.forEach((report, i) => {
        console.log(`${i + 1}. [${report.category}] ${report.description.substring(0, 50)}...`);
        console.log(`   Submitted by: ${report.user?.username || 'Anonymous'} (${report.user?.email || 'no email'})`);
        console.log(`   Created: ${report.createdAt}`);
        console.log('');
    });
}

checkReports()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
