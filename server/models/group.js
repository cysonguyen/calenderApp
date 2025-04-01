const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

const Group = sequelize.define(
  "Group",
  {
    name: { type: DataTypes.STRING(255), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
  },
  { timestamps: true }
);

module.exports = Group;
