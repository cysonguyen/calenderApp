const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../models");
const { Op } = require("sequelize");
const { ROLES } = require("../utils/const");
const { validateCreateFields } = require("../utils/object/account");

module.exports = {
  async register(req, res) {
    try {
      const {
        username,
        email,
        password,
        full_name,
        msnv,
        level,
        work_place,
        birth_day,
      } = req.body;

      const errors = validateCreateFields(req.body, ROLES.LEADER);
      if (errors.length > 0) {
        return res.status(400).json({ errors });
      }
      const existingUser = await User.findOne({
        where: {
          [Op.or]: [{ email }, { username }],
        },
      });
      if (existingUser) {
        return res.status(400).json({ errors: ["User already exists"] });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const user = await User.create({
        username,
        email,
        password: hashedPassword,
        full_name,
        msnv,
        level,
        work_place,
        birth_day,
        role: ROLES.LEADER,
      });

      const token = jwt.sign(
        { id: user.id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );
      const userWithoutPassword = user.toJSON();
      delete userWithoutPassword.password;
      res.status(201).json({
        token,
        user: userWithoutPassword,
      });
    } catch (err) {
      res.status(500).json({ errors: [err.message] });
    }
  },

  async login(req, res) {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ errors: ["Missing required fields"] });
      }

      const user = await User.findOne({
        where: { username },
      });
      if (!user) {
        return res.status(400).json({ errors: ["User not found"] });
      }
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(400).json({ errors: ["Wrong password"] });
      }

      const token = jwt.sign(
        { id: user.id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      const userWithoutPassword = user.toJSON();
      delete userWithoutPassword.password;
      res.status(200).json({
        token,
        user: userWithoutPassword,
      });
    } catch (err) {
      res.status(500).json({ errors: [err.message] });
    }
  },
};
