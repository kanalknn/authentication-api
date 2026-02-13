const adminModel = require('../../models/admin.model');
const { validateEmail, validatePassword } = require('../../utilities/validators');

const login = async (email, password) => {
  if (!validateEmail(email)) {
    throw new Error('Invalid email format');
  }

  if (!validatePassword(password)) {
    throw new Error('Password must be at least 6 characters');
  }

  const admin = await adminModel.findAdminByEmail(email);
  if (!admin) {
    throw new Error('Admin not found');
  }

  const isPasswordValid = await adminModel.verifyAdminPassword(admin, password);
  if (!isPasswordValid) {
    throw new Error('Invalid password');
  }

  return admin;
};

module.exports = { login };