const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

const ScheduleUser = sequelize.define(
  "Schedule_User",
  {
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    schedule_id: { type: DataTypes.INTEGER, allowNull: false },
    company_id: { type: DataTypes.INTEGER, allowNull: false },
  },
  { timestamps: true }
);

module.exports = ScheduleUser;
