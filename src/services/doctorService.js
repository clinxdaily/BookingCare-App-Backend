import { raw } from "body-parser";
import db from "../models/index";
import { where } from "sequelize";
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
let getAllDoctor = () => {
  return new Promise(async (resolve, reject) => {
    try {
      let doctor = await db.User.findAll({
        where: { roleId: "R2" }, // R2 is the role for doctors
        attributes: {
          exclude: ["password", "image"], // Exclude password and image from the response
        },
      });
      resolve({
        errCode: 0,
        data: doctor,
      });
    } catch (error) {
      reject(error);
    }
  });
};
let postInfoDoctor = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.doctorId || !data.contentHTML || !data.contentMarkdown) {
        resolve({
          errCode: 1,
          message: "Missing required parameters",
        });
      } else {
        // if (data.action === "CREATE") {
        //   await db.Markdown.create({
        //     contentHTML: data.contentHTML,
        //     contentMarkdown: data.contentMarkdown,
        //     description: data.description,
        //     doctorId: data.doctorId,
        //   });
        // } else if (data.action === "EDIT") {
        //   let doctorMarkdown = await db.Markdown.findOne({
        //     where: { doctorId: data.doctorId },
        //     raw: false,
        //   });
        //   if (doctorMarkdown) {
        //     doctorMarkdown.contentHTML = data.contentHTML;
        //     doctorMarkdown.contentMarkdown = data.contentMarkdown;
        //     doctorMarkdown.description = data.description;
        //     await doctorMarkdown.save();
        //   }
        // }
        await db.Markdown.create({
          contentHTML: data.contentHTML,
          contentMarkdown: data.contentMarkdown,
          description: data.description,
          doctorId: data.doctorId,
        });
        resolve({
          errCode: 0,
          message: "Save info doctor succeed",
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};
let getDetailDoctorById = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (id === undefined || id === null) {
        resolve({
          errCode: 1,
          message: "Missing required parameters",
        });
      } else {
        let data = await db.User.findOne({
          where: { id: id },
          attributes: {
            exclude: ["password"],
          },
          include: [
            {
              model: db.Markdown,
              attributes: ["contentHTML", "contentMarkdown", "description"],
            },
            {
              model: db.Allcode,
              as: "positionData",
              attributes: ["valueEn", "valueVi"],
            },
          ],
          raw: false,
          nest: true,
        });
        if (data && data.image) {
          data.image = Buffer.from(data.image, "base64").toString("binary");
        }
        if (!data) {
          data = {};
        }
        resolve({
          errCode: 0,
          data: data ? data : {},
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};
module.exports = {
  getTopDoctorHome,
  getAllDoctor,
  postInfoDoctor,
  getDetailDoctorById,
};
