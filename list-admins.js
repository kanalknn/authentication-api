const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const admins = await prisma.admin.findMany();
        console.log(JSON.stringify(admins, null, 2));
    } catch (e) {
        console.error('Failed to list admins:', e.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
