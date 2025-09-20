import { raw } from "body-parser";
import db from "../models/index";
import { where } from "sequelize";
require("dotenv").config();
const moment = require("moment-timezone");
import _, { includes, reject } from "lodash";
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
          doctorInfo.note = data.note;
          doctorInfo.specialtyId = data.specialtyId;
          await doctorInfo.save();
        } else {
          await db.Doctor_Info.create({
            doctorId: data.doctorId,
            priceId: data.selectedPrice,
            provinceId: data.selectedProvince,
            paymentId: data.paymentId,
            note: data.note,
            specialtyId: data.specialtyId,
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
            statusId: ["S2"], // Thêm S3
            doctorId: doctorId,
            date: date,
          },
          include: [
            {
              model: db.User,
              as: "patientData",
              attributes: [
                "firstName",
                "address",
                "email",
                "gender",
                "phonenumber",
              ],
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

        if (!data) data = [];
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
      const { email, doctorId, patientId, timeType, type } = data;

      // Validate các trường bắt buộc
      if (!email || !doctorId || !patientId || !timeType || !type) {
        return resolve({
          errCode: 1,
          errMessage: "Missing required parameters",
        });
      }

      // Validate theo loại đơn thuốc
      if (type === "image") {
        if (
          !data.imgBase64List ||
          !Array.isArray(data.imgBase64List) ||
          data.imgBase64List.length === 0
        ) {
          return resolve({
            errCode: 1,
            errMessage: "Missing image data",
          });
        }
      } else if (type === "manual") {
        if (
          !data.medicines ||
          !Array.isArray(data.medicines) ||
          data.medicines.length === 0 ||
          !data.initialDiagnosis ||
          !data.conclusion
        ) {
          return resolve({
            errCode: 1,
            errMessage: "Missing manual remedy data",
          });
        }

        // Validate từng thuốc trong đơn
        const isValidMedicines = data.medicines.every((med) => {
          return med.name && med.quantity && med.unit && med.time;
        });

        if (!isValidMedicines) {
          return resolve({
            errCode: 1,
            errMessage:
              "Each medicine must have name, quantity, unit, and time",
          });
        }
      }

      // Tìm booking đang chờ xác nhận (statusId = S2)
      let booking = await db.Booking.findOne({
        where: {
          patientId,
          doctorId,
          timeType,
          statusId: "S2",
        },
        raw: false,
      });

      if (booking) {
        booking.statusId = "S3"; // Đã gửi đơn thuốc
        await booking.save();
      }

      // Gửi email đơn thuốc
      await emailService.sendAttachmentEmail(data);

      // Lưu vào bảng History
      await db.History.create({
        bookingId: booking.id,
        patientId: patientId,
        doctorId: doctorId,
        type: type,
        description: "", // Có thể mở rộng nội dung mô tả thêm nếu muốn
        initialDiagnosis: data.initialDiagnosis || "",
        conclusion: data.conclusion || "",
        medicines: type === "manual" ? JSON.stringify(data.medicines) : null,
        images: type === "image" ? JSON.stringify(data.imgBase64List) : null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return resolve({
        errCode: 0,
        errMessage: "Send remedy successfully",
      });
    } catch (error) {
      return reject(error);
    }
  });
};
let getRemedyByBooking = async (data) => {
  try {
    const { bookingId } = data;

    if (!bookingId) {
      return {
        errCode: 1,
        errMessage: "Missing bookingId",
      };
    }

    let booking = await db.Booking.findOne({
      where: { id: bookingId, statusId: "S3" }, // chỉ lấy nếu đã khám
      include: [
        {
          model: db.History,
          as: "historyData", // alias đã khai báo trong association
        },
      ],
      raw: false,
      nest: true,
    });

    if (!booking || !booking.historyData) {
      return {
        errCode: 2,
        errMessage: "Remedy not found",
      };
    }

    return {
      errCode: 0,
      data: booking.historyData,
    };
  } catch (e) {
    console.error(e);
    return {
      errCode: -1,
      errMessage: "Error from server",
    };
  }
};

let deleteScheduleDoctorById = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { doctorId, date, timeType } = data;

      if (!doctorId || !date || !timeType) {
        return resolve({
          errCode: 1,
          errMessage: "Missing required parameters",
        });
      }

      await db.Schedule.destroy({
        where: {
          doctorId,
          date,
          timeType,
        },
      });

      return resolve({
        errCode: 0,
        errMessage: "Deleted schedule successfully",
      });
    } catch (e) {
      reject(e);
    }
  });
};
let cancelAppointmentByDoctor = async (data) => {
  try {
    let { doctorId, patientId, timeType, date, reason } = data;

    let appointment = await db.Booking.findOne({
      where: {
        doctorId: doctorId,
        patientId: patientId,
        timeType: timeType,
        date: date,
        statusId: "S2",
      },
      raw: false,
    });

    if (!appointment) {
      return {
        errCode: 2,
        errMessage: "Appointment not found or already canceled",
      };
    }

    appointment.statusId = "S4";
    appointment.reason = reason || null;
    await appointment.save();

    // Optional: Gửi email thông báo cho bệnh nhân nếu muốn
    // const patient = await db.User.findOne({ where: { id: patientId } });
    // await emailService.sendCancellationEmail(...);

    return {
      errCode: 0,
      errMessage: "Cancel appointment successfully",
    };
  } catch (e) {
    console.log("Error in cancelAppointmentByDoctor:", e);
    return {
      errCode: -1,
      errMessage: "Error from server",
    };
  }
};
const getHistoryAppointment = async (doctorId) => {
  try {
    if (!doctorId) return { errCode: 1, errMessage: "Missing doctorId" };

    const appointments = await db.Booking.findAll({
      where: {
        doctorId: doctorId,
        statusId: ["S3", "S4"],
      },
      include: [
        {
          model: db.User,
          as: "patientData",
          attributes: [
            "firstName",
            "lastName",
            "email",
            "address",
            "gender",
            "phonenumber",
          ],
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

    return {
      errCode: 0,
      data: appointments,
    };
  } catch (error) {
    console.error("Error in getHistoryAppointment:", error);
    throw error;
  }
};
let deleteAppointment = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.doctorId || !data.patientId || !data.timeType || !data.date) {
        return resolve({
          errCode: 1,
          errMessage: "Missing required parameters",
        });
      }

      let booking = await db.Booking.findOne({
        where: {
          doctorId: data.doctorId,
          patientId: data.patientId,
          timeType: data.timeType,
          date: data.date,
        },
        raw: false,
      });

      if (!booking) {
        return resolve({
          errCode: 2,
          errMessage: "Không tìm thấy lịch khám",
        });
      }

      await booking.destroy();

      resolve({
        errCode: 0,
        errMessage: "Xóa lịch khám thành công",
      });
    } catch (e) {
      reject(e);
    }
  });
};

