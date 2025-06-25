import { raw } from "body-parser";
import db from "../models/index";
let getTopDoctorHome = (limit) => {
  return new Promise(async (resolve, reject) => {
    try {
      let user = await db.User.findAll({
        limit: limit,
        where: { roleId: "R2" }, // R2 is the role for doctors
        order: [["createdAt", "DESC"]],
        attributes: {
          exclude: ["password"],
        },
        include: [
          {
            model: db.Allcode,
            as: "positionData",
            attributes: ["valueEn", "valueVi"],
          },
          {
            model: db.Allcode,
            as: "genderData",
            attributes: ["valueEn", "valueVi"],
          },
        ],
        raw: true,
        nest: true,
      });

      resolve({
        errCode: 0,
        data: user,
      });
    } catch (error) {
      reject(error);
    }
  });
};
module.exports = {
  getTopDoctorHome,
};
