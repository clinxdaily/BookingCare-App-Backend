"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class History extends Model {
    static associate(models) {
      History.belongsTo(models.Booking, {
        foreignKey: "bookingId",
        as: "bookingData",
      });
    }
  }
  History.init(
    {
      bookingId: DataTypes.INTEGER,
      patientId: DataTypes.INTEGER,
      doctorId: DataTypes.INTEGER,
      type: DataTypes.STRING,
      description: DataTypes.TEXT,
      initialDiagnosis: DataTypes.TEXT,
      conclusion: DataTypes.TEXT,
      medicines: DataTypes.TEXT, // JSON stringify danh sách thuốc
      images: DataTypes.TEXT, // JSON stringify danh sách ảnh base64 hoặc URL
    },
    {
      sequelize,
      modelName: "History",
    }
  );
  return History;
};
