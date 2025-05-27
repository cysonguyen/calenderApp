const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

const Schedule = sequelize.define(
  "Schedule",
  {
    author_id: { type: DataTypes.INTEGER, allowNull: false },
    title: { type: DataTypes.STRING(255), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    start_time: { type: DataTypes.DATE, allowNull: false },
    end_time: { type: DataTypes.DATE, allowNull: false },
    is_repeat: { type: DataTypes.BOOLEAN, allowNull: false },
    interval: { type: DataTypes.STRING(50), allowNull: true },
    interval_count: { type: DataTypes.INTEGER, allowNull: true },
    cycle_edited: { type: DataTypes.TEXT, allowNull: true },
    when_expired: { type: DataTypes.DATE, allowNull: true },
    accepted_ids: { type: DataTypes.TEXT, allowNull: false, defaultValue: `[]` },
    company_id: { type: DataTypes.INTEGER, allowNull: false },
  },
  { timestamps: true }
);

module.exports = Schedule;
