import { raw } from "body-parser";
import db from "../models/index";
import { where } from "sequelize";
require("dotenv").config();
import _, { includes, reject } from "lodash";
import clinic from "../models/clinic";
import emailService from "./emailService";
const MAX_NUMBER_SCHEDULE = process.env.MAX_NUMBER_SCHEDULE;
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
let getAllDoctor = async () => {
  return new Promise(async (resolve, reject) => {
    try {
      let doctors = await db.User.findAll({
        where: { roleId: "R2" },
        attributes: { exclude: ["password"] },
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
        raw: false,
        nest: true,
      });

      if (doctors && doctors.length > 0) {
        doctors.map((item) => {
          if (item) {
            // Convert ảnh từ base64 -> data URI
            item.image = Buffer.from(item.image, "base64").toString("binary");
            return item;
          }
        });
      }

      resolve({
        errCode: 0,
        errMessage: "Get all doctors succeed",
        data: doctors,
      });
    } catch (error) {
      console.error("Error in getAllDoctor: ", error);
      reject(error);
    }
  });
};

let postInfoDoctor = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (
        !data.doctorId ||
        !data.contentHTML ||
        !data.contentMarkdown ||
        !data.selectedPrice ||
        !data.selectedPayment ||
        !data.selectedProvince ||
        !data.nameClinic ||
        !data.addressClinic ||
        !data.note
      ) {
        resolve({
          errCode: 1,
          message: "Missing required parameters",
        });
      } else {
        if (data.action === "CREATE") {
          await db.Markdown.create({
            contentHTML: data.contentHTML,
            contentMarkdown: data.contentMarkdown,
            description: data.description,
            doctorId: data.doctorId,
          });
        } else if (data.action === "EDIT") {
          let doctorMarkdown = await db.Markdown.findOne({
            where: { doctorId: data.doctorId },
            raw: false,
          });
          if (doctorMarkdown) {
            doctorMarkdown.contentHTML = data.contentHTML;
            doctorMarkdown.contentMarkdown = data.contentMarkdown;
            doctorMarkdown.description = data.description;
            doctorMarkdown.updatedAt = new Date();
            await doctorMarkdown.save();
          }
        }
        let doctorInfo = await db.Doctor_Info.findOne({
          where: {
            doctorId: data.doctorId,
          },
          raw: false,
        });
        if (doctorInfo) {
          doctorInfo.doctorId = data.doctorId;
          doctorInfo.priceId = data.selectedPrice;
          doctorInfo.provinceId = data.selectedProvince;
          doctorInfo.paymentId = data.selectedPayment;
          doctorInfo.nameClinic = data.nameClinic;
          doctorInfo.addressClinic = data.addressClinic;
          doctorInfo.note = data.note;
          doctorInfo.specialtyId = data.specialtyId;
          doctorInfo.clinicId = data.clinicId;
          await doctorInfo.save();
        } else {
          await db.Doctor_Info.create({
            doctorId: data.doctorId,
            priceId: data.selectedPrice,
            provinceId: data.selectedProvince,
            paymentId: data.paymentId,
            nameClinic: data.nameClinic,
            addressClinic: data.addressClinic,
            note: data.note,
            specialtyId: data.specialtyId,
            clinicId: data.clinicId,
          });
        }
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
            {
              model: db.Doctor_Info,
              attributes: {
                exclude: ["id", "doctorId"],
              },
              include: [
                {
                  model: db.Allcode,
                  as: "priceTypeData",
                  attributes: ["valueEn", "valueVi"],
                },
                {
                  model: db.Allcode,
                  as: "provinceTypeData",
                  attributes: ["valueEn", "valueVi"],
                },
                {
                  model: db.Allcode,
                  as: "paymentTypeData",
                  attributes: ["valueEn", "valueVi"],
                },
              ],
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
let bulkCreateSchedule = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.arrSchedule || !data.doctorId || !data.formattedDate) {
        return resolve({
          errCode: 1,
          errMessage: "Missing required parameters",
        });
      }

      let schedule = data.arrSchedule.map((item) => ({
        ...item,
        maxNumber: MAX_NUMBER_SCHEDULE,
      }));

      // Lấy các lịch đã tồn tại
      let existing = await db.Schedule.findAll({
        where: {
          doctorId: data.doctorId,
          date: data.formattedDate,
        },
        attributes: ["timeType", "date", "doctorId", "maxNumber"],
        raw: true,
      });

      // So sánh và chỉ lấy những lịch mới chưa có
      let toCreate = _.differenceWith(schedule, existing, (a, b) => {
        return a.timeType === b.timeType && +a.date === +b.date;
      });

      // Nếu không có gì để tạo
      if (!toCreate || toCreate.length === 0) {
        return resolve({
          errCode: 0,
          errMessage: "No new schedule to create",
        });
      }

      // Nếu có thì tạo
      await db.Schedule.bulkCreate(toCreate);

      return resolve({
        errCode: 0,
        errMessage: "Create schedules successfully",
      });
    } catch (error) {
      console.error("Error in bulkCreateSchedule:", error);
      return reject(error);
    }
  });
};
let getScheduleDoctorByDate = (doctorId, date) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!doctorId || !date) {
        resolve({
          errCode: 1,
          errMessage: "Missing required parameters",
        });
      } else {
        let data = await db.Schedule.findAll({
          where: {
            doctorId: doctorId,
            date: date,
          },
          include: [
            {
              model: db.Allcode,
              as: "timeTypeData",
              attributes: ["valueEn", "valueVi"],
            },
            {
              model: db.User,
              as: "doctorData",
              attributes: ["firstName", "lastName"],
            },
          ],
          raw: false,
          nest: true,
        });
        if (!data) {
          data = [];
        }
        resolve({ errCode: 0, data: data });
      }
    } catch (error) {
      reject(error);
    }
  });
};
let getExtraInfoDoctorById = (doctorId) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!doctorId) {
        resolve({ errCode: 1, errMessage: "Missing required parameters " });
      } else {
        let data = await db.Doctor_Info.findOne({
          where: { doctorId: doctorId },
          attributes: {
            exclude: ["id", "doctorId"],
          },
          include: [
            {
              model: db.Allcode,
              as: "priceTypeData",
              attributes: ["valueEn", "valueVi"],
            },
            {
              model: db.Allcode,
              as: "provinceTypeData",
              attributes: ["valueEn", "valueVi"],
            },
            {
              model: db.Allcode,
              as: "paymentTypeData",
              attributes: ["valueEn", "valueVi"],
            },
          ],
          raw: false,
          nest: true,
        });
        if (!data) data = {};
        resolve({ errCode: 0, data: data });
      }
    } catch (error) {
      reject(error);
    }
  });
};
let getProfileDoctorById = (doctorId) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!doctorId) {
        resolve({ errCode: 1, errMessage: "Missing required parameters " });
      } else {
        let data = await db.User.findOne({
          where: { id: doctorId },
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
            {
              model: db.Doctor_Info,
              attributes: {
                exclude: ["id", "doctorId"],
              },
              include: [
                {
                  model: db.Allcode,
                  as: "priceTypeData",
                  attributes: ["valueEn", "valueVi"],
                },
                {
                  model: db.Allcode,
                  as: "provinceTypeData",
                  attributes: ["valueEn", "valueVi"],
                },
                {
                  model: db.Allcode,
                  as: "paymentTypeData",
                  attributes: ["valueEn", "valueVi"],
                },
              ],
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
let getListPatientForDoctor = (doctorId, date) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!doctorId || !date) {
        resolve({
          errCode: 1,
          errMessage: "Missing required parameters",
        });
      } else {
        let data = await db.Booking.findAll({
          where: {
            statusId: "S2", // S2 is the status for confirmed appointments
            doctorId: doctorId,
            date: date,
          },
          include: [
            {
              model: db.User,
              as: "patientData",
              attributes: ["firstName", "address", "email", "gender"],
              include: [
                {
                  model: db.Allcode,
                  as: "genderData",
                  attributes: ["valueEn", "valueVi"],
                },
              ],
            },
            {
              model: db.Allcode,
              as: "timeTypeDataPatient",
              attributes: ["valueEn", "valueVi"],
            },
          ],
          raw: false,
          nest: true,
        });
        if (!data) {
          data = [];
        }
        resolve({ errCode: 0, data: data });
      }
    } catch (error) {
      reject(error);
    }
  });
};
let sendRemedy = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (
        !data.email ||
        !data.doctorId ||
        !data.patientId ||
        !data.timeType ||
        !data.imgBase64
      ) {
        resolve({
          errCode: 1,
          errMessage: "Missing required parameters",
        });
      } else {
        // Update the booking status to S3 (sent remedy)
        let booking = await db.Booking.findOne({
          where: {
            patientId: data.patientId,
            doctorId: data.doctorId,
            timeType: data.timeType,
            statusId: "S2", // S2 is the status for confirmed appointments
          },
          raw: false,
        });
        if (booking) {
          booking.statusId = "S3"; // S3 is the status for sent remedy
          await booking.save();
        }
        await emailService.sendAttachmentEmail(data);
        resolve({
          errCode: 0,
          errMessage: "Send remedy successfully",
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
  bulkCreateSchedule,
  getScheduleDoctorByDate,
  getExtraInfoDoctorById,
  getProfileDoctorById,
  getListPatientForDoctor,
  sendRemedy,
};
