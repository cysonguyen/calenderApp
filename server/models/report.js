const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

const Report = sequelize.define(
    "Report",
    {
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        meeting_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        content: { type: DataTypes.TEXT, allowNull: false },
        createdAt: { type: DataTypes.DATE, allowNull: false },
        updatedAt: { type: DataTypes.DATE, allowNull: false },
        company_id: { type: DataTypes.INTEGER, allowNull: false },
    },
    { timestamps: true }
);

module.exports = Report;
