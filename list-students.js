const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const students = await prisma.student.findMany();
        console.log(JSON.stringify(students, null, 2));
    } catch (e) {
        console.error('Failed to list students:', e.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
