const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

const User = sequelize.define(
  "User",
  {
    full_name: { type: DataTypes.STRING(255), allowNull: false },
    username: { type: DataTypes.STRING(50), allowNull: false, unique: true },
    email: { type: DataTypes.STRING(50), allowNull: false, unique: true },
    password: { type: DataTypes.STRING(255), allowNull: false },
    msnv: { type: DataTypes.STRING(255), allowNull: true },
    level: { type: DataTypes.STRING(255), allowNull: true },
    work_place: { type: DataTypes.STRING(255), allowNull: true },
    birth_day: { type: DataTypes.DATE, allowNull: true },
    role: { type: DataTypes.STRING(50), allowNull: false },
    company_id: { type: DataTypes.INTEGER, allowNull: false },
  },
  { timestamps: true }
);

module.exports = User;
