'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('Jobs', {
            id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
            schedule_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: 'Schedules', key: 'id' },
                onDelete: 'CASCADE'
            },
            company_id: { type: Sequelize.INTEGER, allowNull: false },
            title: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            description: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            cycle_start: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            cycle_end: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            status: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            deadline: {
                type: Sequelize.DATE,
                allowNull: true,
            },
            createdAt: { type: Sequelize.DATE, allowNull: false },
            updatedAt: { type: Sequelize.DATE, allowNull: false }
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('Schedules_Groups');
    }
};
