const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
    console.log('--- Auth Middleware Reached ---'); // <-- ADD THIS
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).send('Access denied. No token provided.');

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        
    console.log('--- Auth Middleware Reached ---'); // <-- ADD THIS
   
        next();
        
    console.log('--- Auth Middleware Reached ---'); // <-- ADD THIS
   
    } catch (ex) {
        res.status(400).send('Invalid token.');
    }
};