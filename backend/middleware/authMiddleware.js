/**
 * Authentication Middleware
 * Verifies JWT tokens and adds authenticated user data to request
 */

const jwt = require('jsonwebtoken');

/**
 * JWT Authentication Middleware
 * Validates the JWT token from the request header and attaches user data to the request
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 */
const authMiddleware = (req, res, next) => {
  // Get token from header
  const token = req.header('x-auth-token');

  // Check if no token
  if (!token) {
    return res.status(401).json({ 
      success: false,
      message: 'Authentication required',
      error: 'No authentication token provided'
    });
  }

  try {
    // Verify token using the JWT secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Add authenticated user data to request object
    req.user = {
      userId: decoded.userId,
      firebaseUid: decoded.firebaseUid || decoded.firebaseUID  // Support both formats
    };
    
    // Continue to the next middleware or route handler
    next();
  } catch (err) {
    // Return error for invalid tokens
    return res.status(401).json({ 
      success: false,
      message: 'Authentication failed',
      error: 'Invalid or expired authentication token'
    });
  }
};

module.exports = authMiddleware; 