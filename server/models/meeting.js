const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

const Meeting = sequelize.define(
  "Meeting",
  {
    meeting_cycle_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    title: { type: DataTypes.STRING(255), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    report: { type: DataTypes.TEXT, allowNull: true },
    start_time: { type: DataTypes.DATE, allowNull: false },
    end_time: { type: DataTypes.DATE, allowNull: false },
    list_partner_ids: { type: DataTypes.TEXT, allowNull: true },
    company_id: { type: DataTypes.INTEGER, allowNull: false },
  },
  { timestamps: true }
);

module.exports = Meeting;
