const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

const ScheduleGroup = sequelize.define(
    "Schedule_Group",
    {
        group_id: { type: DataTypes.INTEGER, allowNull: false },
        schedule_id: { type: DataTypes.INTEGER, allowNull: false },
        company_id: { type: DataTypes.INTEGER, allowNull: false },
    },
    { timestamps: true }
);

module.exports = ScheduleGroup;
