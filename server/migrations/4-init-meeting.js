'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Meetings", {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      schedule_id: { 
        type: Sequelize.INTEGER, 
        allowNull: false,
        references: { model: "Schedules", key: "id" },
        onDelete: "CASCADE"
      },
      title: { type: Sequelize.STRING(255), allowNull: false },
      description: { type: Sequelize.TEXT, allowNull: true },
      report: { type: Sequelize.TEXT, allowNull: true },
      start_time: { type: Sequelize.DATE, allowNull: false },
      end_time: { type: Sequelize.DATE, allowNull: false },
      list_partner_ids: { type: Sequelize.TEXT, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable("Meetings");
  }
};
