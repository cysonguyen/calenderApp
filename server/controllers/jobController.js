const { Op } = require("sequelize");
const sequelize = require("../config/sequelize");
const { Job, Task, JobUser, User, Schedule } = require("../models");
const { JOB_STATUS } = require("../utils/const");
const { removeNullOrUndefined } = require("../utils/helper");
const pageSize = 100;

module.exports = {
    getJobsByUserId: async (req, res) => {
        try {
            const { company_id } = req;
            const { user_id } = req.params;
            if (!user_id) {
                return res.status(400).json({ error: ["user_id is required"] });
            }
            const { page = 1 } = req.query;
            const jobs = await Job.findAll({
                order: [["createdAt", "DESC"]],
                limit: pageSize,
                offset: (page - 1) * pageSize,
                where: { company_id },
                include: [
                    { model: Task },
                    {
                        model: User,
                        where: { id: user_id },
                        through: { attributes: [] },
                        attributes: { exclude: ["password"] }
                    },
                    { model: Schedule, attributes: ["id", "title", "start_time", "end_time"] },
                ],
            });
            const total = await Job.count({ where: { company_id }, include: [{ model: User, where: { id: user_id } }] });
            res.status(200).json({ jobs, total });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ error: [error.message] });
        }
    },


    getJobByScheduleId: async (req, res) => {
        try {
            const { company_id } = req;
            const { schedule_id } = req.params;
            const { page = 1, index_cycle, status } = req.query;
            if (!schedule_id) {
                return res.status(400).json({ error: ["schedule_id is required"] });
            }

            const existingSchedule = await Schedule.findByPk(schedule_id, { where: { company_id } });
            if (!existingSchedule) {
                return res.status(400).json({ error: ["Schedule not found"] });
            }

            const whereCondition = { schedule_id, company_id };
            if (index_cycle) {
                whereCondition.cycle_start = { [Op.lte]: Number(index_cycle) };
            }
            if (status) {
                whereCondition.status = status;
            }


            const jobs = await Job.findAll({
                where: whereCondition,
                include: [{ model: Task },
                {
                    model: User,
                    through: { attributes: [] },
                    attributes: { exclude: ["password"] }
                }],
                limit: pageSize,
                offset: (page - 1) * pageSize,
                order: [["createdAt", "DESC"]],
            });
            const jobData = jobs.map(job => {
                const tasks = job.Tasks;
                const progress = tasks.filter(task => task.status === JOB_STATUS.IN_PROGRESS).length;
                const total = tasks.length;
                return { ...job.get({ plain: true }), progress, total, closed: total - progress };
            });
            const total = await Job.count({ where: whereCondition });
            res.status(200).json({ jobs: jobData, total });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ error: [error.message] });
        }
    },
    createJob: async (req, res) => {
        try {
            const { company_id } = req;
            const { schedule_id, title, description, cycle_start, deadline, user_ids, tasks, status } = req.body;
            if (!schedule_id || !title || !cycle_start) {
                return res.status(400).json({ error: ["Missing required fields"] });
            }
            if (user_ids) {
                if (!Array.isArray(user_ids) || user_ids.length === 0) {
                    return res.status(400).json({ error: ["user_ids must be an array"] });
                }
            }
            if (!Array.isArray(tasks) || tasks.length === 0) {
                return res.status(400).json({ error: ["tasks must be an array"] });
            }
            if (tasks.some((task) => !task.title)) {
                return res.status(400).json({ error: ["Missing required task fields"] });
            }

            let job;
            await sequelize.transaction(async (transaction) => {
                job = await Job.create({ schedule_id, title, description, cycle_start, deadline, status: status || JOB_STATUS.IN_PROGRESS, company_id }, { transaction });
                if (user_ids) {
                    await JobUser.bulkCreate(user_ids.map((user_id) => ({ job_id: job.id, user_id, company_id })), { transaction });
                }
                await Task.bulkCreate(tasks.map((task) => ({ job_id: job.id, ...task, status: JOB_STATUS.IN_PROGRESS, company_id })), { transaction });
            });
            const updatedJob = await Job.findByPk(job.id, { include: [{ model: Task }] });
            res.status(201).json(updatedJob);
        } catch (error) {
            console.log(error);
            return res.status(500).json({ error: [error.message] });
        }
    },

    updateJob: async (req, res) => {
        try {
            const { company_id } = req;
            const { job_id } = req.params;
            const { title, description, deadline, user_ids, tasks, status, cycle_end } = req.body;

            if (!Array.isArray(tasks) || tasks.length === 0) {
                return res.status(400).json({ error: ["tasks must be an array"] });
            }

            const job = await Job.findByPk(job_id, { include: [{ model: Task }] });
            if (!job) {
                return res.status(400).json({ error: ["Job not found"] });
            }

            await sequelize.transaction(async (transaction) => {
                const dataUpdate = removeNullOrUndefined({ title, description, deadline, status, cycle_end });
                if (status === JOB_STATUS.CLOSED) {
                    dataUpdate.cycle_end = cycle_end;
                } else {
                    dataUpdate.cycle_end = null;
                }
                await job.update(dataUpdate, { transaction });
                if (user_ids) {
                    await JobUser.bulkCreate(user_ids.map((user_id) => ({ job_id: job.id, user_id, company_id })), { transaction });
                }
                await Promise.all(tasks.map(async (task) => {
                    if (task.id) {
                        const exitTask = job.Tasks.find(t => t.id === task.id);
                        if (!exitTask) {
                            return res.status(400).json({ error: ["Task not found"] });
                        }
                        if (task.status === JOB_STATUS.CLOSED && exitTask.status !== JOB_STATUS.CLOSED) {
                            task.done_at = cycle_end;
                        } else {
                            task.done_at = exitTask.done_at;
                        }
                        await Task.update({ ...task }, { where: { id: task.id }, transaction });
                    } else {
                        await Task.create({ job_id: job.id, ...task, status: JOB_STATUS.IN_PROGRESS, company_id }, { transaction });
                    }
                }));
            });

            const updatedJob = await Job.findByPk(job_id, { include: [{ model: Task }] });
            res.status(200).json(updatedJob);

        } catch (error) {
            console.log(error);
            return res.status(500).json({ error: [error.message] });
        }
    },

    deleteJob: async (req, res) => {
        try {
            const { company_id } = req;
            const { job_id } = req.params;
            const job = await Job.findByPk(job_id);
            if (!job) {
                return res.status(400).json({ error: ["Job not found"] });
            }
            await sequelize.transaction(async (transaction) => {
                await job.destroy({ transaction });
                await Task.destroy({ where: { job_id, company_id }, transaction });
                await JobUser.destroy({ where: { job_id, company_id }, transaction });
            });
            res.status(200).json({ message: "Job deleted successfully" });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ error: [error.message] });
        }
    }
};
