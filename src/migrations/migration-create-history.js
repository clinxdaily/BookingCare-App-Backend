"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("histories", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      bookingId: {
        type: Sequelize.INTEGER,
        references: {
          model: "Bookings", // name of the table
          key: "id", // key in the referenced table
        },
        onDelete: "CASCADE", // optional, define behavior on delete
      },
      patientId: {
        type: Sequelize.INTEGER,
      },
      doctorId: {
        type: Sequelize.INTEGER,
      },
      type: {
        type: Sequelize.STRING,
      },
      description: {
        type: Sequelize.TEXT,
      },
      initialDiagnosis: {
        type: Sequelize.TEXT,
      },
      conclusion: {
        type: Sequelize.TEXT,
      },
      medicines: {
        type: Sequelize.TEXT, // JSON string
      },
      images: {
        type: Sequelize.TEXT, // JSON string
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("histories");
  },
};
