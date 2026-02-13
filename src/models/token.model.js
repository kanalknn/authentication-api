const prisma = require('../config/database');

const addToBlacklist = async (token, expiresAt) => {
  return await prisma.blacklistedToken.create({
    data: { token, expiresAt }
  });
};

const isTokenBlacklisted = async (token) => {
  const blacklisted = await prisma.blacklistedToken.findUnique({
    where: { token }
  });
  return !!blacklisted;
};

const clearExpiredTokens = async () => {
  return await prisma.blacklistedToken.deleteMany({
    where: { expiresAt: { lt: new Date() } }
  });
};

module.exports = {
  addToBlacklist,
  isTokenBlacklisted,
  clearExpiredTokens
};