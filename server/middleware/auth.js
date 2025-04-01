const jwt = require("jsonwebtoken");
const { User } = require("../models");

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ errors: ["Access denied. No token provided."] });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({ errors: ["User not found"] });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(400).json({ errors: ["Invalid token"] });
  }
};

const authorizeValidUser = (requiredRole) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ errors: ["Unauthorized"] });
  }
  if (req.user.role !== requiredRole) {
    return res.status(403).json({ errors: ["Forbidden: Not enough permissions"] });
  }
  next();
}

module.exports = {
  authenticateToken,
  authorizeValidUser,
};
