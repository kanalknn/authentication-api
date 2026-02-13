const prisma = require('../config/database');
const bcrypt = require('bcryptjs');

const findUserByEmail = async (email) => {
  return await prisma.user.findUnique({ where: { email } });
};

const findUserByGoogleId = async (googleId) => {
  return await prisma.user.findUnique({ where: { googleId } });
};

const createUserWithEmail = async (email, password, name) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  return await prisma.user.create({
    data: { 
      email, 
      name, 
      password: hashedPassword,
      isVerified: true // User is created only after OTP verification
    }
  });
};

const createUserWithGoogle = async (email, googleId, name) => {
  return await prisma.user.create({
    data: { 
      email, 
      googleId, 
      name, 
      isVerified: true // Google users are automatically verified
    }
  });
};

const verifyUserPassword = async (user, password) => {
  if (!user.password) return false;
  return await bcrypt.compare(password, user.password);
};

// Keep existing OTP functions for other use cases (like password reset)
const generateOTP = async (userId, expiryMinutes = 15) => {
  const otp = require('otp-generator').generate(6, {
    digits: true,
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false,
  });

  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + expiryMinutes);

  await prisma.user.update({
    where: { id: userId },
    data: {
      otp,
      otpExpiresAt: expiresAt,
    },
  });

  return otp;
};

const verifyOTP = async (userId, otp) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user || user.otp !== otp) {
    return { isValid: false, message: 'Invalid OTP' };
  }

  if (user.otpExpiresAt < new Date()) {
    return { isValid: false, message: 'OTP expired' };
  }

  // Clear OTP after successful verification
  await prisma.user.update({
    where: { id: userId },
    data: {
      otp: null,
      otpExpiresAt: null,
      isVerified: true,
    },
  });

  return { isValid: true };
};

module.exports = {
  findUserByEmail,
  findUserByGoogleId,
  createUserWithEmail,
  createUserWithGoogle,
  verifyUserPassword,
  generateOTP,
  verifyOTP
};