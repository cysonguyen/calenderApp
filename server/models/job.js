const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

const Job = sequelize.define(
  "Job",
  {
    company_id: { type: DataTypes.INTEGER, allowNull: false },
    title: { type: DataTypes.STRING(255), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    cycle_start: { type: DataTypes.INTEGER, allowNull: false },
    cycle_end: { type: DataTypes.INTEGER, allowNull: true },
    deadline: { type: DataTypes.DATE, allowNull: true },
    status: { type: DataTypes.STRING, allowNull: false },
  },
  { timestamps: true }
);

module.exports = Job;
