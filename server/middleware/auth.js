
const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    
    const token = req.header('x-auth-token'); 
    

    if (!token) {
        return res.status(401).json({ message: 'No authorization token provided.' });
    }

    try {
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        
        req.user = decoded.user; 
        
        next(); 
    } catch (e) {
        console.error("Token verification failed:", e.message);
        res.status(401).json({ message: 'Token is not valid.' });
    }
};

module.exports = auth;