const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const students = await prisma.student.findMany();
        console.log('Database connection successful');
        console.log('Students count:', students.length);
        if (students.length > 0) {
            console.log('Student fields:', Object.keys(students[0]));
        } else {
            console.log('No students found to check fields.');
        }
    } catch (e) {
        console.error('Database check failed:', e.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
