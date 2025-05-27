'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Schedules_Groups', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      schedule_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Schedules', key: 'id' },
        onDelete: 'CASCADE'
      },
      group_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Groups', key: 'id' },
        onDelete: 'CASCADE'
      },
      company_id: { type: Sequelize.INTEGER, allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Schedules_Groups');
  }
};
