const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

const JobUser = sequelize.define(
    "Job_User",
    {
        user_id: { type: DataTypes.INTEGER, allowNull: false },
        job_id: { type: DataTypes.INTEGER, allowNull: false },
        company_id: { type: DataTypes.INTEGER, allowNull: false },
    },
    { timestamps: true }
);

module.exports = JobUser;
