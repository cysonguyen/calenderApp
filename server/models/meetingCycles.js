const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

const MeetingCycle = sequelize.define(
    "MeetingCycle",
    {
        schedule_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        start_time: { type: DataTypes.DATE, allowNull: false },
        end_time: { type: DataTypes.DATE, allowNull: false },
        cycle_index: { type: DataTypes.INTEGER, allowNull: false },
        company_id: { type: DataTypes.INTEGER, allowNull: false },
    },
    { timestamps: true }
);

module.exports = MeetingCycle;
