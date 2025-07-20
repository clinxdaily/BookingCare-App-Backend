import db from "../models/index";
let createSpecialty = async (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (
        !data.name ||
        !data.imgBase64 ||
        !data.descriptionHTML ||
        !data.descriptionMarkdown
      ) {
        resolve({
          errCode: 1,
          errMessage: "Missing required parameters",
        });
      } else {
        // Assuming db.Specialty is the model for specialties
        let specialty = await db.Specialty.create({
          name: data.name,
          image: data.imgBase64,
          descriptionHTML: data.descriptionHTML,
          descriptionMarkdown: data.descriptionMarkdown,
        });
        if (specialty) {
          resolve({
            errCode: 0,
            errMessage: "Create specialty succeed",
            specialty: specialty,
          });
        } else {
          resolve({
            errCode: 2,
            errMessage: "Error creating specialty",
          });
        }
      }
    } catch (error) {
      reject(error);
    }
  });
};
let editSpecialty = async (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.id) {
        return resolve({
          errCode: 1,
          errMessage: "Missing required parameter: id",
        });
      }

      let specialty = await db.Specialty.findOne({
        where: { id: data.id },
        raw: false, // phải false để có instance .save()
      });

      if (!specialty) {
        return resolve({
          errCode: 2,
          errMessage: "Specialty not found",
        });
      }

      // Cập nhật có điều kiện
      if (data.name !== undefined) specialty.name = data.name;
      if (data.descriptionHTML !== undefined)
        specialty.descriptionHTML = data.descriptionHTML;
      if (data.descriptionMarkdown !== undefined)
        specialty.descriptionMarkdown = data.descriptionMarkdown;
      // Nếu người dùng không chọn ảnh mới thì đừng ghi đè rỗng
      if (data.imgBase64 !== undefined && data.imgBase64 !== "")
        specialty.image = data.imgBase64;

      await specialty.save();

      return resolve({
        errCode: 0,
        errMessage: "Update specialty succeed",
        specialty,
      });
    } catch (e) {
      reject(e);
    }
  });
};
let deleteSpecialty = async (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!id) {
        return resolve({
          errCode: 1,
          errMessage: "Missing required parameter: id",
        });
      }

      let specialty = await db.Specialty.findOne({
        where: { id: id },
      });

      if (!specialty) {
        return resolve({
          errCode: 2,
          errMessage: "Specialty not found",
        });
      }

      await db.Specialty.destroy({
        where: { id: id },
      });

      return resolve({
        errCode: 0,
        errMessage: "Delete specialty succeed",
      });
    } catch (e) {
      reject(e);
    }
  });
};

let getAllSpecialty = async () => {
  return new Promise(async (resolve, reject) => {
    try {
      let data = await db.Specialty.findAll({});
      if (data && data.length > 0) {
        data.map((item) => {
          item.image = Buffer.from(item.image, "base64").toString("binary");
          return item;
        });
      }
      resolve({
        errCode: 0,
        errMessage: "Get all specialties succeed",
        data: data,
      });
    } catch (error) {
      reject(error);
    }
  });
};
let getDetailSpecialtyByID = async (inputId, location) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!inputId || !location) {
        resolve({
          errCode: 1,
          errMessage: "Missing required parameters",
        });
      } else {
        let data = await db.Specialty.findOne({
          where: { id: inputId },
          attributes: ["descriptionHTML", "descriptionMarkdown"],
        });
        if (data) {
          let doctorSpecialty = [];
          if (location === "ALL") {
            doctorSpecialty = await db.Doctor_Info.findAll({
              where: { specialtyId: inputId },
              attributes: ["doctorId", "provinceId"],
            });
          } else {
            doctorSpecialty = await db.Doctor_Info.findAll({
              where: { specialtyId: inputId, provinceId: location },
              attributes: ["doctorId", "provinceId"],
            });
          }

          data.doctorSpecialty = doctorSpecialty;
        } else {
          data = {};
        }
        resolve({
          errCode: 0,
          errMessage: "Get specialty details succeed",
          data,
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};
module.exports = {
  createSpecialty: createSpecialty,
  getAllSpecialty: getAllSpecialty,
  getDetailSpecialtyByID: getDetailSpecialtyByID,
  editSpecialty: editSpecialty,
  deleteSpecialty: deleteSpecialty,
};
