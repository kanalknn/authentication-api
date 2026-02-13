const { verifyToken } = require('../utilities/jwt');
const tokenModel = require('../models/token.model');

const authenticate = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  try {
    // Check if token is blacklisted
    const isBlacklisted = await tokenModel.isTokenBlacklisted(token);
    if (isBlacklisted) {
      return res.status(401).json({ success: false, message: 'Token has been invalidated' });
    }

    const decoded = verifyToken(token);
    console.log("Decoded JWT:", decoded);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

module.exports = authenticate;