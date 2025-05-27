"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable("Companies", {
            id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
            name: { type: Sequelize.STRING(255), allowNull: false },
            address: { type: Sequelize.TEXT, allowNull: true },
            phone: { type: Sequelize.STRING(255), allowNull: true },
            email: { type: Sequelize.STRING(50), allowNull: true },
            website: { type: Sequelize.STRING(255), allowNull: true },
            description: { type: Sequelize.TEXT, allowNull: true },
            createdAt: { type: Sequelize.DATE, allowNull: false },
            updatedAt: { type: Sequelize.DATE, allowNull: false }
        });
    },

    down: async (queryInterface) => {
        await queryInterface.dropTable("Companies");
    }
};
