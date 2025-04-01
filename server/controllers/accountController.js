const { Op } = require("sequelize");
const { User, Group, UserGroup, Notification } = require("../models");
const { validateImportAccounts, validateUpdateFields } = require("../utils/object/account");
const { ROLES } = require("../utils/const");
const { removeNullOrUndefined, compareIdsArray } = require("../utils/helper");
const bcrypt = require("bcryptjs/dist/bcrypt");
const sequelize = require("../config/sequelize");
const SSEService = require("../lib/sseService");
const pageSize = 10;

module.exports = {
  async getAccountInfo(req, res) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ errors: ["Missing id"] });
      }
      const user = await User.findOne({
        where: { id },
        attributes: { exclude: ["password"] },
      });
      if (!user) {
        return res.status(400).json({ errors: ["User not found"] });
      }
      res.status(200).json(user);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ errors: [error.message] });
    }
  },

  async getAccountInfoByQuery(req, res) {
    try {
      const { id, full_name, mssv, email, username, page = 1 } = req.query;
      const query = removeNullOrUndefined({ id, full_name, mssv, email, username });
      const whereClause = {};
      if (query.id) whereClause.id = query.id;
      if (query.full_name) whereClause.full_name = { [Op.like]: `%${query.full_name}%` };
      if (query.mssv) whereClause.mssv = { [Op.like]: `%${query.mssv}%` };
      if (query.email) whereClause.email = { [Op.like]: `%${query.email}%` };
      if (query.username) whereClause.username = { [Op.like]: `%${query.username}%` };

      const users = await User.findAll({
        where: whereClause,
        attributes: { exclude: ["password"] },
        limit: pageSize,
        offset: (page - 1) * pageSize,
      });

      res.status(200).json(users);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ errors: [error.message] });
    }
  },

  async updateAccountInfo(req, res) {
    try {
      const { id } = req.params;
      const { full_name, username, email, mssv, level, work_place, birth_day } =
        req.body;
      if (!id) {
        return res.status(400).json({ errors: ["Missing id"] });
      }
      const user = await User.findOne({ where: { id } });
      if (!user) {
        return res.status(400).json({ errors: ["User not found"] });
      }
      const payload = removeNullOrUndefined({
        full_name,
        username,
        email,
        mssv,
        level,
        work_place,
        birth_day,
      });
      const errors = validateUpdateFields(payload);
      if (errors.length > 0) {
        return res.status(400).json({ errors });
      }
      const existingUser = await User.findOne({
        where: {
          [Op.or]: [{ email: payload.email || null }, { username: payload.username || null }],
        },
      });
      if (existingUser) {
        return res.status(400).json({ errors: ["Username or email already exists"] });
      }
      await User.update(payload, {
        where: { id },
        attributes: { exclude: ["password"] },
      });
      const updatedUser = await User.findByPk(id, {
        attributes: { exclude: ["password"] },
      });
      res.status(200).json(updatedUser);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ errors: [error.message] });
    }
  },

  async changePassword(req, res) {
    try {
      const { id } = req.params;
      const { password } = req.body;
      if (!id) {
        return res.status(400).json({ errors: ["Missing id"] });
      }
      if (!password) {
        return res.status(400).json({ errors: ["Missing password"] });
      }
      const user = await User.findOne({ where: { id } });
      if (!user) {
        return res.status(400).json({ errors: ["User not found"] });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      await User.update({ password: hashedPassword }, { where: { id } });
      res.status(200).json({});
    } catch (error) {
      console.log(error);
      return res.status(500).json({ errors: [error.message] });
    }
  },

  async createGroup(req, res) {
    try {
      const { userIds, name, description } = req.body;
      if (
        !userIds ||
        !name ||
        !description
      ) {
        return res.status(400).json({ errors: ["Missing required fields"] });
      }
      const existingGroup = await Group.findOne({ where: { name } });
      if (existingGroup) {
        return res.status(400).json({ errors: ["Group already exists"] });
      }

      let group;
      const userIdsArray = JSON.parse(userIds);
      if (!Array.isArray(userIdsArray) || userIdsArray.length === 0) {
        return res.status(400).json({ errors: ["User ids is invalid"] });
      }
      await sequelize.transaction(async (transaction) => {
        group = await Group.create({ name, description }, { transaction });
        const useGroupEntries = userIdsArray.map((userId) => ({
          group_id: group.id,
          user_id: userId,
        }));
        await UserGroup.bulkCreate(useGroupEntries, { transaction });
      });

      await Notification.bulkCreate(userIdsArray.map(userId => ({
        user_id: userId,
        message: `You was added to group ${name}`,
        seen: false,
      })));

      SSEService.sendToUsers(userIdsArray, {
        type: "GROUP_UPDATE",
      });


      const result = await Group.findByPk(group.id, {
        include: {
          model: User,
          through: { attributes: [] },
        },
      });

      res.status(200).json(result);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ errors: [error.message] });
    }
  },

  async updateGroup(req, res) {
    try {
      const { id } = req.params;
      const { name, description, userIds } = req.body;
      if (!id) {
        return res.status(400).json({ errors: ["Missing id"] });
      }
      if (!name || !description) {
        return res.status(400).json({ errors: ["Missing required fields"] });
      }
      const group = await Group.findByPk(id, {
        include: {
          model: User,
          attributes: { exclude: ["password"] },
          through: { attributes: [] },
        },
      });
      if (!group) {
        return res.status(400).json({ errors: ["Group not found"] });
      }
      const oldUserIds = group.Users.map((user) => user.id);
      const userIdsArray = JSON.parse(userIds);
      if (!Array.isArray(userIdsArray) || userIdsArray.length === 0) {
        return res.status(400).json({ errors: ["User ids is invalid"] });
      }
      const { removedIds: removedUserIds, addedIds: addedUserIds } = compareIdsArray(oldUserIds, userIdsArray);
      const userGroupEntries = addedUserIds.map((userId) => ({
        user_id: userId,
        group_id: id,
      }));
      const newData = removeNullOrUndefined({ name, description });
      await sequelize.transaction(async (transaction) => {
        await Group.update(newData, { where: { id }, transaction });
        await UserGroup.destroy({ where: { group_id: id, user_id: { [Op.in]: removedUserIds } }, transaction });
        await UserGroup.bulkCreate(userGroupEntries, { transaction });
      });

      await Notification.bulkCreate(addedUserIds.map(userId => ({
        user_id: userId,
        message: `You was added to group ${name}`,
        seen: false,
      })));

      await Notification.bulkCreate(removedUserIds.map(userId => ({
        user_id: userId,
        message: `You was removed from group ${name}`,
        seen: false,
      })));

      SSEService.sendToUsers([...addedUserIds, ...removedUserIds], {
        type: "GROUP_UPDATE",
      });

      const result = await Group.findByPk(id, {
        include: {
          model: User,
          attributes: { exclude: ["password"] },
          through: { attributes: [] },
        },
      });
      res.status(200).json(result);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ errors: [error.message] });
    }
  },

  async getGroupById(req, res) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ errors: ["Missing id"] });
      }
      const group = await Group.findByPk(id, {
        include: {
          model: User,
          attributes: { exclude: ["password"] },
          through: { attributes: [] },
        },
      });
      if (!group) {
        return res.status(400).json({ errors: ["Group not found"] });
      }
      res.status(200).json(group);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ errors: [error.message] });
    }
  },

  async getGroupByUserId(req, res) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ errors: ["Missing id"] });
      }
      const user = await User.findByPk(id, {
        attributes: { exclude: ["password"] },
        include: {
          model: Group,
          through: { attributes: [] },
        },
      });
      if (!user) {
        return res.status(400).json({ errors: ["User not found"] });
      }
      res.status(200).json(user);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ errors: [error.message] });
    }
  },

  async deleteGroup(req, res) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ errors: ["Missing id"] });
      }
      const group = await Group.findByPk(id);
      if (!group) {
        return res.status(400).json({ errors: ["Group not found"] });
      }
      await sequelize.transaction(async (transaction) => {
        await Group.destroy({ where: { id }, transaction });
        await UserGroup.destroy({ where: { group_id: id }, transaction });
      });

      // notify users
      //
      //

      res.status(200).json({});
    } catch (error) {
      console.log(error);
      return res.status(500).json({ errors: [error.message] });
    }
  },

  async importAccounts(req, res) {
    try {
      const { accounts } = req.body;
      if (!accounts) {
        return res.status(400).json({ errors: ["Missing accounts"] });
      }
      if (!Array.isArray(accounts) || accounts.length === 0) {
        return res.status(400).json({ errors: ["Accounts is invalid"] });
      }
      const errors = validateImportAccounts(accounts, ROLES.STUDENT);
      if (errors.length > 0) {
        return res.status(400).json({ errors });
      }

      const emails = accounts.map((account) => account.email);
      const usernames = accounts.map((account) => account.username);
      const existingUsers = await User.findAll({
        where: {
          [Op.or]: [{ email: emails }, { username: usernames }],
        },
        attributes: ["email", "username"],
      });
      const existingEmails = existingUsers.map((user) => user.email);
      const existingUsernames = existingUsers.map((user) => user.username);

      const duplicateAccounts = accounts.filter(
        (account) => existingEmails.includes(account.email) || existingUsernames.includes(account.username)
      );

      if (duplicateAccounts.length > 0) {
        return res.status(400).json({
          errors: duplicateAccounts.map((account) => `User ${account.username} or ${account.email} already exists`),
        });
      }

      const userEntries = await Promise.all(accounts.map(async (account) => {
        const password = account.password;
        const hashedPassword = await bcrypt.hash(password, 10);
        return {
          full_name: account.full_name,
          username: account.username,
          email: account.email,
          mssv: account.mssv,
          birth_day: account.birth_day,
          password: hashedPassword,
          role: ROLES.STUDENT,
        };
      }));
      const result = await User.bulkCreate(userEntries);

      // notify users
      //
      //

      res.status(200).json(result);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ errors: [error.message] });
    }
  },
};
