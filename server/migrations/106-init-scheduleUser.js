'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Schedule_Users", {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      user_id: { 
        type: Sequelize.INTEGER, 
        allowNull: false,
        references: { model: "Users", key: "id" },
        onDelete: "CASCADE"
      },
      schedule_id: { 
        type: Sequelize.INTEGER, 
        allowNull: false,
        references: { model: "Schedules", key: "id" },
        onDelete: "CASCADE"
      },
      company_id: { type: Sequelize.INTEGER, allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable("Schedule_Users");
  }
};
