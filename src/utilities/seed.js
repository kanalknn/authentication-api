const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const prisma = new PrismaClient();
const passwordHashRounds = parseInt(process.env.PASSWORD_HASH_ROUNDS) || 10;

const seedAdmins = async () => {
  if (process.env.ADMIN_SEED_ENABLED !== 'true') {
    console.log('Admin seeding is disabled');
    return;
  }

  try {
    if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
      throw new Error('Admin credentials not configured');
    }

    await prisma.admin.upsert({
      where: { email: process.env.ADMIN_EMAIL },
      update: {
        password: await bcrypt.hash(process.env.ADMIN_PASSWORD, passwordHashRounds),
        role: 'admin'
      },
      create: {
        email: process.env.ADMIN_EMAIL,
        password: await bcrypt.hash(process.env.ADMIN_PASSWORD, passwordHashRounds),
        role: 'admin'
      }
    });

    console.log(`Admin ${process.env.ADMIN_EMAIL} seeded successfully`);
  } catch (error) {
    console.error('Error seeding admin:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
};

seedAdmins();