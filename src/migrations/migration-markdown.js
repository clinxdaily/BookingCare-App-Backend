"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("markdowns", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      contentHTML: {
        allowNull: false,

        type: Sequelize.TEXT("long"),
      },
      contentMarkdown: {
        allowNull: false,

        type: Sequelize.TEXT("long"),
      },
      description: {
        allowNull: true,

        type: Sequelize.TEXT("long"),
      },

      doctorId: {
        allowNull: true,

        type: Sequelize.INTEGER,
      },
      specialtyId: {
        allowNull: true,

        type: Sequelize.INTEGER,
      },
      clinicId: {
        allowNull: true,

        type: Sequelize.INTEGER,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal(
          "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
        ),
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("markdowns");
  },
};
