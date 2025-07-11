"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Allcode extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Allcode.hasMany(models.User, {
        foreignKey: "positionId",
        as: "positionData", // alias for association
      });
      Allcode.hasMany(models.User, {
        foreignKey: "gender",
        as: "genderData", // alias for association
      });
      Allcode.hasMany(models.Schedule, {
        foreignKey: "timeType",
        as: "timeTypeData", // alias for association
      });
      Allcode.hasMany(models.Booking, {
        foreignKey: "timeType",
        as: "timeTypeDataPatient", // alias for association
      });
      Allcode.hasMany(models.Doctor_Info, {
        foreignKey: "priceId",
        as: "priceTypeData", // alias for association
      });
      Allcode.hasMany(models.Doctor_Info, {
        foreignKey: "provinceId",
        as: "provinceTypeData", // alias for association
      });
      Allcode.hasMany(models.Doctor_Info, {
        foreignKey: "paymentId",
        as: "paymentTypeData", // alias for association
      });
    }
  }
  Allcode.init(
    {
      keyMap: DataTypes.STRING,
      type: DataTypes.STRING,
      valueEn: DataTypes.STRING,
      valueVi: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Allcode",
    }
  );
  return Allcode;
};
