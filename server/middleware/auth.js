// server/middleware/auth.js
const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    // Get token from the header (sent as 'x-auth-token')
    const token = req.header('x-auth-token'); 
    
    // Check if no token
    if (!token) {
        return res.status(401).json({ message: 'No authorization token provided.' });
    }

    try {
        // Verify token using the secret key
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Add user ID from the token payload to the request object
        req.user = decoded.user; 
        
        next(); // Move to the next middleware/route handler
    } catch (e) {
        console.error("Token verification failed:", e.message);
        res.status(401).json({ message: 'Token is not valid.' });
    }
};

module.exports = auth;