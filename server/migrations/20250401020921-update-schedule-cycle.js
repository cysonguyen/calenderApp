'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('MeetingCycles', 'start_time', {
      type: Sequelize.TIME,
      allowNull: false,
    });
    await queryInterface.changeColumn('MeetingCycles', 'end_time', {
      type: Sequelize.TIME,
      allowNull: false,
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('meeting_cycles', 'start_time', {
      type: Sequelize.DATE,
      allowNull: false,
    });
    await queryInterface.changeColumn('meeting_cycles', 'end_time', {
      type: Sequelize.DATE,
      allowNull: false,
    });
  }
};
