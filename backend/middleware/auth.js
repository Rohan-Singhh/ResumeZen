const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  // Get token from header
  const token = req.header('x-auth-token');

  // Check if no token
  if (!token) {
    return res.status(401).json({ error: 'No token, authorization denied' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Add user data to request
    req.user = {
      userId: decoded.userId,
      firebaseUID: decoded.firebaseUID
    };
    
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token is not valid' });
  }
}; 