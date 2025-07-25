import db from "../models/index";
let createClinic = async (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (
        !data.name ||
        !data.address ||
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
        let specialty = await db.Clinic.create({
          name: data.name,
          address: data.address,
          image: data.imgBase64,
          descriptionHTML: data.descriptionHTML,
          descriptionMarkdown: data.descriptionMarkdown,
        });
        if (specialty) {
          resolve({
            errCode: 0,
            errMessage: "Create clinic succeed",
            specialty: specialty,
          });
        } else {
          resolve({
            errCode: 2,
            errMessage: "Error creating clinic",
          });
        }
      }
    } catch (error) {
      reject(error);
    }
  });
};
let getAllClinic = async () => {
  return new Promise(async (resolve, reject) => {
    try {
      let data = await db.Clinic.findAll({});
      if (data && data.length > 0) {
        data.map((item) => {
          item.image = Buffer.from(item.image, "base64").toString("binary");
          return item;
        });
      }
      resolve({
        errCode: 0,
        errMessage: "Get all clinics succeed",
        data: data,
      });
    } catch (error) {
      reject(error);
    }
  });
};
let editClinic = async (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (
        !data.id ||
        !data.name ||
        !data.address ||
        !data.imgBase64 ||
        !data.descriptionHTML ||
        !data.descriptionMarkdown
      ) {
        resolve({
          errCode: 1,
          errMessage: "Missing required parameters",
        });
      } else {
        let clinic = await db.Clinic.findOne({
          where: { id: data.id },
          raw: false,
        });
        if (clinic) {
          clinic.name = data.name;
          clinic.address = data.address;
          clinic.image = data.imgBase64;
          clinic.descriptionHTML = data.descriptionHTML;
          clinic.descriptionMarkdown = data.descriptionMarkdown;

          await clinic.save();
          resolve({
            errCode: 0,
            errMessage: "Update clinic succeed",
            clinic: clinic,
          });
        } else {
          resolve({
            errCode: 2,
            errMessage: "Clinic not found",
          });
        }
      }
    } catch (error) {
      reject(error);
    }
  });
};
let deleteClinic = async (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!id) {
        resolve({
          errCode: 1,
          errMessage: "Missing required parameters",
        });
      } else {
        let clinic = await db.Clinic.findOne({
          where: { id: id },
        });
        if (clinic) {
          await db.Clinic.destroy({
            where: { id: id },
          });
          resolve({
            errCode: 0,
            errMessage: "Delete clinic succeed",
          });
        } else {
          resolve({
            errCode: 2,
            errMessage: "Clinic not found",
          });
        }
      }
    } catch (error) {
      reject(error);
    }
  });
};
let getDetailClinicByID = async (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!id) {
        resolve({
          errCode: 1,
          errMessage: "Missing required parameters",
        });
      } else {
        let data = await db.Clinic.findOne({
          where: { id: id },
          attributes: [
            "name",
            "address",
            "descriptionHTML",
            "descriptionMarkdown",
          ],
        });
        if (data) {
          let doctorClinic = [];
          doctorClinic = await db.Doctor_Info.findAll({
            where: { clinicId: id },
            attributes: ["doctorId", "provinceId"],
          });
          data.doctorClinic = doctorClinic;
        } else {
          data = {};
        }
        resolve({
          errCode: 0,
          errMessage: "Get clinic details succeed",
          data: data,
        });
      }
    } catch (error) {
      console.error("Error in getDetailClinicByID:", error);
      reject(error);
    }
  });
};
module.exports = {
  createClinic: createClinic,
  getAllClinic: getAllClinic,
  getDetailClinicByID: getDetailClinicByID,
  editClinic: editClinic,
  deleteClinic: deleteClinic,
};
