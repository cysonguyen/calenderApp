'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("MeetingCycles", {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      schedule_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "Schedules", key: "id" },
        onDelete: "CASCADE"
      },
      start_time: { type: Sequelize.DATE, allowNull: false },
      end_time: { type: Sequelize.DATE, allowNull: false },
      cycle_index: { type: Sequelize.INTEGER, allowNull: false },
      company_id: { type: Sequelize.INTEGER, allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable("MeetingCycles");F
  }
};
