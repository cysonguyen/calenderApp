const sequelize = require("../config/sequelize");
const SSEService = require("../lib/sseService");
const { Meeting, MeetingCycle, Notification, Report } = require("../models");
const { removeNullOrUndefined, compareIdsArray } = require("../utils/helper");
const { validateAvailabilityMeeting } = require("../utils/object/meeting");

const createReport = async (req, res) => {
    try {
        const { company_id } = req;
        const {
            meeting_id,
            title,
            content,
        } = req.body;
        if (!meeting_id) {
            return res.status(400).json({ error: ["Meeting ID is required"] });
        }
        const meeting = await Meeting.findByPk(meeting_id);
        if (!meeting) {
            return res.status(400).json({ error: ["Meeting not found"] });
        }
        if (
            !title ||
            !content
        ) {
            return res.status(400).json({ error: ["Missing required fields"] });
        }

        let report;
        await sequelize.transaction(async (transaction) => {
            report = await Report.create({
                meeting_id,
                title,
                content,
                company_id,
            }, { transaction });
        });

        res.status(201).json(report);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: [error.message] });
    }
};


const updateReport = async (req, res) => {
    try {
        const { report_id } = req.params;
        const {
            meeting_id,
            title,
            content,
        } = req.body;
        if (!meeting_id || !title || !content) {
            return res.status(400).json({ error: ["Missing required fields"] });
        }
        const meeting = await Meeting.findByPk(meeting_id);
        if (!meeting) {
            return res.status(400).json({ error: ["Meeting not found"] });
        }
        const report = await Report.findByPk(report_id);
        if (!report) {
            return res.status(400).json({ error: ["Report not found"] });
        }
        const newData = removeNullOrUndefined({
            title,
            content,
        });

        await report.update(newData);
        res.status(200).json(report);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: [error.message] });
    }
};

const deleteReport = async (req, res) => {
    try {
        const { report_id } = req.params;
        if (!report_id) {
            return res.status(400).json({ error: ["Report ID is required"] });
        }
        const report = await Report.findByPk(report_id);
        if (!report) {
            return res.status(400).json({ error: ["Report not found"] });
        }
        await report.destroy();
        res.status(200).json({ message: "Report deleted successfully" });
    } catch (error) {
        return res.status(500).json({ error: [error.message] });
    }
};

const getReportById = async (req, res) => {
    try {
        const { report_id } = req.params;
        if (!report_id) {
            return res.status(400).json({ error: ["Report ID is required"] });
        }
        const report = await Report.findByPk(report_id);
        if (!report) {
            return res.status(400).json({ error: ["Report not found"] });
        }
        res.status(200).json(report);
    } catch (error) {
        return res.status(500).json({ error: [error.message] });
    }
};

const getReportsByMeetingId = async (req, res) => {
    try {
        const { company_id } = req;
        const { meeting_id } = req.params;
        if (!meeting_id) {
            return res.status(400).json({ error: ["Meeting ID is required"] });
        }
        const reports = await Report.findAll({
            where: { meeting_id: meeting_id, company_id },
        });
        res.status(200).json(reports);
    } catch (error) {
        return res.status(500).json({ error: [error.message] });
    }
};

module.exports = {
    createReport,
    updateReport,
    deleteReport,
    getReportById,
    getReportsByMeetingId,
};
