const authenticate = require('./auth');

const adminAuth = (requiredRoles = ['admin']) => {
  return (req, res, next) => {
    authenticate(req, res, () => {
      const userRole = req.user.role?.toLowerCase();
      const allowedRoles = requiredRoles.map(role => role.toLowerCase());
      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({
          success: false,
          message: `Required roles: ${requiredRoles.join(', ')}`
        });
      }
      next();
    });
  };
};

module.exports = adminAuth;
