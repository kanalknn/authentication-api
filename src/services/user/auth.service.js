const userModel = require('../../models/user.model');
const { validateEmail, validatePassword } = require('../../utilities/validators');

const loginWithEmail = async (email, password) => {
  if (!validateEmail(email)) {
    throw new Error('Invalid email format');
  }

  if (!validatePassword(password)) {
    throw new Error('Password must be at least 6 characters');
  }

  const user = await userModel.findUserByEmail(email);
  if (!user) {
    throw new Error('User not found');
  }

  if (!user.password) {
    throw new Error('This account was created with Google. Please use Google login.');
  }

  const isPasswordValid = await userModel.verifyUserPassword(user, password);
  if (!isPasswordValid) {
    throw new Error('Invalid password');
  }

  return user;
};

const findOrCreateUserByGoogle = async (googleUser) => {
  const { email, sub: googleId } = googleUser;

  // Check if user exists with this googleId
  let user = await userModel.findUserByGoogleId(googleId);
  if (user) return user;

  // Check if email exists (user might have signed up with email/password)
  user = await userModel.findUserByEmail(email);
  if (user) {
    // Update existing user with googleId
    return await prisma.user.update({
      where: { id: user.id },
      data: { googleId }
    });
  }

  // Create new user with google auth
  return await userModel.createUserWithGoogle(email, googleId);
};

module.exports = {
  loginWithEmail,
  findOrCreateUserByGoogle
};