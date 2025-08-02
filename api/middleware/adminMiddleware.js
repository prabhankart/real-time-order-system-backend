const User = require('../models/User');

module.exports = async function(req, res, next) {
    try {
        const user = await User.findById(req.user.userId);
        if (user.role !== 'admin') {
            return res.status(403).send('Access denied. Admins only.');
        }
        next();
    } catch (error) {
        res.status(401).send('Invalid token.');
    }
};