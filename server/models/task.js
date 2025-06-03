const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

const Task = sequelize.define(
    "Task",
    {
        title: { type: DataTypes.STRING(255), allowNull: false },
        description: { type: DataTypes.TEXT, allowNull: true },
        status: { type: DataTypes.STRING, allowNull: false },
        deadline: { type: DataTypes.DATE, allowNull: true },
        assignee_id: { type: DataTypes.INTEGER, allowNull: true },
        done_at: { type: DataTypes.INTEGER, allowNull: true },
        company_id: { type: DataTypes.INTEGER, allowNull: false },
    },
    { timestamps: true }
);

module.exports = Task;
