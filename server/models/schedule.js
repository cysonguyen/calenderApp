const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

const Schedule = sequelize.define(
  "Schedule",
  {
    title: { type: DataTypes.STRING(255), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    start_time: { type: DataTypes.DATE, allowNull: false },
    end_time: { type: DataTypes.DATE, allowNull: false },
    is_repeat: { type: DataTypes.BOOLEAN, allowNull: false },
    interval: { type: DataTypes.STRING(50), allowNull: true },
    intervalCount: { type: DataTypes.INTEGER, allowNull: true },
    cycle_edited: { type: DataTypes.TEXT, allowNull: true },
    when_expires: { type: DataTypes.DATE, allowNull: true },
  },
  { timestamps: true }
);

module.exports = Schedule;
