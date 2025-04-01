'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Schedules", {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      title: { type: Sequelize.STRING(255), allowNull: false },
      description: { type: Sequelize.TEXT, allowNull: true },
      start_time: { type: Sequelize.DATE, allowNull: false },
      end_time: { type: Sequelize.DATE, allowNull: false },
      is_repeat: { type: Sequelize.BOOLEAN, allowNull: false },
      interval: { type: Sequelize.STRING(50), allowNull: true },
      intervalCount: { type: Sequelize.INTEGER, allowNull: true },
      cycle_edited: { type: Sequelize.TEXT, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable("Schedules");
  }
};
