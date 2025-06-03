const { Op } = require("sequelize");
const { Schedule, ScheduleUser, User, Notification, UserGroup, Group, Job, Task } = require("../models");
const { validateAvailabilitySchedule } = require("../utils/object/schedule");
const {
  compareIdsArray,
  removeNullOrUndefined,
  pick,
} = require("../utils/helper");
const { getMeetingCyclesByQuery } = require("./meetingCycleController");
const sequelize = require("../config/sequelize");
const SSEService = require("../lib/sseService");
const ScheduleGroup = require("../models/scheduleGroup");
const { JOB_STATUS } = require("../utils/const");
const pageSize = 10;

module.exports = {
  async getSchedulesByUserId(req, res) {
    try {
      const { company_id } = req;
      const { userId } = req.params;
      const {
        startTime = new Date(),
        endTime = new Date(),
        page = 1,
        view = "list",
        title,
      } = req.query;
      if (!userId) {
        return res.status(400).json({ errors: ["Missing userId"] });
      }
      const isCalendarView = view === "calendar";
      let whereCondition = {};
      if (title) {
        whereCondition.title = { [Op.like]: `%${title}%` };
      }
      if (isCalendarView) {
        whereCondition = {
          [Op.and]: [
            {
              [Op.or]: [
                { when_expired: { [Op.gt]: startTime } },
                { when_expired: null },
              ],
            },
          ],
          [Op.or]: [
            { start_time: { [Op.between]: [startTime, endTime] } },
            { end_time: { [Op.between]: [startTime, endTime] } },
            {
              start_time: { [Op.lte]: startTime },
              end_time: { [Op.gte]: endTime },
            },
          ],
        };
      }

      let queryOptions = {
        include: [
          {
            model: User,
            where: { id: Number(userId), company_id },
            through: { attributes: [] },
            attributes: { exclude: ["password"] },
          },
          {
            model: Group,
            attributes: ["id", "name"],
          },
          {
            model: Job,
            required: false,
            where: { status: JOB_STATUS.IN_PROGRESS },
            attributes: { exclude: [] },
            include: [
              {
                model: Task,
                attributes: { exclude: [] },
              },
              {
                model: User,
                through: { attributes: [] },
                attributes: { exclude: ["password"] },
              },
            ],
          },
        ],
        where: whereCondition,
        order: [["createdAt", "DESC"]],
      };

      if (!isCalendarView) {
        queryOptions.limit = pageSize;
        queryOptions.offset = (page - 1) * pageSize;
      }

      let schedules = await Schedule.findAll(queryOptions);
      schedules = await Promise.all(
        schedules.map(async (schedule) => {
          const scheduleData = schedule.get({ plain: true });
          const meetingCycles = await getMeetingCyclesByQuery(
            schedule.id,
            startTime,
            endTime,
            company_id
          );
          scheduleData.meetingCycles = meetingCycles;

          const acceptedIds = JSON.parse(schedule.accepted_ids);
          if (acceptedIds.some((id) => id == userId)) {
            scheduleData.status = "accepted";
          } else {
            scheduleData.status = "unaccepted";
          }

          scheduleData.Jobs?.forEach((job) => {
            const tasks = job.Tasks;
            const progress = tasks.filter((task) => task.status === JOB_STATUS.IN_PROGRESS).length;
            const total = tasks.length;
            job.progress = {
              in_progress: progress,
              total: total,
              closed: total - progress,
            }
          });

          return scheduleData;
        })
      );
      res.status(200).json(schedules);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ errors: [error.message] });
    }
  },

  async getScheduleById(req, res) {
    try {
      const { company_id } = req;
      const { scheduleId } = req.params;
      const { startTime, endTime, status } = req.query;
      if (!scheduleId) {
        return res.status(400).json({ errors: ["Missing scheduleId"] });
      }
      let condition = {};
      if (!status || status !== "All") {
        condition = { status: status || JOB_STATUS.IN_PROGRESS };
      }
      const schedule = await Schedule.findByPk(scheduleId, {
        include: [
          {
            model: User,
            through: { attributes: [] },
            attributes: { exclude: ["password"] },
          },
          {
            model: Group,
            attributes: ["id", "name"],
          },
          {
            model: Job,
            required: false,
            where: condition,
            attributes: { exclude: [] },
            include: [
              {
                model: Task,
                attributes: { exclude: [] },
              },
              {
                model: User,
                through: { attributes: [] },
                attributes: { exclude: ["password"] },
              },
            ],
          },
        ],
      });

      if (!schedule) {
        return res.status(400).json({ errors: ["Schedule not found"] });
      }
      const meetingCycles = await getMeetingCyclesByQuery(
        schedule.id,
        startTime,
        endTime,
        company_id
      );
      const scheduleData = schedule.get({ plain: true });
      scheduleData.meetingCycles = meetingCycles;

      scheduleData.Jobs?.forEach((job) => {
        const tasks = job.Tasks;
        const progress = tasks.filter((task) => task.status === JOB_STATUS.IN_PROGRESS).length;
        const total = tasks.length;
        job.progress = {
          in_progress: progress,
          closed: total - progress,
          total: total,
        }
      });
      res.status(200).json(scheduleData);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ errors: [error.message] });
    }
  },

  async createSchedule(req, res) {
    try {
      const { company_id } = req;
      const { authorUserId } = req.params;
      const {
        title,
        description,
        start_time,
        end_time,
        is_repeat,
        interval,
        interval_count,
        userIds,
        when_expired,
        group_ids,
      } = req.body;
      if (
        !title ||
        !start_time ||
        !end_time ||
        !is_repeat == null
      ) {
        return res.status(400).json({ errors: ["Missing required fields"] });
      }

      if (!group_ids && !userIds) {
        return res.status(400).json({ errors: ["GroupIds or UserIds is required"] });
      }

      let userIdsToAdd = new Set();

      if (userIds) {
        if (!Array.isArray(userIds)) {
          return res.status(400).json({ errors: ["UserIds is invalid"] });
        }
        userIds.forEach((userId) => userIdsToAdd.add(Number(userId)));
      }

      if (group_ids) {
        if (!Array.isArray(group_ids)) {
          return res.status(400).json({ errors: ["GroupIds is invalid"] });
        }
        const groupUsers = await UserGroup.findAll({
          where: { group_id: { [Op.in]: group_ids }, company_id },
        });
        groupUsers.forEach((user) => userIdsToAdd.add(Number(user.user_id)));
      }
      if (userIdsToAdd.size < 1) {
        return res.status(400).json({ errors: ["No users or groups selected"] });
      }
      userIdsToAdd.add(Number(authorUserId));
      const errors = await validateAvailabilitySchedule(
        {
          start_time,
          end_time,
          is_repeat,
          interval,
          interval_count: interval_count,
          when_expired,
        },
        authorUserId
      );
      if (errors.length > 0) {
        return res.status(400).json({ errors });
      }

      let schedule;
      await sequelize.transaction(async (transaction) => {
        schedule = await Schedule.create({
          title,
          description,
          start_time,
          end_time,
          is_repeat,
          interval,
          interval_count,
          when_expired,
          company_id,
          author_id: authorUserId,
          accepted_ids: `[${authorUserId}]`,
        });
        const scheduleUserEntries = Array.from(userIdsToAdd).map(
          (userId) => ({
            schedule_id: schedule.id,
            user_id: userId,
            company_id,
          })
        );
        await ScheduleUser.bulkCreate(scheduleUserEntries, { transaction });
        if (group_ids) {
          const scheduleGroupEntries = group_ids.map((groupId) => ({
            schedule_id: schedule.id,
            group_id: groupId,
            company_id,
          }));
          await ScheduleGroup.bulkCreate(scheduleGroupEntries, { transaction });
        }
      });
      schedule = await Schedule.findByPk(schedule.id, {
        include: {
          model: User,
          through: { attributes: [] },
          attributes: { exclude: ["password"] },
        },
      });

      await Notification.bulkCreate(
        Array.from(userIdsToAdd).map((userId) => ({
          user_id: userId,
          message: `You have a new schedule ${title}`,
          seen: false,
          company_id,
        }))
      );

      SSEService.sendToUsers(Array.from(userIdsToAdd), {
        type: "SCHEDULE_UPDATE",
      });

      return res.status(200).json(schedule);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ errors: [error.message] });
    }
  },

  async updateSchedule(req, res) {
    try {
      const { company_id } = req;
      const { authorUserId } = req.params;
      const { scheduleId, userIds, group_ids } = req.body;
      const payload = removeNullOrUndefined(
        pick(req.body, [
          "title",
          "description",
          "start_time",
          "end_time",
          "is_repeat",
          "interval",
          "interval_count",
          "when_expired",
        ])
      );
      if (!req.body.scheduleId) {
        return res.status(400).json({ errors: ["Missing scheduleId"] });
      }

      let userIdsToAdd = new Set();
      if (userIds) {
        if (!Array.isArray(userIds) || userIds.length === 0) {
          return res.status(400).json({ errors: ["UserIds is invalid"] });
        }
        userIds.forEach((userId) => userIdsToAdd.add(Number(userId)));
      }
      if (group_ids) {
        if (!Array.isArray(group_ids) || group_ids.length === 0) {
          return res.status(400).json({ errors: ["GroupIds is invalid"] });
        }
        const groupUsers = await UserGroup.findAll({
          where: { group_id: { [Op.in]: group_ids }, company_id },
        });
        groupUsers.forEach((user) => userIdsToAdd.add(Number(user.user_id)));
      }
      userIdsToAdd.add(Number(authorUserId));

      const existingSchedule = await Schedule.findByPk(scheduleId, {
        include: {
          model: User,
          through: { attributes: [] },
        },
      });
      if (!existingSchedule) {
        return res.status(400).json({ errors: ["Schedule not found"] });
      }

      const errors = await validateAvailabilitySchedule(
        { ...existingSchedule.get({ plain: true }), ...payload },
        authorUserId
      );
      if (errors.length > 0) {
        return res.status(400).json({ errors });
      }

      const oldUserIds = existingSchedule.Users.map((user) => user.id);
      const { addedIds: addedUsers, removedIds: removedUsers } =
        compareIdsArray(oldUserIds, userIdsToAdd.size > 0 ? Array.from(userIdsToAdd) : oldUserIds);

      await sequelize.transaction(async (transaction) => {
        const newAcceptedIds = JSON.parse(existingSchedule.accepted_ids).filter((id) => !removedUsers.includes(id));
        await Schedule.update({ ...payload, accepted_ids: JSON.stringify(newAcceptedIds) }, {
          where: { id: scheduleId, company_id },
          transaction,
        });
        if (addedUsers.length > 0) {
          const scheduleUserEntries = addedUsers.map((userId) => ({
            schedule_id: scheduleId,
            user_id: userId,
            company_id,
          }));
          await ScheduleUser.bulkCreate(scheduleUserEntries, { transaction });
        }
        if (removedUsers.length > 0) {
          await ScheduleUser.destroy({
            where: {
              schedule_id: scheduleId,
              user_id: { [Op.in]: removedUsers },
              company_id,
            },
            transaction,
          });
        }
        if (group_ids) {
          await ScheduleGroup.destroy({
            where: { schedule_id: scheduleId, company_id },
            transaction,
          });
          const scheduleGroupEntries = group_ids.map((groupId) => ({
            schedule_id: scheduleId,
            group_id: groupId,
            company_id,
          }));
          await ScheduleGroup.bulkCreate(scheduleGroupEntries, { transaction });
        }
      });

      await Notification.bulkCreate(
        addedUsers.map((userId) => ({
          user_id: userId,
          message: `You have a new schedule ${payload.title ?? existingSchedule.title
            }`,
          seen: false,
          company_id,
        }))
      );
      await Notification.bulkCreate(
        removedUsers.map((userId) => ({
          user_id: userId,
          message: `You was removed from schedule ${payload.title ?? existingSchedule.title
            }`,
          seen: false,
          company_id,
        }))
      );
      SSEService.sendToUsers([...addedUsers, ...removedUsers], {
        type: "SCHEDULE_UPDATE",
      });

      const schedule = await Schedule.findByPk(scheduleId, {
        include: {
          model: User,
          through: { attributes: [] },
          attributes: { exclude: ["password"] },
        },
      });
      return res.status(200).json(schedule);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ errors: [error.message] });
    }
  },

  async deleteSchedule(req, res) {
    try {
      const { scheduleId } = req.params;
      if (!scheduleId) {
        return res.status(400).json({ errors: ["Missing scheduleId"] });
      }
      const schedule = await Schedule.findByPk(scheduleId, {
        include: {
          model: User,
          through: { attributes: [] },
          attributes: { exclude: ["password"] },
        },
      });
      if (!schedule) {
        return res.status(400).json({ errors: ["Schedule not found"] });
      }

      await sequelize.transaction(async (transaction) => {
        await Schedule.destroy({ where: { id: scheduleId }, transaction });
        await ScheduleUser.destroy({
          where: { schedule_id: scheduleId },
          transaction,
        });
        await ScheduleGroup.destroy({
          where: { schedule_id: scheduleId },
          transaction,
        });
      });
      res.status(200).json({ scheduleId });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ errors: [error.message] });
    }
  },

  async acceptSchedule(req, res) {
    try {
      const { scheduleId } = req.params;
      const { userId } = req.body;
      const { company_id } = req;
      if (!scheduleId || !userId) {
        return res.status(400).json({ errors: ["Missing scheduleId or userId"] });
      }
      const schedule = await Schedule.findByPk(scheduleId, {
        include: {
          model: User,
          through: { attributes: [] },
          attributes: { exclude: ["password"] },
        },
      });

      const errors = await validateAvailabilitySchedule(
        {
          start_time: schedule.start_time,
          end_time: schedule.end_time,
          is_repeat: schedule.is_repeat,
          interval: schedule.interval,
          interval_count: schedule.interval_count,
          when_expired: schedule.when_expired,
        },
        userId
      );

      if (errors.length > 0) {
        return res.status(400).json({ errors });
      }

      if (!schedule) {
        return res.status(400).json({ errors: ["Schedule not found"] });
      }
      const acceptedIds = JSON.parse(schedule.accepted_ids);
      if (acceptedIds.includes(userId)) {
        return res.status(400).json({ errors: ["User already accepted"] });
      }
      acceptedIds.push(userId);
      await Schedule.update({ accepted_ids: `[${acceptedIds}]` }, { where: { id: scheduleId, company_id } });
      return res.status(200).json({ scheduleId });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ errors: [error.message] });
    }
  }
};
