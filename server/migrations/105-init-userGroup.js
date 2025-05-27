'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("User_Groups", {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      user_id: { 
        type: Sequelize.INTEGER, 
        allowNull: false,
        references: { model: "Users", key: "id" },
        onDelete: "CASCADE"
      },
      group_id: { 
        type: Sequelize.INTEGER, 
        allowNull: false,
        references: { model: "Groups", key: "id" },
        onDelete: "CASCADE"
      },
      company_id: { type: Sequelize.INTEGER, allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable("User_Groups");
  }
};
