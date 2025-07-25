import { where } from "sequelize";
import db from "../models/index";
require("dotenv").config();
import emailService from "./emailService";
import { v4 as uuidv4 } from "uuid";
import { raw } from "body-parser";

let buildUrlEmail = (doctorId, token) => {
  let result = `${process.env.URL_REACT}/verify-booking?token=${token}&doctorId=${doctorId}`;
  return result;
};
let postBookAppointment = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (
        !data.email ||
        !data.doctorId ||
        !data.date ||
        !data.timeType ||
        !data.fullName ||
        !data.selectedGender ||
        !data.address
      ) {
        return resolve({
          errCode: 1,
          errMessage: "Missing required parameters",
        });
      }

      let token = uuidv4();
      await emailService.sendSimpleEmail({
        receiverEmail: data.email,
        patientName: data.fullName,
        time: data.timeString,
        doctorName: data.doctorName,
        language: data.language,
        redirectLink: buildUrlEmail(data.doctorId, token),
      });

      // Tìm hoặc tạo user mới
      let [user] = await db.User.findOrCreate({
        where: { email: data.email },
        defaults: {
          email: data.email,
          roleId: "R3",
          address: data.address,
          gender: data.selectedGender,
          firstName: data.fullName,
        },
      });

      // Luôn tạo mới booking (cho phép nhiều lịch với cùng email)
      await db.Booking.create({
        statusId: "S1",
        doctorId: data.doctorId,
        patientId: user.id,
        date: data.date,
        timeType: data.timeType,
        token: token,
        patientName: data.fullName, // nên thêm cột này để phân biệt ai đi khám
      });

      resolve({
        errCode: 0,
        errMessage: "Save info patient success",
      });
    } catch (error) {
      reject(error);
    }
  });
};

let postVerifyBookAppointment = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.token || !data.doctorId) {
        resolve({
          errCode: 1,
          errMessage: "Missing required parameters",
        });
      } else {
        let appointment = await db.Booking.findOne({
          where: {
            doctorId: data.doctorId,
            token: data.token,
            statusId: "S1",
          },
          raw: false,
        });
        if (appointment) {
          appointment.statusId = "S2";
          await appointment.save();
          resolve({
            errCode: 0,
            errMessage: "Update the apppointment succeed!",
          });
        } else {
          resolve({
            errCode: 2,
            errMessage: "Apppointment has been activated or does not exist",
          });
        }
      }
    } catch (error) {
      reject(error);
    }
  });
};
module.exports = {
  postBookAppointment: postBookAppointment,
  postVerifyBookAppointment: postVerifyBookAppointment,
};
