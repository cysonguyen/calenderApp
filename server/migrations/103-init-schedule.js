"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Schedules", {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      author_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      title: { type: Sequelize.STRING(255), allowNull: false },
      company_id: { type: Sequelize.INTEGER, allowNull: false },
      description: { type: Sequelize.TEXT, allowNull: true },
      start_time: { type: Sequelize.DATE, allowNull: false },
      end_time: { type: Sequelize.DATE, allowNull: false },
      is_repeat: { type: Sequelize.BOOLEAN, allowNull: false },
      interval: { type: Sequelize.STRING(50), allowNull: true },
      interval_count: { type: Sequelize.INTEGER, allowNull: true },
      cycle_edited: { type: Sequelize.TEXT, allowNull: true },
      when_expired: { type: Sequelize.DATE, allowNull: true },
      accepted_ids: { type: Sequelize.TEXT, allowNull: false, defaultValue: `[]` },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable("Schedules");
  },
};