const getRevenue = async (doctorId, date, type = "date") => {
  try {
    if (!doctorId || !date || !["date", "month", "year"].includes(type)) {
      return {
        errCode: 1,
        errMessage: "Missing or invalid parameters",
      };
    }

    // Lấy thông tin bác sĩ + giá tiền
    const doctorInfo = await db.Doctor_Info.findOne({
      where: { doctorId: parseInt(doctorId) },
      include: [
        {
          model: db.Allcode,
          as: "priceTypeData",
          attributes: ["valueVi"],
        },
      ],
      raw: true,
      nest: true,
    });

    if (!doctorInfo || !doctorInfo.priceTypeData?.valueVi) {
      return { errCode: 2, errMessage: "Doctor or pricing not found" };
    }

    const priceString = doctorInfo.priceTypeData.valueVi.toString();
    const numericPrice = parseFloat(priceString.replace(/[^\d]/g, "")) || 0;

    // Tạo mốc thời gian theo múi giờ Việt Nam
    const inputDate = moment.tz(parseInt(date), "Asia/Ho_Chi_Minh");
    let startDate, endDate;
    if (type === "month") {
      startDate = inputDate
        .clone()
        .tz("Asia/Ho_Chi_Minh", true)
        .startOf("month")
        .valueOf();
      endDate = inputDate
        .clone()
        .tz("Asia/Ho_Chi_Minh", true)
        .endOf("month")
        .valueOf();
    } else if (type === "year") {
      startDate = inputDate
        .clone()
        .tz("Asia/Ho_Chi_Minh", true)
        .startOf("year")
        .valueOf();
      endDate = inputDate
        .clone()
        .tz("Asia/Ho_Chi_Minh", true)
        .endOf("year")
        .valueOf();
    } else {
      startDate = inputDate
        .clone()
        .tz("Asia/Ho_Chi_Minh", true)
        .startOf("day")
        .valueOf();
      endDate = inputDate
        .clone()
        .tz("Asia/Ho_Chi_Minh", true)
        .endOf("day")
        .valueOf();
    }

    // Lấy các lịch đã khám thành công (S3) trong khoảng thời gian
    const bookings = await db.Booking.findAll({
      where: {
        doctorId: parseInt(doctorId),
        statusId: "S3",
        date: {
          [db.Sequelize.Op.between]: [startDate, endDate],
        },
      },
    });

    const totalAppointments = bookings.length;
    const totalRevenue = totalAppointments * numericPrice;

    return {
      errCode: 0,
      data: {
        totalAppointments,
        totalRevenue,
        pricePerAppointment: numericPrice,
        currency: "VND",
      },
    };
  } catch (error) {
    console.error("Revenue calculation error:", error);
    return {
      errCode: -1,
      errMessage: "Internal server error. Please try again later.",
    };
  }
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
  deleteScheduleDoctorById,
  cancelAppointmentByDoctor,
  getHistoryAppointment,
  deleteAppointment,
  getRevenue,
  getRemedyByBooking,
};
