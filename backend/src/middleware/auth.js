// src/middleware/auth.js
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { User } = require('../models');

exports.protect = async (req, res, next) => {
  try {
    let token;

    // Get token from header or cookie
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, env.JWT_SECRET);

    // Get user from database
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password_hash'] }
    });

    if (!user || !user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'User not found or inactive'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};

exports.generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRE }
  );
};