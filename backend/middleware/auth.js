// This middleware verifies JWT token and checks if user is authenticated
const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  try {
    // Get token from request headers
    const token = req.header('Authorization')?.split(' ')[1]; // Format: "Bearer TOKEN"

    // If no token found, deny access
    if (!token) {
      return res.status(401).json({ message: 'No token provided, authorization denied' });
    }

    // Verify the token using JWT secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Store user info from token in request object for next middleware/route
    req.userId = decoded.userId;
    req.user = decoded;

    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = auth;
