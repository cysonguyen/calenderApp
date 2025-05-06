const { Op } = require("sequelize");
const { Schedule, ScheduleUser, User, Notification } = require("../models");
const { validateAvailabilitySchedule } = require("../utils/object/schedule");
const {
  compareIdsArray,
  removeNullOrUndefined,
  pick,
} = require("../utils/helper");
const { getMeetingCyclesByQuery } = require("./meetingCycleController");
const sequelize = require("../config/sequelize");
const SSEService = require("../lib/sseService");
const pageSize = 10;

module.exports = {
  async getSchedulesByUserId(req, res) {
    try {
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
                { when_expires: { [Op.gt]: startTime } },
                { when_expires: null },
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
            where: { id: userId },
            through: { attributes: [] },
            attributes: { exclude: ["password"] },
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
            endTime
          );
          scheduleData.meetingCycles = meetingCycles;
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
      const { scheduleId } = req.params;
      const { startTime, endTime } = req.query;
      if (!scheduleId) {
        return res.status(400).json({ errors: ["Missing scheduleId"] });
      }
      const schedule = await Schedule.findByPk(scheduleId, {
        include: [
          {
            model: User,
            through: { attributes: [] },
            attributes: { exclude: ["password"] },
          },
        ],
      });

      if (!schedule) {
        return res.status(400).json({ errors: ["Schedule not found"] });
      }
      const meetingCycles = await getMeetingCyclesByQuery(
        schedule.id,
        startTime,
        endTime
      );
      console.log("meetingCycles", meetingCycles);
      const scheduleData = schedule.get({ plain: true });
      scheduleData.meetingCycles = meetingCycles;
      res.status(200).json(scheduleData);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ errors: [error.message] });
    }
  },

  async createSchedule(req, res) {
    try {
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
        when_expires,
      } = req.body;
      if (
        !title ||
        !start_time ||
        !end_time ||
        !is_repeat == null ||
        !Array.isArray(userIds) ||
        !userIds.length
      ) {
        return res.status(400).json({ errors: ["Missing required fields"] });
      }
      const errors = await validateAvailabilitySchedule(
        {
          start_time,
          end_time,
          is_repeat,
          interval,
          interval_count: interval_count,
          when_expires,
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
          when_expires,
          author_id: authorUserId,
        });
        const scheduleUserEntries = [...userIds, authorUserId].map(
          (userId) => ({
            schedule_id: schedule.id,
            user_id: userId,
          })
        );
        await ScheduleUser.bulkCreate(scheduleUserEntries, { transaction });
      });
      schedule = await Schedule.findByPk(schedule.id, {
        include: {
          model: User,
          through: { attributes: [] },
          attributes: { exclude: ["password"] },
        },
      });

      await Notification.bulkCreate(
        [...userIds, authorUserId].map((userId) => ({
          user_id: userId,
          message: `You have a new schedule ${title}`,
          seen: false,
        }))
      );

      SSEService.sendToUsers([...userIds, authorUserId], {
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
      const { authorUserId } = req.params;
      const { scheduleId, userIds } = req.body;
      const payload = removeNullOrUndefined(
        pick(req.body, [
          "title",
          "description",
          "start_time",
          "end_time",
          "is_repeat",
          "interval",
          "interval_count",
          "when_expires",
        ])
      );
      if (!req.body.scheduleId) {
        return res.status(400).json({ errors: ["Missing scheduleId"] });
      }
      if (userIds) {
        if (!Array.isArray(userIds) || userIds.length === 0) {
          return res.status(400).json({ errors: ["UserIds is invalid"] });
        }
      }
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
        compareIdsArray(oldUserIds, userIds);

      await sequelize.transaction(async (transaction) => {
        await Schedule.update(payload, {
          where: { id: scheduleId },
          transaction,
        });
        if (addedUsers.length > 0) {
          const scheduleUserEntries = addedUsers.map((userId) => ({
            schedule_id: scheduleId,
            user_id: userId,
          }));
          await ScheduleUser.bulkCreate(scheduleUserEntries, { transaction });
        }
        if (removedUsers.length > 0) {
          await ScheduleUser.destroy({
            where: {
              schedule_id: scheduleId,
              user_id: { [Op.in]: removedUsers },
            },
            transaction,
          });
        }
      });

      await Notification.bulkCreate(
        addedUsers.map((userId) => ({
          user_id: userId,
          message: `You have a new schedule ${payload.title ?? existingSchedule.title
            }`,
          seen: false,
        }))
      );
      await Notification.bulkCreate(
        removedUsers.map((userId) => ({
          user_id: userId,
          message: `You was removed from schedule ${payload.title ?? existingSchedule.title
            }`,
          seen: false,
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
      });
      res.status(200).json({ scheduleId });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ errors: [error.message] });
    }
  },
};
