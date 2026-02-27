const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const header = req.header('Authorization');
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const token = header.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Use lean() and select only necessary fields for better performance
    const user = await User.findById(decoded.id).select('name email role').lean();

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Convert lean object to include _id for compatibility
    req.user = { ...user, _id: user._id };
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token has expired' });
    }
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = auth;
