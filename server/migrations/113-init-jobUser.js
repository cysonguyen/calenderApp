'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Job_Users", {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      job_id: { 
        type: Sequelize.INTEGER, 
        allowNull: false,
        references: { model: "Jobs", key: "id" },
        onDelete: "CASCADE"
      },
      user_id: { 
        type: Sequelize.INTEGER, 
        allowNull: false,
        references: { model: "Users", key: "id" },
        onDelete: "CASCADE"
      },
      company_id: { type: Sequelize.INTEGER, allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable("Job_Users");
  }
};
