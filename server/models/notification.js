const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

const Notification = sequelize.define("Notification", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    message: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    seen: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    company_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    }
}, { timestamps: true });

module.exports = Notification;
