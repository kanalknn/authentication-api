const tokenModel = require('../models/token.model');

const checkTokenBlacklist = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) return next();

  const isBlacklisted = await tokenModel.isTokenBlacklisted(token);
  if (isBlacklisted) {
    return res.status(401).json({ success: false, message: 'Token has been invalidated' });
  }

  next();
};

module.exports = checkTokenBlacklist;