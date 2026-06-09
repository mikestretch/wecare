const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    // Check if authorization header exists and starts with 'Bearer'
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Extract token from string "Bearer <token_here>"
            token = req.headers.authorization.split(' ')[1];

            // Decode and verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Fetch the user from database and append to the request object (excluding password)
            req.user = await User.findById(decoded.id);
            
            next(); // Proceed to the route controller
        } catch (error) {
            return res.status(401).json({ error: 'Not authorized, token validation failed' });
        }
    }

    if (!token) {
        return res.status(401).json({ error: 'Not authorized, no token provided' });
    }
};

module.exports = { protect };
