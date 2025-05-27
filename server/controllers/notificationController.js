const { Notification } = require("../models");

const pageSize = 10;

module.exports = {
    getAllNotification: async (req, res) => {
        try {
            const { company_id } = req;
            const { user_id } = req.params;
            if (!user_id) {
                return res.status(400).json({ error: ["user_id is required"] });
            }
            const { page = 1 } = req.query;
            const notifications = await Notification.findAll({
                where: { user_id, company_id },
                order: [["createdAt", "DESC"]],
                limit: pageSize,
                offset: (page - 1) * pageSize,
            });
            const total = await Notification.count({ where: { user_id, company_id } });
            res.status(200).json({ notifications, total });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ error: [error.message] });
        }
    },

    updateSeenNotification: async (req, res) => {
        try {
            const { company_id } = req;
            const { user_id } = req.params;
            if (!user_id) {
                return res.status(400).json({ error: ["user_id is required"] });
            }
            const notifications = await Notification.findAll({
                where: { user_id, company_id, seen: false },
            });
            if (!notifications.length) {
                return res.status(404).json({ error: ["Notification not found"] });
            }
            await Notification.update({ seen: true }, { where: { user_id, company_id } });
            res.status(200).json({ message: "Notification updated" });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ error: [error.message] });
        }
    }
};

