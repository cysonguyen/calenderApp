const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

const UserGroup = sequelize.define(
  "User_Group",
  {
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    group_id: { type: DataTypes.INTEGER, allowNull: false },
    company_id: { type: DataTypes.INTEGER, allowNull: false },
  },
  { timestamps: true }
);

module.exports = UserGroup;
