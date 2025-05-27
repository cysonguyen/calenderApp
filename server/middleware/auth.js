const jwt = require("jsonwebtoken");
const { User, Company } = require("../models");

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const userId = req.headers["user-id"];
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

    if (user.id != userId) {
      return res.status(401).json({ errors: ["Unauthorized"] });
    }

    const company = await Company.findByPk(decoded.company_id);
    if (!company) {
      return res.status(401).json({ errors: ["Company not found"] });
    }
    req.company_id = company.id;

    next();
  } catch (err) {
    return res.status(400).json({ errors: ["Invalid token"] });
  }
};

const authorizeValidUser = (requiredRole) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ errors: ["Unauthorized"] });
  }
  if (requiredRole && req.user.role !== requiredRole) {
    return res.status(403).json({ errors: ["Forbidden: Not enough permissions"] });
  }
  next();
}

module.exports = {
  authenticateToken,
  authorizeValidUser,
};
