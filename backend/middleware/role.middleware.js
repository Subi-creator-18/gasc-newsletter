const { errorResponse } = require('../utils/response');

// Parameterized role check — one function used by all routes
const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) return errorResponse(res, 'Not authenticated', 401);
  if (!roles.includes(req.user.role)) {
    return errorResponse(res, `Access denied. Required role: ${roles.join(' or ')}`, 403);
  }
  next();
};

module.exports = requireRole;
