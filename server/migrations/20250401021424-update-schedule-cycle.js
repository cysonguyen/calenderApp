'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('MeetingCycles', 'start_time', {
      type: Sequelize.DATE,
      allowNull: false,
    });
    await queryInterface.changeColumn('MeetingCycles', 'end_time', {
      type: Sequelize.DATE,
      allowNull: false,
    });

    await queryInterface.changeColumn('Schedules', 'start_time', {
      type: Sequelize.DATE,
      allowNull: false,
    });
    await queryInterface.changeColumn('Schedules', 'end_time', {
      type: Sequelize.DATE,
      allowNull: false,
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('MeetingCycles', 'start_time', {
      type: Sequelize.TIME,
      allowNull: false,
    });
    await queryInterface.changeColumn('MeetingCycles', 'end_time', {
      type: Sequelize.TIME,
      allowNull: false,
    });

    await queryInterface.changeColumn('Schedules', 'start_time', {
      type: Sequelize.TIME,
      allowNull: false,
    });
    await queryInterface.changeColumn('Schedules', 'end_time', {
      type: Sequelize.TIME,
      allowNull: false,
    });
  }
};
