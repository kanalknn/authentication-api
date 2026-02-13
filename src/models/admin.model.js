const prisma = require('../config/database');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const passwordHashRounds = parseInt(process.env.PASSWORD_HASH_ROUNDS) || 10;

const findAdminByEmail = async (email) => {
  return await prisma.admin.findUnique({ where: { email } });
};

const createAdmin = async (email, password, role = 'admin') => {
  const hashedPassword = await bcrypt.hash(password, passwordHashRounds);
  return await prisma.admin.create({
    data: { email, password: hashedPassword, role }
  });
};

const updateAdminRole = async (id, role) => {
  return await prisma.admin.update({
    where: { id },
    data: { role }
  });
};

const verifyAdminPassword = async (admin, password) => {
  return await bcrypt.compare(password, admin.password);
};

module.exports = {
  findAdminByEmail,
  createAdmin,
  updateAdminRole,
  verifyAdminPassword
};