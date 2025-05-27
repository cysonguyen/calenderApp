const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

const Company = sequelize.define(
    "Company",
    {
        name: { type: DataTypes.STRING(255), allowNull: false },
        address: { type: DataTypes.TEXT, allowNull: true },
        phone: { type: DataTypes.STRING(255), allowNull: true },
        email: { type: DataTypes.STRING(255), allowNull: true },
        website: { type: DataTypes.STRING(255), allowNull: true },
        description: { type: DataTypes.TEXT, allowNull: true },
    },
    { timestamps: true }
);

module.exports = Company;
