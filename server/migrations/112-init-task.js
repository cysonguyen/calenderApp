'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('Tasks', {
            id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
            job_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: 'Jobs', key: 'id' },
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
            deadline: {
                type: Sequelize.DATE,
                allowNull: true,
            },
            done_at: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            status: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            assignee_id: {
                type: Sequelize.STRING,
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
