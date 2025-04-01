const { Notification } = require("../models");

module.exports = {
    getAllNotification: async (req, res) => {
        try {
            const { user_id } = req.params;
            if (!user_id) {
                return res.status(400).json({ error: ["user_id is required"] });
            }
            const notifications = await Notification.findAll({
                where: { user_id },
                order: [["createdAt", "DESC"]],
            });
            res.status(200).json(notifications);
        } catch (error) {
            console.log(error);
            return res.status(500).json({ error: [error.message] });
        }
    },

    updateNotification: async (req, res) => {
        try {
            const { notification_id } = req.params;
            const { is_seen } = req.body;
            if (!notification_id) {
                return res.status(400).json({ error: ["notification_id is required"] });
            }
            const notification = await Notification.findByPk(notification_id);
            if (!notification) {
                return res.status(404).json({ error: ["Notification not found"] });
            }
            await notification.update({ seen: is_seen });
            res.status(200).json(notification);
        } catch (error) {
            console.log(error);
            return res.status(500).json({ error: [error.message] });
        }
    }
};

