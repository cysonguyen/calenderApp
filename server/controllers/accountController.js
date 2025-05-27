const { Op } = require("sequelize");
const { User, Group, UserGroup, Notification } = require("../models");
const { validateImportAccounts, validateUpdateFields } = require("../utils/object/account");
const { ROLES } = require("../utils/const");
const { removeNullOrUndefined, compareIdsArray } = require("../utils/helper");
const bcrypt = require("bcryptjs/dist/bcrypt");
const sequelize = require("../config/sequelize");
const SSEService = require("../lib/sseService");
const dayjs = require("dayjs");
const PAGE_SIZE = 10;

module.exports = {
  async getAccountInfo(req, res) {
    try {
      const { company_id } = req;
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ errors: ["Missing id"] });
      }
      const user = await User.findOne({
        where: { id, company_id },
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
      const { company_id } = req;
      const { id, full_name, msnv, email, username, role, page = 0, pageSize = PAGE_SIZE } = req.query;
      const query = removeNullOrUndefined({ id, full_name, msnv, email, username, role });
      const whereClause = {};
      if (query.id) whereClause.id = query.id;
      if (query.full_name) whereClause.full_name = { [Op.like]: `%${query.full_name}%` };
      if (query.msnv) whereClause.msnv = { [Op.like]: `%${query.msnv}%` };
      if (query.email) whereClause.email = { [Op.like]: `%${query.email}%` };
      if (query.username) whereClause.username = { [Op.like]: `%${query.username}%` };
      if (query.role) whereClause.role = query.role;

      const users = await User.findAndCountAll({
        where: { ...whereClause, company_id },
        attributes: { exclude: ["password"] },
        limit: Number(pageSize),
        offset: (Number(page)) * Number(pageSize),
      });

      res.status(200).json({
        users: users.rows,
        total: users.count,
        page,
        pageSize,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ errors: [error.message] });
    }
  },

  async updateAccountInfo(req, res) {
    try {
      const { id } = req.params;
      const { company_id } = req;
      const { full_name, username, email, msnv, level, work_place, birth_day } =
        req.body;
      if (!id) {
        return res.status(400).json({ errors: ["Missing id"] });
      }
      const user = await User.findOne({ where: { id, company_id } });
      if (!user) {
        return res.status(400).json({ errors: ["User not found"] });
      }
      const payload = removeNullOrUndefined({
        full_name,
        email,
        msnv,
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
          id: { [Op.ne]: id },
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
      const { company_id } = req;
      const { password, oldPassword } = req.body;
      if (!id) {
        return res.status(400).json({ errors: ["Missing id"] });
      }
      if (!password) {
        return res.status(400).json({ errors: ["Missing password"] });
      }
      if (!oldPassword) {
        return res.status(400).json({ errors: ["Missing old password"] });
      }
      const user = await User.findOne({ where: { id, company_id } });
      if (!user) {
        return res.status(400).json({ errors: ["User not found"] });
      }
      const isPasswordCorrect = await bcrypt.compare(oldPassword, user.password);
      if (!isPasswordCorrect) {
        return res.status(400).json({ errors: ["Old password is incorrect"] });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      await User.update({ password: hashedPassword }, { where: { id, company_id } });
      res.status(200).json({});
    } catch (error) {
      console.log(error);
      return res.status(500).json({ errors: [error.message] });
    }
  },

  async createGroup(req, res) {
    try {
      const { company_id } = req;
      const { userIds, name, description } = req.body;
      if (
        !userIds ||
        !name ||
        !description
      ) {
        return res.status(400).json({ errors: ["Missing required fields"] });
      }
      const existingGroup = await Group.findOne({ where: { name, company_id } });
      if (existingGroup) {
        return res.status(400).json({ errors: ["Group already exists"] });
      }

      let group;
      if (!Array.isArray(userIds) || userIds.length === 0) {
        return res.status(400).json({ errors: ["User ids is invalid"] });
      }
      await sequelize.transaction(async (transaction) => {
        group = await Group.create({ name, description, company_id }, { transaction });
        const useGroupEntries = userIds.map((userId) => ({
          group_id: group.id,
          user_id: userId,
          company_id,
        }));
        await UserGroup.bulkCreate(useGroupEntries, { transaction });
      });

      await Notification.bulkCreate(userIds.map(userId => ({
        user_id: userId,
        company_id,
        message: `You was added to group ${name}`,
        seen: false,
      })));

      SSEService.sendToUsers(userIds, {
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
      const { company_id } = req;
      if (!id) {
        return res.status(400).json({ errors: ["Missing id"] });
      }
      if (!name || !description) {
        return res.status(400).json({ errors: ["Missing required fields"] });
      }
      const group = await Group.findByPk(id, {
        where: { company_id },
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
      if (!Array.isArray(userIds) || userIds.length === 0) {
        return res.status(400).json({ errors: ["User ids is invalid"] });
      }
      const { removedIds: removedUserIds, addedIds: addedUserIds } = compareIdsArray(oldUserIds, userIds);
      const userGroupEntries = addedUserIds.map((userId) => ({
        user_id: userId,
        group_id: id,
        company_id,
      }));
      const newData = removeNullOrUndefined({ name, description });
      await sequelize.transaction(async (transaction) => {
        await Group.update(newData, { where: { id, company_id }, transaction });
        await UserGroup.destroy({ where: { group_id: id, company_id, user_id: { [Op.in]: removedUserIds } }, transaction });
        await UserGroup.bulkCreate(userGroupEntries, { transaction });
      });

      await Notification.bulkCreate(addedUserIds.map(userId => ({
        user_id: userId,
        company_id,
        message: `You was added to group ${name}`,
        seen: false,
      })));

      await Notification.bulkCreate(removedUserIds.map(userId => ({
        user_id: userId,
        company_id,
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
      const { company_id } = req;
      if (!id) {
        return res.status(400).json({ errors: ["Missing id"] });
      }
      const group = await Group.findByPk(id, {
        where: { company_id },
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
      const { company_id } = req;
      if (!id) {
        return res.status(400).json({ errors: ["Missing id"] });
      }
      const user = await User.findByPk(id, {
        attributes: { exclude: ["password"] },
        include: {
          model: Group,
          through: { attributes: [] },
          where: { company_id },
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

  async getGroupByQuery(req, res) {
    try {
      const { name, page = 0, id, pageSize = PAGE_SIZE } = req.query;
      const { company_id } = req;
      const query = removeNullOrUndefined({ name, id });
      const whereClause = {};
      if (query.id) whereClause.id = query.id;
      if (query.name) whereClause.name = { [Op.like]: `%${query.name}%` };
      const groups = await Group.findAndCountAll({
        where: { ...whereClause, company_id },
        limit: Number(pageSize),
        offset: (Number(page)) * Number(pageSize),
      });
      res.status(200).json({
        groups: groups.rows,
        total: groups.count,
        page,
        pageSize,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ errors: [error.message] });
    }
  },

  async deleteGroup(req, res) {
    try {
      const { id } = req.params;
      const { company_id } = req;
      if (!id) {
        return res.status(400).json({ errors: ["Missing id"] });
      }
      const group = await Group.findByPk(id, { where: { company_id } });
      if (!group) {
        return res.status(400).json({ errors: ["Group not found"] });
      }
      await sequelize.transaction(async (transaction) => {
        await Group.destroy({ where: { id, company_id }, transaction });
        await UserGroup.destroy({ where: { group_id: id, company_id }, transaction });
      });

      res.status(200).json({});
    } catch (error) {
      console.log(error);
      return res.status(500).json({ errors: [error.message] });
    }
  },

  async createStaffUser(req, res) {
    try {
      const { company_id } = req;
      const { full_name, username, email, msnv, birth_day, password, work_place, level } = req.body;
      if (!full_name || !username || !email || !msnv || !password) {
        return res.status(400).json({ errors: ["Missing required fields"] });
      }
      const existingUser = await User.findOne({
        where: {
          [Op.or]: [{ email: email || null }, { username: username || null }],
          company_id,
        },
      });
      if (existingUser) {
        return res.status(400).json({ errors: ["User already exists"] });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const data = removeNullOrUndefined({ full_name, username, email, msnv, birth_day, password: hashedPassword, role: ROLES.STAFF, work_place, level, company_id });
      const user = await User.create(data);
      res.status(200).json(user);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ errors: [error.message] });
    }
  },
  async importAccounts(req, res) {
    try {
      const { company_id } = req;
      const { accounts } = req.body;
      if (!accounts) {
        return res.status(400).json({ errors: ["Missing accounts"] });
      }
      if (!Array.isArray(accounts) || accounts.length === 0) {
        return res.status(400).json({ errors: ["Accounts is invalid"] });
      }
      const errors = validateImportAccounts(accounts, ROLES.STAFF);
      if (errors.length > 0) {
        return res.status(400).json({ errors });
      }

      const emails = accounts.map((account) => account.email);
      const usernames = accounts.map((account) => account.username);
      const existingUsers = await User.findAll({
        where: {
          [Op.or]: [{ email: emails }, { username: usernames }],
          company_id,
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
        const birthDay = account.birth_day ? dayjs(account.birth_day).format("YYYY-MM-DD") : null;
        const data = {
          full_name: account.full_name,
          username: account.username,
          email: account.email,
          msnv: account.msnv,
          birth_day: birthDay,
          password: hashedPassword,
          role: ROLES.STAFF,
          company_id,
        }
        return removeNullOrUndefined(data);
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
