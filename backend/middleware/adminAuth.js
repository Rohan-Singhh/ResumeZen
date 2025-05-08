const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('x-auth-token');
    
    // Check if no token
    if (!token) {
      return res.status(401).json({ error: 'No token, authorization denied' });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    // Check if user is admin
    if (!user.isAdmin) {
      return res.status(403).json({ error: 'Not authorized as admin' });
    }
    
    // Set user in request object
    req.user = {
      userId: decoded.userId,
      isAdmin: true
    };
    
    next();
  } catch (err) {
    console.error('Error in admin auth middleware:', err);
    res.status(401).json({ error: 'Token is not valid' });
  }
}; 