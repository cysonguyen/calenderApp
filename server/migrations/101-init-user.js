"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Users", {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      company_id: { type: Sequelize.INTEGER, allowNull: false },
      username: { type: Sequelize.STRING(50), allowNull: false, unique: true },
      full_name: { type: Sequelize.STRING(255), allowNull: false },
      email: { type: Sequelize.STRING(50), allowNull: false, unique: true },
      password: { type: Sequelize.STRING(255), allowNull: false },
      msnv: { type: Sequelize.STRING(255), allowNull: true },
      level: { type: Sequelize.STRING(255), allowNull: true },
      work_place: { type: Sequelize.STRING(255), allowNull: true },
      birth_day: { type: Sequelize.DATE, allowNull: true },
      role: { type: Sequelize.STRING(50), allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable("Users");
  }
};
